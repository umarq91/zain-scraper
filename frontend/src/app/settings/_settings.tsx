"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import type { Product, UserSettings } from "@/types";

const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

type Msg = { type: "success" | "error"; text: string };

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<UserSettings>({ email_to: "", interval_minutes: 5 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<Msg | null>(null);
  const [newUrl, setNewUrl] = useState("");
  const [newUrlSizes, setNewUrlSizes] = useState<string[]>(["M", "L"]);
  const [addingProduct, setAddingProduct] = useState(false);

  const load = useCallback(async () => {
    const [pRes, sRes] = await Promise.all([
      fetch("/api/products"),
      fetch("/api/settings"),
    ]);
    if (pRes.ok) setProducts(await pRes.json());
    if (sRes.ok) setSettings(await sRes.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function saveSettings() {
    setSaving(true);
    setMsg(null);
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    setMsg(
      res.ok
        ? { type: "success", text: "Settings saved." }
        : { type: "error", text: "Failed to save settings." }
    );
  }

  async function addProduct() {
    const url = newUrl.trim();
    if (!url) return;
    setAddingProduct(true);
    setMsg(null);
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, watch_sizes: newUrlSizes }),
    });
    if (res.ok) {
      const added = await res.json();
      setProducts((prev) => [...prev, added]);
      setNewUrl("");
      setNewUrlSizes(["M", "L"]);
    } else {
      const json = await res.json();
      setMsg({ type: "error", text: json.error ?? "Failed to add product." });
    }
    setAddingProduct(false);
  }

  async function removeProduct(id: string) {
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  async function toggleProductSize(product: Product, size: string) {
    const next = product.watch_sizes.includes(size)
      ? product.watch_sizes.filter((s) => s !== size)
      : [...product.watch_sizes, size];

    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, watch_sizes: next } : p))
    );

    await fetch(`/api/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ watch_sizes: next }),
    });
  }

  function toggleNewSize(size: string) {
    setNewUrlSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">Settings</h1>
        <div className="flex items-center gap-3">
          <Link href="/" className="text-sm text-blue-600 hover:underline">
            ← Dashboard
          </Link>
          <button
            onClick={signOut}
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        {loading ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : (
          <div className="space-y-10">
            {/* Alert email */}
            <section>
              <h2 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                Alert Email
              </h2>
              <p className="text-xs text-gray-500 mb-3">
                Stock-in alerts are sent to this address.
              </p>
              <input
                type="email"
                value={settings.email_to}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, email_to: e.target.value }))
                }
                placeholder="you@example.com"
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
            </section>

            {/* Check interval */}
            <section>
              <h2 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                Check Interval
              </h2>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={5}
                  max={120}
                  value={settings.interval_minutes}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      interval_minutes: Number(e.target.value),
                    }))
                  }
                  className="w-20 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <span className="text-sm text-gray-500">
                  minutes{" "}
                  <span className="text-gray-400">(min 5 — GitHub Actions limit)</span>
                </span>
              </div>
            </section>

            {msg && (
              <div
                className={`px-4 py-2.5 rounded-lg text-sm ${
                  msg.type === "success"
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {msg.text}
              </div>
            )}

            <button
              onClick={saveSettings}
              disabled={saving}
              className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 text-sm font-medium transition-colors"
            >
              {saving ? "Saving…" : "Save Settings"}
            </button>

            {/* Products */}
            <section>
              <h2 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                Products
              </h2>

              <div className="space-y-3 mb-5">
                {products.length === 0 && (
                  <p className="text-sm text-gray-400">No products added yet.</p>
                )}
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white border border-gray-200 rounded-xl px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className="text-xs text-gray-600 font-mono truncate flex-1">
                        {product.url}
                      </span>
                      <button
                        onClick={() => removeProduct(product.id)}
                        className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors text-base leading-none"
                      >
                        ×
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {ALL_SIZES.map((size) => {
                        const active = product.watch_sizes.includes(size);
                        return (
                          <button
                            key={size}
                            onClick={() => toggleProductSize(product, size)}
                            className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                              active
                                ? "bg-gray-900 text-white border-gray-900"
                                : "bg-white text-gray-500 border-gray-300 hover:border-gray-500"
                            }`}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add new product */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4">
                <p className="text-xs font-medium text-gray-700 mb-3">Add product</p>
                <input
                  type="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addProduct()}
                  placeholder="https://zaibonline.com/products/..."
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
                />
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {ALL_SIZES.map((size) => {
                    const active = newUrlSizes.includes(size);
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => toggleNewSize(size)}
                        className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                          active
                            ? "bg-gray-900 text-white border-gray-900"
                            : "bg-white text-gray-500 border-gray-300 hover:border-gray-500"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={addProduct}
                  disabled={addingProduct || !newUrl.trim()}
                  className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
                >
                  {addingProduct ? "Adding…" : "Add Product"}
                </button>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
