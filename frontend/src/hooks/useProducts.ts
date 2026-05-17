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
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [productErrors, setProductErrors] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    ProductModel.list()
      .then((data) => setProducts(sortProducts(data)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function clearError(id: string) {
    setProductErrors((prev) => { const next = new Map(prev); next.delete(id); return next; });
  }

  async function addProduct(payload: CreatePayload): Promise<Product> {
    const added = await ProductModel.create(payload);
    setProducts((prev) => [...prev, added]);
    return added;
  }

  async function removeProduct(id: string) {
    setRemovingIds((prev) => new Set([...prev, id]));
    clearError(id);
    try {
      await ProductModel.remove(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      setProductErrors((prev) => new Map([...prev, [id, "Couldn't remove this product. Check your connection and try again."]]));
    } finally {
      setRemovingIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
    }
  }

  async function updateProduct(id: string, patch: UpdatePatch) {
    const snapshot = products.find((p) => p.id === id);
    setProducts((prev) => sortProducts(prev.map((p) => (p.id === id ? { ...p, ...patch } : p))));
    setSavingIds((prev) => new Set([...prev, id]));
    clearError(id);
    try {
      await ProductModel.update(id, patch);
      setSavedIds((prev) => new Set([...prev, id]));
      setTimeout(() => {
        setSavedIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
      }, 2500);
    } catch {
      if (snapshot) setProducts((prev) => sortProducts(prev.map((p) => (p.id === id ? snapshot : p))));
      setProductErrors((prev) => new Map([...prev, [id, "Couldn't save your changes. Check your connection and try again."]]));
    } finally {
      setSavingIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
    }
  }

  return {
    products,
    loading,
    addProduct,
    removeProduct,
    updateProduct,
    removingIds,
    savingIds,
    savedIds,
    productErrors,
  };
}
