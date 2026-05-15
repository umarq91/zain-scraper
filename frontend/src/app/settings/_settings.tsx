"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import type { Product, UserSettings } from "@/types";

const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

type Msg = { type: "success" | "error"; text: string };

function Bracket({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  const t = { tl: "", tr: "scaleX(-1)", bl: "scaleY(-1)", br: "scale(-1,-1)" }[
    pos
  ];
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 40 40"
      aria-hidden="true"
      style={{ display: "block", transform: t }}
    >
      <path
        d="M2 16 L2 2 L16 2"
        fill="none"
        stroke="#0A0A0A"
        strokeWidth="2.5"
      />
    </svg>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span
        className="font-display italic font-bold text-paper px-2 py-0.5 text-sm"
        style={{
          background: "var(--ink)",
          borderRadius: "2px",
          transform: "rotate(-0.4deg)",
          display: "inline-block",
        }}
      >
        {children}
      </span>
      <div className="flex-1 border-t border-grid-line" />
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<UserSettings>({ email_to: "" });
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

  useEffect(() => {
    load();
  }, [load]);

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
        ? { type: "success", text: "Saved successfully." }
        : { type: "error", text: "Could not save. Try again." },
    );
    if (res.ok) setTimeout(() => setMsg(null), 3000);
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
      setMsg({ type: "error", text: json.error ?? "Could not add product." });
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
      prev.map((p) => (p.id === product.id ? { ...p, watch_sizes: next } : p)),
    );
    await fetch(`/api/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ watch_sizes: next }),
    });
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-grid">
      {/* Add-product loading modal */}
      {addingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-ink opacity-70" />
          <div className="relative bg-paper-pure border border-ink shadow-hard-lg w-full max-w-sm p-8 z-10">
            <span className="absolute top-0 left-0 translate-x-[-1px] translate-y-[-1px] opacity-30"><Bracket pos="tl" /></span>
            <span className="absolute top-0 right-0 translate-x-[1px] translate-y-[-1px] opacity-30"><Bracket pos="tr" /></span>

            {/* Animated squares */}
            <div className="flex gap-1.5 mb-6">
              <span className="w-2.5 h-2.5 bg-accent animate-bounce [animation-delay:0ms]" />
              <span className="w-2.5 h-2.5 bg-accent animate-bounce [animation-delay:150ms]" />
              <span className="w-2.5 h-2.5 bg-accent animate-bounce [animation-delay:300ms]" />
            </div>

            <p className="font-display font-bold text-ink mb-1" style={{ fontSize: "1.2rem", letterSpacing: "-0.01em" }}>
              Fetching product…
            </p>
            <p className="font-body text-sm text-ink-soft mb-5">
              We&apos;re grabbing the product info and image. This takes a few seconds.
            </p>
            <p className="font-mono text-[0.6rem] text-ink-soft opacity-50 truncate border-t border-grid-line pt-3">
              {newUrl}
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <header
        className="bg-paper-pure border-b border-ink sticky top-0 z-20"
        style={{ boxShadow: "0 2px 0 #0A0A0A" }}
      >
        <div className="max-w-3xl mx-auto px-6 flex items-stretch">
          <div className="py-4 flex items-center gap-2">
            <Link
              href="/"
              className="font-mono text-[0.6rem] tracking-widest uppercase text-ink-soft hover:text-accent transition-colors"
            >
              ← Dashboard
            </Link>
            <span className="text-grid-line mx-2">·</span>
            <span
              className="font-display font-bold text-ink"
              style={{ fontSize: "1.1rem", letterSpacing: "-0.01em" }}
            >
              My Alerts & Products
            </span>
          </div>
          <div className="ml-auto flex items-center">
            <button
              onClick={signOut}
              className="h-full px-5 font-mono text-[0.6rem] tracking-widest uppercase border-l border-ink text-ink-soft hover:text-ink transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        {loading ? (
          <div className="space-y-6">
            {[0, 1, 2].map((i) => (
              <div key={i} className="bg-paper-pure border border-ink p-6 shadow-hard-sm space-y-4">
                <div className="h-4 w-32 bg-grid-line animate-pulse" />
                <div className="h-3 w-full bg-grid-line animate-pulse" />
                <div className="h-3 w-4/5 bg-grid-line animate-pulse" />
                <div className="h-10 w-full bg-grid-line animate-pulse mt-2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {/* === SECTION: Add New Product === */}
            <section className="bg-paper-pure border border-ink p-6 shadow-hard-sm">
              <SectionLabel>Watch a New Product</SectionLabel>
              <p className="font-body text-sm text-ink-soft mb-5">
                Paste the link to any product page. Pick the sizes you want —
                we&apos;ll alert you the moment one of them comes back in stock.
              </p>

              <div
                className="relative bg-paper-pure border border-ink p-6"
                style={{ boxShadow: "4px 4px 0 var(--accent)" }}
              >
                <span className="absolute top-0 left-0 translate-x-[-1px] translate-y-[-1px] opacity-30">
                  <Bracket pos="tl" />
                </span>
                <span className="absolute top-0 right-0 translate-x-[1px] translate-y-[-1px] opacity-30">
                  <Bracket pos="tr" />
                </span>

                <div className="mb-4">
                  <label className="block font-mono text-[0.6rem] tracking-[0.1em] uppercase text-ink-soft mb-1.5">
                    Product URL
                  </label>
                  <input
                    type="url"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addProduct()}
                    placeholder="https://store.com/products/your-product"
                    className="w-full border border-ink bg-paper px-3 py-2.5 text-sm font-body focus-hard transition-shadow"
                  />
                </div>

                <div className="mb-5">
                  <p className="font-mono text-[0.6rem] tracking-[0.1em] uppercase text-ink-soft mb-2">
                    Alert me when these sizes are available:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {ALL_SIZES.map((size) => {
                      const active = newUrlSizes.includes(size);
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() =>
                            setNewUrlSizes((prev) =>
                              prev.includes(size)
                                ? prev.filter((s) => s !== size)
                                : [...prev, size],
                            )
                          }
                          className={`font-mono text-[0.65rem] tracking-widest uppercase px-3 py-1.5 border transition-all ${
                            active
                              ? "bg-accent text-paper border-accent shadow-hard-sm"
                              : "bg-paper-pure text-ink-soft border-grid-line hover:border-ink hover:text-ink"
                          }`}
                          style={
                            active
                              ? {
                                  transform: "rotate(-0.3deg)",
                                  borderRadius: "2px",
                                }
                              : {}
                          }
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={addProduct}
                  disabled={addingProduct || !newUrl.trim()}
                  className="px-6 py-3 bg-accent text-paper font-mono text-[0.65rem] tracking-[0.1em] uppercase disabled:opacity-40 shadow-hard-sm hover-lift"
                >
                  {addingProduct ? "Adding…" : "Start Watching →"}
                </button>
              </div>
            </section>

            {/* === SECTION: Alert Email === */}
            <section className="bg-paper-pure border border-ink p-6 shadow-hard-sm">
              <SectionLabel>Where to Send Your Alerts</SectionLabel>
              <p className="font-body text-sm text-ink-soft mb-4">
                When a size you&apos;re watching comes back in stock, we&apos;ll
                send you an email instantly — so you can grab it before it sells
                out again.
              </p>
              <div>
                <label className="block font-mono text-[0.6rem] tracking-[0.1em] uppercase text-ink-soft mb-1.5">
                  Your Email Address
                </label>
                <input
                  type="email"
                  value={settings.email_to}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, email_to: e.target.value }))
                  }
                  placeholder="you@example.com"
                  className="w-full border border-ink bg-paper px-3 py-2.5 text-sm font-body focus-hard transition-shadow max-w-sm"
                />
              </div>
            </section>

            {/* Save button */}
            <div className="px-1">
              {msg && (
                <div
                  className={`mb-4 px-4 py-2.5 border text-sm font-body ${
                    msg.type === "success"
                      ? "border-ink bg-accent-soft text-ink"
                      : "border-red-700 bg-red-50 text-red-700"
                  }`}
                >
                  {msg.text}
                </div>
              )}
              <button
                onClick={saveSettings}
                disabled={saving}
                className="px-7 py-3 bg-ink text-paper font-mono text-[0.65rem] tracking-[0.1em] uppercase disabled:opacity-50 shadow-hard-sm hover-lift"
              >
                {saving ? "Saving…" : "Save Changes →"}
              </button>
            </div>

            {/* === SECTION: Watched Products === */}
            <section className="bg-paper-pure border border-ink p-6 shadow-hard-sm">
              <SectionLabel>Products You&apos;re Watching</SectionLabel>

              {products.length === 0 ? (
                <p className="font-body text-sm text-ink-soft py-4">
                  You haven&apos;t added any products yet. Use the form below to
                  start tracking something.
                </p>
              ) : (
                <div className="space-y-4">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="relative bg-paper-pure border border-ink p-5 shadow-hard-sm"
                    >
                      <span className="absolute top-0 left-0 translate-x-[-1px] translate-y-[-1px] opacity-20">
                        <Bracket pos="tl" />
                      </span>

                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="min-w-0">
                          <p className="font-display font-semibold text-ink text-sm leading-tight mb-1">
                            {product.handle
                              .split("-")
                              .map(
                                (w) => w.charAt(0).toUpperCase() + w.slice(1),
                              )
                              .join(" ")}
                          </p>
                          <p className="font-mono text-[0.58rem] text-ink-soft opacity-50 truncate max-w-xs">
                            {product.url
                              .replace(/^https?:\/\//, "")
                              .replace(/\/products\/.*/, "")}
                          </p>
                        </div>
                        <button
                          onClick={() => removeProduct(product.id)}
                          className="flex-shrink-0 font-mono text-[0.6rem] tracking-widest uppercase text-ink-soft hover:text-red-600 border border-current px-2 py-1 transition-colors"
                        >
                          Remove
                        </button>
                      </div>

                      <div>
                        <p className="font-mono text-[0.55rem] tracking-[0.1em] uppercase text-ink-soft mb-2">
                          Alert me for these sizes:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {ALL_SIZES.map((size) => {
                            const active = product.watch_sizes.includes(size);
                            return (
                              <button
                                key={size}
                                onClick={() => toggleProductSize(product, size)}
                                className={`font-mono text-[0.65rem] tracking-widest uppercase px-3 py-1.5 border transition-all ${
                                  active
                                    ? "bg-ink text-paper border-ink shadow-hard-sm"
                                    : "bg-paper-pure text-ink-soft border-grid-line hover:border-ink hover:text-ink"
                                }`}
                                style={
                                  active ? { transform: "rotate(-0.3deg)" } : {}
                                }
                              >
                                {size}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
