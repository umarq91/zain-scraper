export const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;
export type Size = (typeof ALL_SIZES)[number];
