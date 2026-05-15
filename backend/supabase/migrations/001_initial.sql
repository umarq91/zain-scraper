-- user_settings: per-user alert email and check interval
CREATE TABLE user_settings (
  user_id       UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email_to      TEXT NOT NULL DEFAULT '',
  interval_minutes INTEGER NOT NULL DEFAULT 5,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_settings" ON user_settings
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- products: per-user products, each with its own watched sizes
CREATE TABLE products (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  handle      TEXT NOT NULL,
  watch_sizes TEXT[] NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, url)
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_products" ON products
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- product_state: live stock state per product per size
CREATE TABLE product_state (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id   UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size         TEXT NOT NULL,
  available    BOOLEAN NOT NULL DEFAULT FALSE,
  last_checked TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(product_id, size)
);

ALTER TABLE product_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_product_state" ON product_state
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_state.product_id
        AND products.user_id = auth.uid()
    )
  );

-- auto-create user_settings row on signup, defaulting email_to to auth email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_settings(user_id, email_to)
  VALUES (NEW.id, COALESCE(NEW.email, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
