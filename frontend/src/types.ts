export type Config = {
  products: string[];
  watchSizes: string[];
  intervalMinutes: number;
};

export type StockState = {
  [handle: string]: {
    [size: string]: boolean;
  };
};

export type ProductStock = {
  url: string;
  handle: string;
  name: string;
  sizes: { [size: string]: boolean | null };
};

export type DashboardData = {
  products: ProductStock[];
  watchSizes: string[];
  intervalMinutes: number;
};
