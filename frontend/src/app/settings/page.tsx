"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Config } from "@/types";

const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

type Msg = { type: "success" | "error"; text: string };

export default function SettingsPage() {
  const [config, setConfig] = useState<Config>({
    products: [],
    watchSizes: ["M", "L"],
    intervalMinutes: 5,
  });
  const [sha, setSha] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<Msg | null>(null);
  const [newUrl, setNewUrl] = useState("");

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((d) => {
        if (d.data) setConfig(d.data);
        if (d.sha) setSha(d.sha);
      })
      .catch(() => setMsg({ type: "error", text: "Failed to load config." }))
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config, sha }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setSha(json.sha);
      setMsg({ type: "success", text: "Saved! Next workflow run uses these settings." });
    } catch (e) {
      setMsg({ type: "error", text: e instanceof Error ? e.message : String(e) });
    } finally {
      setSaving(false);
    }
  }

  function addProduct() {
    const url = newUrl.trim();
    if (!url || config.products.includes(url)) return;
    setConfig((c) => ({ ...c, products: [...c.products, url] }));
    setNewUrl("");
  }

  function removeProduct(url: string) {
    setConfig((c) => ({ ...c, products: c.products.filter((p) => p !== url) }));
  }

  function toggleSize(size: string) {
    setConfig((c) => ({
      ...c,
      watchSizes: c.watchSizes.includes(size)
        ? c.watchSizes.filter((s) => s !== size)
        : [...c.watchSizes, size],
    }));
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">Settings</h1>
        <Link href="/" className="text-sm text-blue-600 hover:underline">
          ← Dashboard
        </Link>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        {loading ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : (
          <div className="space-y-8">
            {/* Products */}
            <section>
              <h2 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                Products
              </h2>
              <div className="space-y-2 mb-3">
                {config.products.length === 0 && (
                  <p className="text-sm text-gray-400">No products added yet.</p>
                )}
                {config.products.map((url) => (
                  <div
                    key={url}
                    className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2"
                  >
                    <span className="flex-1 text-xs text-gray-600 truncate font-mono">{url}</span>
                    <button
                      onClick={() => removeProduct(url)}
                      className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addProduct()}
                  placeholder="https://zaibonline.com/products/..."
                  className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <button
                  onClick={addProduct}
                  className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Add
                </button>
              </div>
            </section>

            {/* Sizes */}
            <section>
              <h2 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                Watch Sizes
              </h2>
              <div className="flex flex-wrap gap-2">
                {ALL_SIZES.map((size) => {
                  const active = config.watchSizes.includes(size);
                  return (
                    <button
                      key={size}
                      onClick={() => toggleSize(size)}
                      className={`px-4 py-2 text-sm font-medium rounded-full border transition-colors ${
                        active
                          ? "bg-gray-900 text-white border-gray-900"
                          : "bg-white text-gray-600 border-gray-300 hover:border-gray-500"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Interval */}
            <section>
              <h2 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                Check Interval
              </h2>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={5}
                  max={120}
                  value={config.intervalMinutes}
                  onChange={(e) =>
                    setConfig((c) => ({ ...c, intervalMinutes: Number(e.target.value) }))
                  }
                  className="w-20 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                <span className="text-sm text-gray-500">
                  minutes <span className="text-gray-400">(min 5 — GitHub Actions limit)</span>
                </span>
              </div>
            </section>

            {/* Save */}
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
              onClick={save}
              disabled={saving}
              className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 text-sm font-medium transition-colors"
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
