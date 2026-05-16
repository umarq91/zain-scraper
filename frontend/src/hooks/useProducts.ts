"use client";

import { useState, useEffect } from "react";
import { ProductModel } from "@/models/ProductModel";
import type { Product } from "@/types";

type CreatePayload = Parameters<typeof ProductModel.create>[0];
type UpdatePatch = Parameters<typeof ProductModel.update>[1];

function sortProducts(list: Product[]): Product[] {
  return [...list].sort((a, b) => {
    if (a.is_paused !== b.is_paused) return a.is_paused ? 1 : -1;
    return 0;
  });
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ProductModel.list()
      .then((data) => setProducts(sortProducts(data)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function addProduct(payload: CreatePayload): Promise<Product> {
    const added = await ProductModel.create(payload);
    setProducts((prev) => [...prev, added]);
    return added;
  }

  async function removeProduct(id: string) {
    await ProductModel.remove(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  async function updateProduct(id: string, patch: UpdatePatch) {
    setProducts((prev) => sortProducts(prev.map((p) => (p.id === id ? { ...p, ...patch } : p))));
    await ProductModel.update(id, patch);
  }

  return { products, loading, addProduct, removeProduct, updateProduct };
}
