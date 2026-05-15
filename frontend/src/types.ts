export type UserSettings = {
  email_to: string;
};

export type Product = {
  id: string;
  url: string;
  handle: string;
  watch_sizes: string[];
  created_at?: string;
};

export type ProductWithState = Product & {
  name: string;
  sizes: { [size: string]: boolean | null };
};

export type DashboardData = {
  products: ProductWithState[];
};
