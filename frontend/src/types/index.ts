export type UserSettings = {
  email_to: string;
  interval_minutes: number;
};

export type Product = {
  id: string;
  url: string;
  handle: string;
  watch_sizes: string[];
  image_url?: string | null;
  is_paused: boolean;
  notify_mode: "once" | "always";
  watch_price: boolean;
  last_known_price: number | null;         // cents
  last_known_compare_price: number | null; // cents, original price if on sale
  created_at?: string;
};

export type ProductWithState = Product & {
  name: string;
  image_url: string | null;
  sizes: Record<string, boolean | null>;
  last_checked_at: string | null;
  last_known_price: number | null;
  last_known_compare_price: number | null;
};

export type DashboardData = {
  products: ProductWithState[];
  interval_minutes: number;
};
