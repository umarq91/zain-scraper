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
  const [settings, setSettings] = useState<UserSettings>({ email_to: "", interval_minutes: 5 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<Msg | null>(null);
  const [addMode, setAddMode] = useState<"single" | "bulk">("single");
  const [newUrl, setNewUrl] = useState("");
  const [newUrlSizes, setNewUrlSizes] = useState<string[]>(["M", "L"]);
  const [newUrlNotifyMode, setNewUrlNotifyMode] = useState<"once" | "always">("once");
  const [addingProduct, setAddingProduct] = useState(false);
  const [bulkInput, setBulkInput] = useState("");
  const [bulkUrls, setBulkUrls] = useState<string[]>([]);
  const [bulkSizes, setBulkSizes] = useState<string[]>(["M", "L"]);
  const [bulkNotifyMode, setBulkNotifyMode] = useState<"once" | "always">("once");
  const [bulkProgress, setBulkProgress] = useState<{ done: number; total: number; current: string } | null>(null);
  const [bulkResult, setBulkResult] = useState<{ added: number; failed: string[] } | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const load = useCallback(async () => {
    const [pRes, sRes, { data: { user } }] = await Promise.all([
      fetch("/api/products"),
      fetch("/api/settings"),
      supabase.auth.getUser(),
    ]);
    if (pRes.ok) setProducts(await pRes.json());
    if (sRes.ok) {
      const s = await sRes.json();
      setSettings({ email_to: s.email_to || user?.email || "", interval_minutes: s.interval_minutes ?? 5 });
    } else if (user?.email) {
      setSettings({ email_to: user.email, interval_minutes: 5 });
    }
    setLoading(false);
  }, [supabase]);

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
      body: JSON.stringify({ url, watch_sizes: newUrlSizes, notify_mode: newUrlNotifyMode }),
    });
    if (res.ok) {
      const added = await res.json();
      setProducts((prev) => [...prev, added]);
      setNewUrl("");
      setNewUrlSizes(["M", "L"]);
      setNewUrlNotifyMode("once");
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

  function addToBulkQueue() {
    const url = bulkInput.trim();
    if (!url) return;
    if (bulkUrls.includes(url)) { setBulkInput(""); return; }
    setBulkUrls((prev) => [...prev, url]);
    setBulkInput("");
    setBulkResult(null);
  }

  function removeFromBulkQueue(index: number) {
    setBulkUrls((prev) => prev.filter((_, i) => i !== index));
  }

  async function addProductsBulk() {
    if (!bulkUrls.length) return;
    setBulkResult(null);
    setBulkProgress({ done: 0, total: bulkUrls.length, current: bulkUrls[0] });

    let added = 0;
    const failed: string[] = [];

    for (let i = 0; i < bulkUrls.length; i++) {
      setBulkProgress({ done: i, total: bulkUrls.length, current: bulkUrls[i] });
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: bulkUrls[i], watch_sizes: bulkSizes, notify_mode: bulkNotifyMode }),
      });
      if (res.ok) {
        const p = await res.json();
        setProducts((prev) => [...prev, p]);
        added++;
      } else {
        failed.push(bulkUrls[i]);
      }
    }

    setBulkProgress(null);
    setBulkResult({ added, failed });
    setBulkUrls(failed);
  }

  async function togglePause(product: Product) {
    const next = !product.is_paused;
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, is_paused: next } : p)),
    );
    await fetch(`/api/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_paused: next }),
    });
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-grid">
      {/* Alert Settings Drawer */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setDrawerOpen(false)}
        >
          <div className="absolute inset-0 bg-ink opacity-50" />
        </div>
      )}
      <div
        className="fixed top-0 right-0 bottom-0 z-50 flex flex-col border-l border-ink bg-paper-pure"
        style={{
          width: 340,
          transform: drawerOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.22s cubic-bezier(0.4,0,0.2,1)",
          boxShadow: drawerOpen ? "-6px 0 0 #0A0A0A" : "none",
        }}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 flex-shrink-0 border-b border-ink">
          <span
            className="font-display italic font-bold text-paper px-2 py-0.5 text-sm"
            style={{ background: "var(--ink)", borderRadius: "2px", transform: "rotate(-0.4deg)", display: "inline-block" }}
          >
            Alert Settings
          </span>
          <button
            onClick={() => setDrawerOpen(false)}
            className="font-mono text-xl leading-none text-ink-soft hover:text-ink transition-colors"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Drawer body */}
        <div className="flex-1 overflow-y-auto px-5 py-6">
          <p className="font-body text-sm text-ink-soft mb-6">
            We&apos;ll email you the moment a watched size comes back in stock. Defaults to your account email.
          </p>

          <div className="mb-5">
            <label className="block font-mono text-[0.6rem] tracking-[0.1em] uppercase text-ink-soft mb-1.5">
              Alert Email
            </label>
            <input
              type="email"
              value={settings.email_to}
              onChange={(e) => setSettings((s) => ({ ...s, email_to: e.target.value }))}
              placeholder="you@example.com"
              className="w-full border border-ink bg-paper px-3 py-2.5 text-sm font-body focus-hard transition-shadow"
            />
          </div>

          <div className="mb-6">
            <label className="block font-mono text-[0.6rem] tracking-[0.1em] uppercase text-ink-soft mb-1.5">
              Check Interval
            </label>
            <div className="grid grid-cols-3 gap-0 border border-ink overflow-hidden">
              {[1, 2, 5, 10, 15, 30].map((min) => {
                const active = settings.interval_minutes === min;
                return (
                  <button
                    key={min}
                    type="button"
                    onClick={() => setSettings((s) => ({ ...s, interval_minutes: min }))}
                    className={`font-mono text-[0.6rem] tracking-[0.06em] uppercase py-2 border-b border-r border-ink transition-colors last:border-r-0 ${
                      active ? "bg-ink text-paper" : "text-ink-soft hover:text-ink bg-paper-pure"
                    }`}
                  >
                    {min} min
                  </button>
                );
              })}
            </div>
            <p className="font-mono text-[0.52rem] text-ink-soft opacity-40 mt-1.5">
              How often we check your products for size availability
            </p>
          </div>

          <button
            onClick={saveSettings}
            disabled={saving}
            className="w-full py-3 font-mono text-[0.65rem] tracking-[0.1em] uppercase disabled:opacity-40 bg-ink text-paper shadow-hard-sm hover-lift transition-colors"
          >
            {saving ? "Saving…" : "Save Settings →"}
          </button>

          {msg && (
            <div
              className={`mt-4 px-3 py-2.5 text-xs font-body border ${
                msg.type === "success"
                  ? "border-ink bg-accent-soft text-ink"
                  : "border-red-700 bg-red-50 text-red-700"
              }`}
            >
              {msg.text}
            </div>
          )}
        </div>

        {/* Drawer footer */}
        <div className="px-5 py-4 flex-shrink-0 border-t border-grid-line">
          <p className="font-mono text-[0.55rem] tracking-widest uppercase text-ink-soft opacity-30">
            StockWatch · Alert Settings
          </p>
        </div>
      </div>

      {/* Add-product loading modal (single mode only) */}
      {addingProduct && addMode === "single" && (
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
          <div className="space-y-8">
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
          <div className="space-y-8">
            {/* === SECTION 1: Add New Product === */}
            {/* Accent top border + heavy shadow = primary action section */}
            <section
              className="bg-paper-pure border border-ink p-6 shadow-hard-lg"
              style={{ borderTop: "3px solid var(--accent)" }}
            >
              <SectionLabel>Watch a New Product</SectionLabel>

              {/* Mode tabs */}
              <div className="flex mb-5 border border-ink w-fit">
                {(["single", "bulk"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => { setAddMode(m); setBulkResult(null); }}
                    className={`font-mono text-[0.6rem] tracking-[0.1em] uppercase px-4 py-2 transition-colors ${
                      addMode === m
                        ? "bg-ink text-paper"
                        : "text-ink-soft hover:text-ink"
                    }`}
                  >
                    {m === "single" ? "Single" : "Bulk"}
                  </button>
                ))}
              </div>

              {addMode === "single" ? (
                /* ── Single product form ── */
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
                            style={active ? { transform: "rotate(-0.3deg)", borderRadius: "2px" } : {}}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Notify mode */}
                  <div className="flex items-center gap-3 mb-5">
                    <p className="font-mono text-[0.6rem] tracking-[0.1em] uppercase text-ink-soft flex-shrink-0">
                      Notify me
                    </p>
                    <div className="flex border border-ink overflow-hidden">
                      {(["once", "always"] as const).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setNewUrlNotifyMode(mode)}
                          className={`font-mono text-[0.6rem] tracking-[0.08em] uppercase px-3 py-1.5 transition-colors ${
                            newUrlNotifyMode === mode
                              ? "bg-ink text-paper"
                              : "text-ink-soft hover:text-ink"
                          }`}
                        >
                          {mode === "once" ? "Once" : `Every ${settings.interval_minutes} min`}
                        </button>
                      ))}
                    </div>
                    <p className="font-mono text-[0.52rem] text-ink-soft opacity-40">
                      {newUrlNotifyMode === "once" ? "One alert per restock" : `Alert every ${settings.interval_minutes} min while in stock`}
                    </p>
                  </div>

                  <button
                    onClick={addProduct}
                    disabled={addingProduct || !newUrl.trim()}
                    className="px-6 py-3 bg-accent text-paper font-mono text-[0.65rem] tracking-[0.1em] uppercase disabled:opacity-40 shadow-hard-sm hover-lift"
                  >
                    {addingProduct ? "Adding…" : "Start Watching →"}
                  </button>
                </div>
              ) : (
                /* ── Bulk product form ── */
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

                  {/* URL input + add button */}
                  <div className="mb-4">
                    <label className="block font-mono text-[0.6rem] tracking-[0.1em] uppercase text-ink-soft mb-1.5">
                      Add Product URL
                    </label>
                    <div className="flex gap-0">
                      <input
                        type="url"
                        value={bulkInput}
                        onChange={(e) => setBulkInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addToBulkQueue()}
                        disabled={!!bulkProgress}
                        placeholder="https://store.com/products/product-name"
                        className="flex-1 border border-ink border-r-0 bg-paper px-3 py-2.5 text-sm font-body focus-hard transition-shadow disabled:opacity-50"
                      />
                      <button
                        onClick={addToBulkQueue}
                        disabled={!!bulkProgress || !bulkInput.trim()}
                        className="px-4 py-2.5 bg-ink text-paper font-mono text-lg leading-none border border-ink disabled:opacity-30 hover:bg-accent hover:border-accent transition-colors flex-shrink-0"
                        aria-label="Add URL to queue"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* URL queue */}
                  {bulkUrls.length > 0 && (
                    <div className="mb-5 border border-grid-line divide-y divide-grid-line">
                      {/* Queue header */}
                      <div className="flex items-center justify-between px-3 py-1.5 bg-paper">
                        <span className="font-mono text-[0.55rem] tracking-[0.12em] uppercase text-ink-soft">
                          {bulkUrls.length} product{bulkUrls.length !== 1 ? "s" : ""} queued
                        </span>
                        {!bulkProgress && (
                          <button
                            onClick={() => { setBulkUrls([]); setBulkResult(null); }}
                            className="font-mono text-[0.55rem] tracking-widest uppercase text-ink-soft hover:text-red-600 transition-colors"
                          >
                            Clear all
                          </button>
                        )}
                      </div>

                      {/* URL rows */}
                      {bulkUrls.map((url, i) => {
                        const isCurrent = bulkProgress && bulkProgress.done === i;
                        const isDone = bulkProgress && i < bulkProgress.done;
                        const isFailed = bulkResult?.failed.includes(url);

                        return (
                          <div
                            key={url}
                            className="flex items-center gap-3 px-3 py-2.5 transition-colors"
                            style={
                              isCurrent
                                ? { background: "var(--paper)", borderLeft: "2px solid var(--accent)" }
                                : isDone
                                ? { opacity: 0.4 }
                                : isFailed
                                ? { borderLeft: "2px solid #dc2626" }
                                : {}
                            }
                          >
                            {/* Status icon */}
                            <span className="font-mono text-[0.65rem] w-4 flex-shrink-0 text-center">
                              {isCurrent ? (
                                <span className="inline-block w-2 h-2 bg-accent animate-pulse rounded-full" />
                              ) : isDone ? (
                                <span className="text-ink-soft">✓</span>
                              ) : isFailed ? (
                                <span className="text-red-600">✕</span>
                              ) : (
                                <span className="text-ink-soft opacity-30">{i + 1}</span>
                              )}
                            </span>

                            {/* URL */}
                            <span className="font-mono text-[0.6rem] text-ink truncate flex-1">
                              {url.replace(/^https?:\/\//, "")}
                            </span>

                            {/* Remove button — hidden during progress */}
                            {!bulkProgress && (
                              <button
                                onClick={() => removeFromBulkQueue(i)}
                                className="flex-shrink-0 font-mono text-[0.65rem] text-ink-soft hover:text-red-600 transition-colors px-1"
                                aria-label="Remove"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Empty queue hint */}
                  {bulkUrls.length === 0 && !bulkProgress && (
                    <div className="mb-5 border border-dashed border-grid-line px-4 py-5 flex flex-col items-center text-center">
                      <p className="font-mono text-[0.6rem] tracking-widest uppercase text-ink-soft opacity-50 mb-1">
                        Queue is empty
                      </p>
                      <p className="font-body text-xs text-ink-soft opacity-40">
                        Paste a URL above and press + or Enter to add it
                      </p>
                    </div>
                  )}

                  {/* Size picker */}
                  <div className="mb-5">
                    <p className="font-mono text-[0.6rem] tracking-[0.1em] uppercase text-ink-soft mb-2">
                      Alert me for these sizes on all products:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {ALL_SIZES.map((size) => {
                        const active = bulkSizes.includes(size);
                        return (
                          <button
                            key={size}
                            type="button"
                            disabled={!!bulkProgress}
                            onClick={() =>
                              setBulkSizes((prev) =>
                                prev.includes(size)
                                  ? prev.filter((s) => s !== size)
                                  : [...prev, size],
                              )
                            }
                            className={`font-mono text-[0.65rem] tracking-widest uppercase px-3 py-1.5 border transition-all disabled:opacity-40 ${
                              active
                                ? "bg-accent text-paper border-accent shadow-hard-sm"
                                : "bg-paper-pure text-ink-soft border-grid-line hover:border-ink hover:text-ink"
                            }`}
                            style={active ? { transform: "rotate(-0.3deg)", borderRadius: "2px" } : {}}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Notify mode */}
                  <div className="flex items-center gap-3 mb-5">
                    <p className="font-mono text-[0.6rem] tracking-[0.1em] uppercase text-ink-soft flex-shrink-0">
                      Notify me
                    </p>
                    <div className="flex border border-ink overflow-hidden">
                      {(["once", "always"] as const).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          disabled={!!bulkProgress}
                          onClick={() => setBulkNotifyMode(mode)}
                          className={`font-mono text-[0.6rem] tracking-[0.08em] uppercase px-3 py-1.5 transition-colors disabled:opacity-40 ${
                            bulkNotifyMode === mode
                              ? "bg-ink text-paper"
                              : "text-ink-soft hover:text-ink"
                          }`}
                        >
                          {mode === "once" ? "Once" : `Every ${settings.interval_minutes} min`}
                        </button>
                      ))}
                    </div>
                    <p className="font-mono text-[0.52rem] text-ink-soft opacity-40">
                      {bulkNotifyMode === "once" ? "One alert per restock" : `Alert every ${settings.interval_minutes} min while in stock`}
                    </p>
                  </div>

                  {/* Progress bar */}
                  {bulkProgress && (
                    <div className="mb-4 border border-grid-line bg-paper px-3 py-2.5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-[0.58rem] tracking-widest uppercase text-ink-soft">
                          Adding {bulkProgress.done + 1} of {bulkProgress.total}
                        </span>
                        <span className="font-mono text-[0.58rem] text-accent font-bold">
                          {Math.round((bulkProgress.done / bulkProgress.total) * 100)}%
                        </span>
                      </div>
                      <div className="w-full h-0.5 bg-grid-line">
                        <div
                          className="h-0.5 bg-accent transition-all duration-300"
                          style={{ width: `${(bulkProgress.done / bulkProgress.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Results banner */}
                  {bulkResult && !bulkProgress && (
                    <div className={`mb-4 px-4 py-3 border font-body text-sm ${bulkResult.failed.length === 0 ? "border-ink bg-accent-soft text-ink" : "border-ink bg-paper text-ink"}`}>
                      <p className="font-mono text-[0.65rem] tracking-widest uppercase">
                        {bulkResult.failed.length === 0
                          ? `${bulkResult.added} product${bulkResult.added !== 1 ? "s" : ""} added — all done`
                          : `${bulkResult.added} added · ${bulkResult.failed.length} failed — fix and retry`}
                      </p>
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    onClick={addProductsBulk}
                    disabled={!!bulkProgress || bulkUrls.length === 0 || bulkSizes.length === 0}
                    className="px-6 py-3 bg-accent text-paper font-mono text-[0.65rem] tracking-[0.1em] uppercase disabled:opacity-40 shadow-hard-sm hover-lift"
                  >
                    {bulkProgress
                      ? `Adding ${bulkProgress.done + 1} of ${bulkProgress.total}…`
                      : `Watch ${bulkUrls.length || ""} Product${bulkUrls.length !== 1 ? "s" : ""} →`}
                  </button>
                </div>
              )}
            </section>

            {/* Alert Settings trigger button */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="w-full flex items-center justify-between px-5 py-3 bg-paper-pure border border-ink text-ink-soft hover:text-ink hover:bg-paper transition-colors shadow-hard-sm group"
            >
              <div className="flex items-center gap-3">
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: settings.email_to ? "var(--accent)" : "var(--grid-line)" }}
                />
                <span className="font-mono text-[0.6rem] tracking-[0.1em] uppercase">
                  Alert Settings
                </span>
                <span className="font-mono text-[0.58rem] text-ink-soft opacity-40">
                  {settings.email_to || "no email set"}
                </span>
                <span className="font-mono text-[0.55rem] text-ink-soft opacity-30">·</span>
                <span className="font-mono text-[0.58rem] text-ink-soft opacity-40">
                  every {settings.interval_minutes} min
                </span>
              </div>
              <span className="font-mono text-[0.6rem] tracking-widest uppercase text-ink-soft group-hover:text-accent transition-colors">
                Configure →
              </span>
            </button>

            {/* === SECTION 2: Watched Products === */}
            {/* Grid bg + edge-to-edge cards = distinct "board" feel */}
            <section className="border border-ink shadow-hard-sm overflow-hidden bg-grid">
              {/* Section header */}
              <div className="flex items-center justify-between px-5 py-3 bg-paper-pure border-b border-ink">
                <div className="flex items-center gap-3">
                  <span
                    className="font-display italic font-bold text-paper px-2 py-0.5 text-sm"
                    style={{ background: "var(--ink)", borderRadius: "2px", transform: "rotate(-0.4deg)", display: "inline-block" }}
                  >
                    Watching
                  </span>
                  {products.length > 0 && (
                    <span className="font-mono text-[0.58rem] tracking-widest uppercase text-ink-soft">
                      {products.length} product{products.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                {products.some((p) => p.is_paused) && (
                  <span className="font-mono text-[0.55rem] tracking-widest uppercase text-ink-soft opacity-50">
                    {products.filter((p) => p.is_paused).length} paused
                  </span>
                )}
              </div>

              {products.length === 0 ? (
                <div className="px-6 py-10 text-center">
                  <p className="font-body text-sm text-ink-soft opacity-60">
                    No products yet — add one above.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-ink">
                  {products.map((product) => {
                    const name = product.handle
                      .split("-")
                      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(" ");
                    const store = product.url
                      .replace(/^https?:\/\//, "")
                      .replace(/\/products\/.*/, "");
                    const initial = name.charAt(0).toUpperCase();

                    return (
                      <div
                        key={product.id}
                        className="relative bg-paper-pure flex gap-0"
                        style={product.is_paused ? { opacity: 0.65 } : {}}
                      >
                        {/* Paused accent strip */}
                        {product.is_paused && (
                          <div
                            className="absolute left-0 top-0 bottom-0 w-0.5"
                            style={{ background: "var(--ink-soft)" }}
                          />
                        )}

                        {/* Image thumbnail */}
                        <div
                          className="flex-shrink-0 border-r border-grid-line overflow-hidden"
                          style={{ width: 120, alignSelf: "stretch", minHeight: 120 }}
                        >
                          {product.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={product.image_url}
                              alt={name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-grid flex items-center justify-center relative overflow-hidden">
                              <svg className="absolute inset-0 w-full h-full" aria-hidden="true">
                                <line x1="0" y1="100%" x2="100%" y2="0" stroke="var(--grid-line)" strokeWidth="1" />
                                <line x1="-30%" y1="100%" x2="70%" y2="0" stroke="var(--grid-line)" strokeWidth="1" />
                                <line x1="30%" y1="100%" x2="130%" y2="0" stroke="var(--grid-line)" strokeWidth="1" />
                              </svg>
                              <span
                                className="font-display font-bold select-none relative"
                                style={{ fontSize: "3rem", color: "var(--ink)", opacity: 0.07, lineHeight: 1 }}
                              >
                                {initial}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Card content */}
                        <div className="flex-1 min-w-0 px-5 py-4">
                          {/* Name + store + actions row */}
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <p className="font-display font-semibold text-ink leading-tight" style={{ fontSize: "1rem" }}>
                                  {name}
                                </p>
                                {product.is_paused && (
                                  <span className="font-mono text-[0.5rem] tracking-[0.1em] uppercase px-1.5 py-0.5 border border-ink-soft text-ink-soft">
                                    Paused
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <p className="font-mono text-[0.58rem] text-ink-soft opacity-40 truncate">
                                  {store}
                                </p>
                                <a
                                  href={product.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-mono text-[0.55rem] tracking-widest uppercase text-ink-soft opacity-40 hover:opacity-100 hover:text-accent transition-opacity flex-shrink-0"
                                >
                                  ↗
                                </a>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button
                                onClick={() => togglePause(product)}
                                className="font-mono text-[0.58rem] tracking-widest uppercase border px-2.5 py-1.5 transition-colors border-grid-line text-ink-soft hover:border-ink hover:text-ink"
                              >
                                {product.is_paused ? "Resume" : "Pause"}
                              </button>
                              <button
                                onClick={() => removeProduct(product.id)}
                                className="font-mono text-[0.65rem] text-ink-soft hover:text-red-600 border border-grid-line w-7 h-7 flex items-center justify-center transition-colors"
                              >
                                ×
                              </button>
                            </div>
                          </div>

                          {/* Size toggles */}
                          <div className="mb-4">
                            <p className="font-mono text-[0.52rem] tracking-[0.1em] uppercase text-ink-soft opacity-40 mb-2">
                              Watching sizes
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {ALL_SIZES.map((size) => {
                                const active = product.watch_sizes.includes(size);
                                return (
                                  <button
                                    key={size}
                                    onClick={() => toggleProductSize(product, size)}
                                    className={`font-mono text-[0.62rem] tracking-widest uppercase px-3 py-1.5 border transition-all ${
                                      active
                                        ? "bg-ink text-paper border-ink shadow-hard-sm"
                                        : "bg-paper text-ink-soft border-grid-line hover:border-ink hover:text-ink"
                                    }`}
                                    style={active ? { transform: "rotate(-0.3deg)" } : {}}
                                  >
                                    {size}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Notify mode toggle */}
                          <div className="flex items-center gap-3">
                            <p className="font-mono text-[0.52rem] tracking-[0.1em] uppercase text-ink-soft opacity-40 flex-shrink-0">
                              Notify
                            </p>
                            <div className="flex border border-grid-line overflow-hidden">
                              {(["once", "always"] as const).map((mode) => {
                                const active = (product.notify_mode ?? "once") === mode;
                                return (
                                  <button
                                    key={mode}
                                    onClick={async () => {
                                      setProducts((prev) =>
                                        prev.map((p) =>
                                          p.id === product.id ? { ...p, notify_mode: mode } : p
                                        )
                                      );
                                      await fetch(`/api/products/${product.id}`, {
                                        method: "PATCH",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ notify_mode: mode }),
                                      });
                                    }}
                                    className={`font-mono text-[0.55rem] tracking-[0.08em] uppercase px-3 py-1 transition-colors ${
                                      active
                                        ? "bg-ink text-paper"
                                        : "text-ink-soft hover:text-ink bg-paper-pure"
                                    }`}
                                  >
                                    {mode === "once" ? "Once" : `Every ${settings.interval_minutes} min`}
                                  </button>
                                );
                              })}
                            </div>
                            <p className="font-mono text-[0.5rem] text-ink-soft opacity-30 leading-tight">
                              {(product.notify_mode ?? "once") === "once"
                                ? "Alert once per restock"
                                : `Alert every ${settings.interval_minutes} min while in stock`}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
