import type { Product } from "@/types";

type CreatePayload = {
  url: string;
  watch_sizes: string[];
  notify_mode: "once" | "always";
};

type UpdatePatch = Partial<Pick<Product, "watch_sizes" | "is_paused" | "notify_mode">>;

export class ProductModel {
  static async list(): Promise<Product[]> {
    const res = await fetch("/api/products");
    if (!res.ok) throw new Error("Failed to load products");
    return res.json();
  }

  static async create(payload: CreatePayload): Promise<Product> {
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? "Could not add product");
    return json;
  }

  static async update(id: string, patch: UpdatePatch): Promise<void> {
    const res = await fetch(`/api/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) throw new Error("Failed to update product");
  }

  static async remove(id: string): Promise<void> {
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to remove product");
  }
}
