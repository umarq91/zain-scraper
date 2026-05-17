"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useProducts } from "@/hooks/useProducts";
import { useSettings } from "@/hooks/useSettings";
import { ProductModel } from "@/models/ProductModel";
import { AppHeader } from "@/components/layout/AppHeader";
import { Bracket } from "@/components/shared/Bracket";
import { ProductRow } from "./components/ProductRow";
import { ALL_SIZES } from "@/constants/sizes";
import { ROUTES } from "@/constants/routes";

const INTERVALS = [1, 2, 5, 10, 15, 30] as const;

type AddMode = "single" | "bulk";
type NotifyMode = "once" | "always";
type BulkProgress = { done: number; total: number; current: string };
type BulkResult = { added: number; failed: string[] };

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const { products, loading, addProduct, removeProduct, updateProduct, removingIds, savingIds, savedIds, productErrors } = useProducts();
  const { settings, setSettings, saving, msg, saveSettings } = useSettings();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [addMode, setAddMode] = useState<AddMode>("single");
  const [newUrl, setNewUrl] = useState("");
  const [newUrlSizes, setNewUrlSizes] = useState<string[]>(["M", "L"]);
  const [newUrlNotifyMode, setNewUrlNotifyMode] = useState<NotifyMode>("once");
  const [newUrlWatchPrice, setNewUrlWatchPrice] = useState(false);
  const [addingProduct, setAddingProduct] = useState(false);
  const [addError, setAddError] = useState("");
  const [bulkInput, setBulkInput] = useState("");
  const [bulkUrls, setBulkUrls] = useState<string[]>([]);
  const [bulkSizes, setBulkSizes] = useState<string[]>(["M", "L"]);
  const [bulkNotifyMode, setBulkNotifyMode] = useState<NotifyMode>("once");
  const [bulkWatchPrice, setBulkWatchPrice] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<BulkProgress | null>(null);
  const [bulkResult, setBulkResult] = useState<BulkResult | null>(null);

  async function signOut() {
    await supabase.auth.signOut();
    router.push(ROUTES.LOGIN);
  }

  async function handleAddSingle() {
    const url = newUrl.trim();
    if (!url) return;
    setAddingProduct(true);
    setAddError("");
    try {
      await addProduct({ url, watch_sizes: newUrlSizes, notify_mode: newUrlNotifyMode, watch_price: newUrlWatchPrice });
      setNewUrl("");
      setNewUrlSizes(["M", "L"]);
      setNewUrlNotifyMode("once");
      setNewUrlWatchPrice(false);
    } catch (e) {
      setAddError(e instanceof Error ? e.message : "Could not add product.");
    } finally {
      setAddingProduct(false);
    }
  }

  function addToBulkQueue() {
    const url = bulkInput.trim();
    if (!url || bulkUrls.includes(url)) { setBulkInput(""); return; }
    setBulkUrls((prev) => [...prev, url]);
    setBulkInput("");
    setBulkResult(null);
  }

  async function handleBulkAdd() {
    if (!bulkUrls.length) return;
    setBulkResult(null);
    setBulkProgress({ done: 0, total: bulkUrls.length, current: bulkUrls[0] });
    let added = 0;
    const failed: string[] = [];
    for (let i = 0; i < bulkUrls.length; i++) {
      setBulkProgress({ done: i, total: bulkUrls.length, current: bulkUrls[i] });
      try {
        await ProductModel.create({ url: bulkUrls[i], watch_sizes: bulkSizes, notify_mode: bulkNotifyMode, watch_price: bulkWatchPrice });
        added++;
      } catch {
        failed.push(bulkUrls[i]);
      }
    }
    setBulkProgress(null);
    setBulkResult({ added, failed });
    setBulkUrls(failed);
  }

  const sectionLabel = (text: string) => (
    <div className="flex items-center gap-3 mb-5">
      <span className="font-display italic font-bold text-paper px-2 py-0.5 text-sm" style={{ background: "var(--ink)", borderRadius: "2px", transform: "rotate(-0.4deg)", display: "inline-block" }}>
        {text}
      </span>
      <div className="flex-1 border-t border-grid-line" />
    </div>
  );

  const sizePicker = (selected: string[], onChange: (sizes: string[]) => void, disabled = false) => (
    <div className="flex flex-wrap gap-2">
      {ALL_SIZES.map((size) => {
        const active = selected.includes(size);
        return (
          <button
            key={size}
            type="button"
            disabled={disabled}
            onClick={() => onChange(active ? selected.filter((s) => s !== size) : [...selected, size])}
            className={`font-mono text-[0.65rem] tracking-widest uppercase px-3 py-1.5 border transition-all disabled:opacity-40 ${active ? "bg-accent text-paper border-accent shadow-hard-sm" : "bg-paper-pure text-ink-soft border-grid-line hover:border-ink hover:text-ink"}`}
            style={active ? { transform: "rotate(-0.3deg)", borderRadius: "2px" } : {}}
          >
            {size}
          </button>
        );
      })}
    </div>
  );

  const notifyToggle = (value: NotifyMode, onChange: (m: NotifyMode) => void, disabled = false) => (
    <div className="flex items-center gap-3">
      <p className="font-mono text-[0.6rem] tracking-[0.1em] uppercase text-ink-soft flex-shrink-0">Notify me</p>
      <div className="flex border border-ink overflow-hidden">
        {(["once", "always"] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            disabled={disabled}
            onClick={() => onChange(mode)}
            className={`font-mono text-[0.6rem] tracking-[0.08em] uppercase px-3 py-1.5 transition-colors disabled:opacity-40 ${value === mode ? "bg-ink text-paper" : "text-ink-soft hover:text-ink"}`}
          >
            {mode === "once" ? "Once" : `Every ${settings.interval_minutes} min`}
          </button>
        ))}
      </div>
      <p className="font-mono text-[0.52rem] text-ink-soft opacity-40">
        {value === "once" ? "One alert per restock" : `Alert every ${settings.interval_minutes} min while in stock`}
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-grid">
      {drawerOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setDrawerOpen(false)}>
          <div className="absolute inset-0 bg-ink opacity-50" />
        </div>
      )}
      <div
        className="fixed top-0 right-0 bottom-0 z-50 flex flex-col border-l border-ink bg-paper-pure"
        style={{ width: 340, transform: drawerOpen ? "translateX(0)" : "translateX(100%)", transition: "transform 0.22s cubic-bezier(0.4,0,0.2,1)", boxShadow: drawerOpen ? "-6px 0 0 #0A0A0A" : "none" }}
      >
        <div className="flex items-center justify-between px-5 py-4 flex-shrink-0 border-b border-ink">
          <span className="font-display italic font-bold text-paper px-2 py-0.5 text-sm" style={{ background: "var(--ink)", borderRadius: "2px", transform: "rotate(-0.4deg)", display: "inline-block" }}>Alert Settings</span>
          <button onClick={() => setDrawerOpen(false)} className="font-mono text-xl leading-none text-ink-soft hover:text-ink transition-colors" aria-label="Close">×</button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-6">
          <p className="font-body text-sm text-ink-soft mb-6">We&apos;ll email you the moment a watched size comes back in stock. Defaults to your account email.</p>

          <div className="mb-5">
            <label className="block font-mono text-[0.6rem] tracking-[0.1em] uppercase text-ink-soft mb-1.5">Alert Email</label>
            <input type="email" value={settings.email_to} onChange={(e) => setSettings((s) => ({ ...s, email_to: e.target.value }))} placeholder="you@example.com" className="w-full border border-ink bg-paper px-3 py-2.5 text-sm font-body focus-hard transition-shadow" />
          </div>

          <div className="mb-6">
            <label className="block font-mono text-[0.6rem] tracking-[0.1em] uppercase text-ink-soft mb-1.5">Check Interval</label>
            <div className="grid grid-cols-3 gap-0 border border-ink overflow-hidden">
              {INTERVALS.map((min) => (
                <button key={min} type="button" onClick={() => setSettings((s) => ({ ...s, interval_minutes: min }))} className={`font-mono text-[0.6rem] tracking-[0.06em] uppercase py-2 border-b border-r border-ink transition-colors last:border-r-0 ${settings.interval_minutes === min ? "bg-ink text-paper" : "text-ink-soft hover:text-ink bg-paper-pure"}`}>
                  {min} min
                </button>
              ))}
            </div>
            <p className="font-mono text-[0.52rem] text-ink-soft opacity-40 mt-1.5">How often we check your products for size availability</p>
          </div>

          <button onClick={saveSettings} disabled={saving} className="w-full py-3 font-mono text-[0.65rem] tracking-[0.1em] uppercase disabled:opacity-40 bg-ink text-paper shadow-hard-sm hover-lift transition-colors">
            {saving ? "Saving…" : "Save Settings →"}
          </button>

          {msg && (
            <div className={`mt-4 px-3 py-2.5 text-xs font-body border ${msg.type === "success" ? "border-ink bg-accent-soft text-ink" : "border-red-700 bg-red-50 text-red-700"}`}>
              {msg.text}
            </div>
          )}
        </div>

        <div className="px-5 py-4 flex-shrink-0 border-t border-grid-line">
          <p className="font-mono text-[0.55rem] tracking-widest uppercase text-ink-soft opacity-30">StockWatch · Alert Settings</p>
        </div>
      </div>

      {addingProduct && addMode === "single" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-ink opacity-70" />
          <div className="relative bg-paper-pure border border-ink shadow-hard-lg w-full max-w-sm p-8 z-10">
            <span className="absolute top-0 left-0 translate-x-[-1px] translate-y-[-1px] opacity-30"><Bracket pos="tl" /></span>
            <span className="absolute top-0 right-0 translate-x-[1px] translate-y-[-1px] opacity-30"><Bracket pos="tr" /></span>
            <div className="flex gap-1.5 mb-6">
              <span className="w-2.5 h-2.5 bg-accent animate-bounce [animation-delay:0ms]" />
              <span className="w-2.5 h-2.5 bg-accent animate-bounce [animation-delay:150ms]" />
              <span className="w-2.5 h-2.5 bg-accent animate-bounce [animation-delay:300ms]" />
            </div>
            <p className="font-display font-bold text-ink mb-1" style={{ fontSize: "1.2rem", letterSpacing: "-0.01em" }}>Fetching product…</p>
            <p className="font-body text-sm text-ink-soft mb-5">We&apos;re grabbing the product info and image. This takes a few seconds.</p>
            <p className="font-mono text-[0.6rem] text-ink-soft opacity-50 truncate border-t border-grid-line pt-3">{newUrl}</p>
          </div>
        </div>
      )}

      <AppHeader maxWidth="max-w-3xl">
        <div className="py-4 flex items-center gap-2">
          <Link href={ROUTES.HOME} className="font-mono text-[0.6rem] tracking-widest uppercase text-ink-soft hover:text-accent transition-colors">← Dashboard</Link>
          <span className="text-grid-line mx-2">·</span>
          <span className="font-display font-bold text-ink" style={{ fontSize: "1.1rem", letterSpacing: "-0.01em" }}>My Alerts & Products</span>
        </div>
        <div className="ml-auto flex items-center">
          <button onClick={signOut} className="h-full px-5 font-mono text-[0.6rem] tracking-widest uppercase border-l border-ink text-ink-soft hover:text-ink transition-colors">Sign Out</button>
        </div>
      </AppHeader>

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
            <section className="bg-paper-pure border border-ink p-6 shadow-hard-lg" style={{ borderTop: "3px solid var(--accent)" }}>
              {sectionLabel("Watch a New Product")}

              <div className="flex mb-5 border border-ink w-fit">
                {(["single", "bulk"] as const).map((m) => (
                  <button key={m} onClick={() => { setAddMode(m); setBulkResult(null); }} className={`font-mono text-[0.6rem] tracking-[0.1em] uppercase px-4 py-2 transition-colors ${addMode === m ? "bg-ink text-paper" : "text-ink-soft hover:text-ink"}`}>
                    {m === "single" ? "Single" : "Bulk"}
                  </button>
                ))}
              </div>

              {addMode === "single" ? (
                <div className="relative bg-paper-pure border border-ink p-6" style={{ boxShadow: "4px 4px 0 var(--accent)" }}>
                  <span className="absolute top-0 left-0 translate-x-[-1px] translate-y-[-1px] opacity-30"><Bracket pos="tl" /></span>
                  <span className="absolute top-0 right-0 translate-x-[1px] translate-y-[-1px] opacity-30"><Bracket pos="tr" /></span>

                  <div className="mb-4">
                    <label className="block font-mono text-[0.6rem] tracking-[0.1em] uppercase text-ink-soft mb-1.5">Product URL</label>
                    <input type="url" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddSingle()} placeholder="https://store.com/products/your-product" className="w-full border border-ink bg-paper px-3 py-2.5 text-sm font-body focus-hard transition-shadow" />
                  </div>

                  <div className="mb-5">
                    <p className="font-mono text-[0.6rem] tracking-[0.1em] uppercase text-ink-soft mb-2">Alert me when these sizes are available:</p>
                    {sizePicker(newUrlSizes, setNewUrlSizes)}
                  </div>

                  <div className="mb-5">{notifyToggle(newUrlNotifyMode, setNewUrlNotifyMode)}</div>

                  <div className="mb-5 flex items-center gap-3">
                    <p className="font-mono text-[0.6rem] tracking-[0.1em] uppercase text-ink-soft flex-shrink-0">Price</p>
                    <button
                      type="button"
                      disabled={addingProduct}
                      onClick={() => setNewUrlWatchPrice((v) => !v)}
                      className={`flex items-center gap-2 border px-3 py-1.5 transition-colors disabled:opacity-40 ${newUrlWatchPrice ? "border-ink bg-ink text-paper" : "border-grid-line text-ink-soft hover:border-ink hover:text-ink bg-paper-pure"}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${newUrlWatchPrice ? "bg-accent" : "bg-grid-line"}`} />
                      <span className="font-mono text-[0.6rem] tracking-[0.08em] uppercase">
                        {newUrlWatchPrice ? "Tracking price drops" : "Track price drops"}
                      </span>
                    </button>
                    <p className="font-mono text-[0.52rem] text-ink-soft opacity-40">
                      {newUrlWatchPrice ? "Email me when price falls" : "Off"}
                    </p>
                  </div>

                  {addError && <div className="mb-4 px-3 py-2.5 border border-red-700 text-red-700 text-xs font-body bg-red-50">{addError}</div>}

                  <button onClick={handleAddSingle} disabled={addingProduct || !newUrl.trim()} className="px-6 py-3 bg-accent text-paper font-mono text-[0.65rem] tracking-[0.1em] uppercase disabled:opacity-40 shadow-hard-sm hover-lift">
                    {addingProduct ? "Adding…" : "Start Watching →"}
                  </button>
                </div>
              ) : (
                <div className="relative bg-paper-pure border border-ink p-6" style={{ boxShadow: "4px 4px 0 var(--accent)" }}>
                  <span className="absolute top-0 left-0 translate-x-[-1px] translate-y-[-1px] opacity-30"><Bracket pos="tl" /></span>
                  <span className="absolute top-0 right-0 translate-x-[1px] translate-y-[-1px] opacity-30"><Bracket pos="tr" /></span>

                  <div className="mb-4">
                    <label className="block font-mono text-[0.6rem] tracking-[0.1em] uppercase text-ink-soft mb-1.5">Add Product URL</label>
                    <div className="flex gap-0">
                      <input type="url" value={bulkInput} onChange={(e) => setBulkInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addToBulkQueue()} disabled={!!bulkProgress} placeholder="https://store.com/products/product-name" className="flex-1 border border-ink border-r-0 bg-paper px-3 py-2.5 text-sm font-body focus-hard transition-shadow disabled:opacity-50" />
                      <button onClick={addToBulkQueue} disabled={!!bulkProgress || !bulkInput.trim()} className="px-4 py-2.5 bg-ink text-paper font-mono text-lg leading-none border border-ink disabled:opacity-30 hover:bg-accent hover:border-accent transition-colors flex-shrink-0" aria-label="Add URL to queue">+</button>
                    </div>
                  </div>

                  {bulkUrls.length > 0 ? (
                    <div className="mb-5 border border-grid-line divide-y divide-grid-line">
                      <div className="flex items-center justify-between px-3 py-1.5 bg-paper">
                        <span className="font-mono text-[0.55rem] tracking-[0.12em] uppercase text-ink-soft">{bulkUrls.length} product{bulkUrls.length !== 1 ? "s" : ""} queued</span>
                        {!bulkProgress && <button onClick={() => { setBulkUrls([]); setBulkResult(null); }} className="font-mono text-[0.55rem] tracking-widest uppercase text-ink-soft hover:text-red-600 transition-colors">Clear all</button>}
                      </div>
                      {bulkUrls.map((url, i) => {
                        const isCurrent = bulkProgress?.done === i;
                        const isDone = bulkProgress && i < bulkProgress.done;
                        const isFailed = bulkResult?.failed.includes(url);
                        return (
                          <div key={url} className="flex items-center gap-3 px-3 py-2.5 transition-colors" style={isCurrent ? { background: "var(--paper)", borderLeft: "2px solid var(--accent)" } : isDone ? { opacity: 0.4 } : isFailed ? { borderLeft: "2px solid #dc2626" } : {}}>
                            <span className="font-mono text-[0.65rem] w-4 flex-shrink-0 text-center">
                              {isCurrent ? <span className="inline-block w-2 h-2 bg-accent animate-pulse rounded-full" /> : isDone ? <span className="text-ink-soft">✓</span> : isFailed ? <span className="text-red-600">✕</span> : <span className="text-ink-soft opacity-30">{i + 1}</span>}
                            </span>
                            <span className="font-mono text-[0.6rem] text-ink truncate flex-1">{url.replace(/^https?:\/\//, "")}</span>
                            {!bulkProgress && <button onClick={() => setBulkUrls((prev) => prev.filter((_, j) => j !== i))} className="flex-shrink-0 font-mono text-[0.65rem] text-ink-soft hover:text-red-600 transition-colors px-1" aria-label="Remove">×</button>}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    !bulkProgress && (
                      <div className="mb-5 border border-dashed border-grid-line px-4 py-5 flex flex-col items-center text-center">
                        <p className="font-mono text-[0.6rem] tracking-widest uppercase text-ink-soft opacity-50 mb-1">Queue is empty</p>
                        <p className="font-body text-xs text-ink-soft opacity-40">Paste a URL above and press + or Enter to add it</p>
                      </div>
                    )
                  )}

                  <div className="mb-5">
                    <p className="font-mono text-[0.6rem] tracking-[0.1em] uppercase text-ink-soft mb-2">Alert me for these sizes on all products:</p>
                    {sizePicker(bulkSizes, setBulkSizes, !!bulkProgress)}
                  </div>

                  <div className="mb-5">{notifyToggle(bulkNotifyMode, setBulkNotifyMode, !!bulkProgress)}</div>

                  <div className="mb-5 flex items-center gap-3">
                    <p className="font-mono text-[0.6rem] tracking-[0.1em] uppercase text-ink-soft flex-shrink-0">Price</p>
                    <button
                      type="button"
                      disabled={!!bulkProgress}
                      onClick={() => setBulkWatchPrice((v) => !v)}
                      className={`flex items-center gap-2 border px-3 py-1.5 transition-colors disabled:opacity-40 ${bulkWatchPrice ? "border-ink bg-ink text-paper" : "border-grid-line text-ink-soft hover:border-ink hover:text-ink bg-paper-pure"}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${bulkWatchPrice ? "bg-accent" : "bg-grid-line"}`} />
                      <span className="font-mono text-[0.6rem] tracking-[0.08em] uppercase">
                        {bulkWatchPrice ? "Tracking price drops" : "Track price drops"}
                      </span>
                    </button>
                    <p className="font-mono text-[0.52rem] text-ink-soft opacity-40">
                      {bulkWatchPrice ? "Email me when price falls" : "Off"}
                    </p>
                  </div>

                  {bulkProgress && (
                    <div className="mb-4 border border-grid-line bg-paper px-3 py-2.5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-[0.58rem] tracking-widest uppercase text-ink-soft">Adding {bulkProgress.done + 1} of {bulkProgress.total}</span>
                        <span className="font-mono text-[0.58rem] text-accent font-bold">{Math.round((bulkProgress.done / bulkProgress.total) * 100)}%</span>
                      </div>
                      <div className="w-full h-0.5 bg-grid-line">
                        <div className="h-0.5 bg-accent transition-all duration-300" style={{ width: `${(bulkProgress.done / bulkProgress.total) * 100}%` }} />
                      </div>
                    </div>
                  )}

                  {bulkResult && !bulkProgress && (
                    <div className={`mb-4 px-4 py-3 border font-body text-sm ${bulkResult.failed.length === 0 ? "border-ink bg-accent-soft text-ink" : "border-ink bg-paper text-ink"}`}>
                      <p className="font-mono text-[0.65rem] tracking-widest uppercase">
                        {bulkResult.failed.length === 0 ? `${bulkResult.added} product${bulkResult.added !== 1 ? "s" : ""} added — all done` : `${bulkResult.added} added · ${bulkResult.failed.length} failed — fix and retry`}
                      </p>
                    </div>
                  )}

                  <button onClick={handleBulkAdd} disabled={!!bulkProgress || bulkUrls.length === 0 || bulkSizes.length === 0} className="px-6 py-3 bg-accent text-paper font-mono text-[0.65rem] tracking-[0.1em] uppercase disabled:opacity-40 shadow-hard-sm hover-lift">
                    {bulkProgress ? `Adding ${bulkProgress.done + 1} of ${bulkProgress.total}…` : `Watch ${bulkUrls.length || ""} Product${bulkUrls.length !== 1 ? "s" : ""} →`}
                  </button>
                </div>
              )}
            </section>

            <button onClick={() => setDrawerOpen(true)} className="w-full flex items-center justify-between px-5 py-3 bg-paper-pure border border-ink text-ink-soft hover:text-ink hover:bg-paper transition-colors shadow-hard-sm group">
              <div className="flex items-center gap-3">
                <span className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: settings.email_to ? "var(--accent)" : "var(--grid-line)" }} />
                <span className="font-mono text-[0.6rem] tracking-[0.1em] uppercase">Alert Settings</span>
                <span className="font-mono text-[0.58rem] text-ink-soft opacity-40">{settings.email_to || "no email set"}</span>
                <span className="font-mono text-[0.55rem] text-ink-soft opacity-30">·</span>
                <span className="font-mono text-[0.58rem] text-ink-soft opacity-40">every {settings.interval_minutes} min</span>
              </div>
              <span className="font-mono text-[0.6rem] tracking-widest uppercase text-ink-soft group-hover:text-accent transition-colors">Configure →</span>
            </button>

            <section className="border border-ink shadow-hard-sm overflow-hidden bg-grid">
              <div className="flex items-center justify-between px-5 py-3 bg-paper-pure border-b border-ink">
                <div className="flex items-center gap-3">
                  <span className="font-display italic font-bold text-paper px-2 py-0.5 text-sm" style={{ background: "var(--ink)", borderRadius: "2px", transform: "rotate(-0.4deg)", display: "inline-block" }}>Watching</span>
                  {products.length > 0 && <span className="font-mono text-[0.58rem] tracking-widest uppercase text-ink-soft">{products.length} product{products.length !== 1 ? "s" : ""}</span>}
                </div>
                {products.some((p) => p.is_paused) && (
                  <span className="font-mono text-[0.55rem] tracking-widest uppercase text-ink-soft opacity-50">{products.filter((p) => p.is_paused).length} paused</span>
                )}
              </div>

              {products.length === 0 ? (
                <div className="px-6 py-10 text-center">
                  <p className="font-body text-sm text-ink-soft opacity-60">No products yet — add one above.</p>
                </div>
              ) : (
                <div className="divide-y divide-ink">
                  {products.map((product) => (
                    <ProductRow
                      key={product.id}
                      product={product}
                      intervalMinutes={settings.interval_minutes}
                      isRemoving={removingIds.has(product.id)}
                      isSaving={savingIds.has(product.id)}
                      isSaved={savedIds.has(product.id)}
                      error={productErrors.get(product.id) ?? null}
                      onRemove={() => removeProduct(product.id)}
                      onTogglePause={() => updateProduct(product.id, { is_paused: !product.is_paused })}
                      onToggleSize={(size) => {
                        const next = product.watch_sizes.includes(size)
                          ? product.watch_sizes.filter((s) => s !== size)
                          : [...product.watch_sizes, size];
                        updateProduct(product.id, { watch_sizes: next });
                      }}
                      onToggleNotify={(mode) => updateProduct(product.id, { notify_mode: mode })}
                      onTogglePriceWatch={(val) => updateProduct(product.id, { watch_price: val })}
                    />
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
