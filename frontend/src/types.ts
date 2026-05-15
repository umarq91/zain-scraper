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
  created_at?: string;
};

export type ProductWithState = Product & {
  name: string;
  image_url: string | null;
  sizes: { [size: string]: boolean | null };
};

export type DashboardData = {
  products: ProductWithState[];
  interval_minutes: number;
};
