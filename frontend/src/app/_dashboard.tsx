"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import type { DashboardData } from "@/types";

function cleanUrl(url: string): string {
  try { const u = new URL(url); u.search = ""; return u.toString(); }
  catch { return url; }
}

function Bracket({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  const t = { tl: "", tr: "scaleX(-1)", bl: "scaleY(-1)", br: "scale(-1,-1)" }[pos];
  return (
    <svg width="22" height="22" viewBox="0 0 40 40" aria-hidden="true" style={{ display: "block", transform: t }}>
      <path d="M2 16 L2 2 L16 2" fill="none" stroke="#0A0A0A" strokeWidth="2.5" />
    </svg>
  );
}

function SizeBadge({ size, avail }: { size: string; avail: boolean | null }) {
  if (avail === null) {
    return (
      <span className="font-mono text-sm tracking-wider uppercase px-4 py-2 border border-grid-line text-ink-soft bg-paper font-medium">
        {size}
      </span>
    );
  }
  if (avail) {
    return (
      <span
        className="font-mono text-sm tracking-wider uppercase px-4 py-2 font-bold"
        style={{ background: "var(--accent)", color: "var(--paper)", borderRadius: "2px", transform: "rotate(-0.3deg)", display: "inline-block" }}
      >
        {size}
      </span>
    );
  }
  return (
    <span className="font-mono text-sm tracking-wider uppercase px-4 py-2 border border-ink text-ink-soft bg-paper line-through opacity-30">
      {size}
    </span>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const supabase = createClient();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [triggering, setTriggering] = useState(false);
  const [triggerMsg, setTriggerMsg] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (res.status === 401) { router.push("/login"); return; }
      if (!res.ok) throw new Error((await res.json()).error);
      setData(await res.json());
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 30_000);
    return () => clearInterval(id);
  }, [fetchData]);

  async function triggerCheck() {
    setTriggering(true);
    setTriggerMsg("");
    try {
      const res = await fetch("/api/trigger", { method: "POST" });
      setTriggerMsg(res.ok ? "Scan started — refresh in 30 seconds." : "Could not start scan.");
    } catch {
      setTriggerMsg("Could not start scan.");
    } finally {
      setTriggering(false);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-grid">
      {/* Header */}
      <header className="bg-paper-pure border-b border-ink sticky top-0 z-20" style={{ boxShadow: "0 2px 0 #0A0A0A" }}>
        <div className="max-w-5xl mx-auto px-6 py-0 flex items-stretch">
          {/* Logo */}
          <div className="py-4 pr-6 border-r border-ink flex items-center gap-3">
            <div>
              <span className="font-display font-bold text-ink" style={{ fontSize: "1.2rem", letterSpacing: "-0.02em" }}>
                StockWatch
              </span>
              <span className="block font-mono text-[0.55rem] tracking-[0.12em] uppercase text-ink-soft opacity-60 leading-none mt-0.5">
                your size radar
              </span>
            </div>
          </div>

          {/* Nav actions */}
          <div className="ml-auto flex items-center gap-0">
            <button
              onClick={triggerCheck}
              disabled={triggering}
              className="h-full px-5 font-mono text-[0.65rem] tracking-[0.08em] uppercase border-l border-ink text-ink hover:bg-accent hover:text-paper transition-colors disabled:opacity-40"
            >
              {triggering ? "Scanning…" : "Scan Now"}
            </button>
            <Link
              href="/settings"
              className="h-full px-5 flex items-center font-mono text-[0.65rem] tracking-[0.08em] uppercase border-l border-ink text-ink hover:bg-ink hover:text-paper transition-colors"
            >
              My Products
            </Link>
            <button
              onClick={signOut}
              className="h-full px-5 font-mono text-[0.65rem] tracking-[0.08em] uppercase border-l border-ink text-ink-soft hover:text-ink transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Trigger message */}
        {triggerMsg && (
          <div className="mb-6 px-4 py-3 border border-ink bg-paper-pure font-body text-sm shadow-hard-sm flex items-center gap-3">
            <span
              className="font-display italic font-bold text-xs px-1.5 py-0.5"
              style={{ background: "var(--accent)", color: "var(--paper)", borderRadius: "2px" }}
            >
              Info
            </span>
            {triggerMsg}
          </div>
        )}

        {loading && (
          <div className="grid gap-6 sm:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="bg-paper-pure border border-ink overflow-hidden" style={{ boxShadow: "4px 4px 0 #0A0A0A" }}>
                {/* Image skeleton */}
                <div className="h-64 border-b border-grid-line relative overflow-hidden bg-grid">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-paper to-transparent animate-[shimmer_1.5s_infinite]" style={{ backgroundSize: "200% 100%" }} />
                </div>
                {/* Content skeleton */}
                <div className="p-5 space-y-3">
                  <div className="h-2.5 w-16 bg-grid-line animate-pulse" />
                  <div className="h-5 w-3/4 bg-grid-line animate-pulse" />
                  <div className="h-2.5 w-2/5 bg-grid-line animate-pulse" />
                  <div className="flex gap-2 pt-1">
                    {[0, 1, 2].map((j) => (
                      <div key={j} className="h-10 w-14 bg-grid-line animate-pulse" />
                    ))}
                  </div>
                  <div className="pt-3 border-t border-grid-line h-2.5 w-1/3 bg-grid-line animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="px-4 py-3 border border-red-700 bg-paper-pure text-red-700 font-body text-sm shadow-hard-sm">
            {error}
          </div>
        )}

        {data && (
          <>
            {/* Status strip */}
            <div className="flex items-center justify-between mb-8 bg-paper-pure px-4 py-3 border border-grid-line -mx-1">
              <div className="flex items-center gap-4">
                <span className="font-mono text-[0.6rem] tracking-[0.12em] uppercase text-ink-soft">
                  Checking automatically every 5 min
                </span>
                {data.products.length > 0 && (
                  <>
                    <span className="text-grid-line">·</span>
                    <span className="font-mono text-[0.6rem] tracking-[0.12em] uppercase text-ink-soft">
                      {data.products.length} product{data.products.length !== 1 ? "s" : ""} tracked
                    </span>
                  </>
                )}
              </div>
              <button onClick={fetchData} className="font-mono text-[0.6rem] tracking-widest uppercase text-ink-soft hover:text-accent transition-colors">
                Refresh ↺
              </button>
            </div>

            {data.products.length === 0 ? (
              /* Empty state */
              <div className="bg-paper-pure border border-ink p-12 shadow-hard-lg relative flex flex-col items-center justify-center text-center">
                <span className="absolute top-3 left-3 opacity-30"><Bracket pos="tl" /></span>
                <span className="absolute top-3 right-3 opacity-30"><Bracket pos="tr" /></span>
                <span className="absolute bottom-3 left-3 opacity-30"><Bracket pos="bl" /></span>
                <span className="absolute bottom-3 right-3 opacity-30"><Bracket pos="br" /></span>

                <p className="font-display italic text-ink-soft mb-2" style={{ fontSize: "1.1rem", fontWeight: 500 }}>
                  you&apos;re not watching anything yet
                </p>
                <h2 className="font-display font-bold text-ink mb-3" style={{ fontSize: "clamp(2rem, 5vw, 3rem)", letterSpacing: "-0.02em", lineHeight: 1 }}>
                  Add your first product
                </h2>
                <p className="font-body text-sm text-ink-soft mb-8 max-w-xs">
                  Paste a product link, pick your sizes, and we&apos;ll email you the second it comes back in stock.
                </p>
                <Link
                  href="/settings"
                  className="inline-block px-6 py-3 bg-ink text-paper font-mono text-[0.65rem] tracking-[0.1em] uppercase shadow-hard-sm hover-lift"
                >
                  Start Watching →
                </Link>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                {data.products.map((product) => {
                  const available = Object.values(product.sizes).filter(Boolean).length;
                  const total = Object.keys(product.sizes).length;
                  const hasAny = available > 0;
                  const allUnknown = Object.values(product.sizes).every((v) => v === null);
                  const isPaused = product.is_paused ?? false;
                  const initial = product.name.charAt(0).toUpperCase();

                  return (
                    <div
                      key={product.id}
                      className="relative bg-paper-pure border border-ink overflow-hidden flex flex-col"
                      style={{
                        boxShadow: isPaused ? "4px 4px 0 var(--grid-line)" : hasAny ? "4px 4px 0 var(--accent)" : "4px 4px 0 #0A0A0A",
                        opacity: isPaused ? 0.65 : 1,
                      }}
                    >
                      {/* Image / Fallback — always shown */}
                      <div className="relative h-64 border-b border-grid-line flex-shrink-0">
                        {product.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          /* Fallback: grid pattern + giant faded initial */
                          <div className="w-full h-full bg-grid flex items-center justify-center relative overflow-hidden">
                            <span
                              className="font-display font-bold select-none pointer-events-none"
                              style={{ fontSize: "7rem", lineHeight: 1, color: "var(--ink)", opacity: 0.06 }}
                            >
                              {initial}
                            </span>
                            {/* Diagonal rule */}
                            <svg className="absolute inset-0 w-full h-full" aria-hidden="true">
                              <line x1="0" y1="100%" x2="100%" y2="0" stroke="var(--grid-line)" strokeWidth="1" />
                              <line x1="-20%" y1="100%" x2="80%" y2="0" stroke="var(--grid-line)" strokeWidth="1" />
                              <line x1="20%" y1="100%" x2="120%" y2="0" stroke="var(--grid-line)" strokeWidth="1" />
                            </svg>
                          </div>
                        )}

                        {/* Status badge overlaid on image */}
                        <span
                          className="absolute top-3 left-3 font-mono text-[0.58rem] tracking-[0.14em] uppercase font-medium px-2 py-0.5"
                          style={
                            isPaused
                              ? { background: "var(--paper)", color: "var(--ink-soft)", border: "1px solid var(--ink-soft)" }
                              : allUnknown
                              ? { background: "var(--paper)", color: "var(--ink-soft)", border: "1px solid var(--grid-line)" }
                              : hasAny
                              ? { background: "var(--accent)", color: "var(--paper)", borderRadius: "2px", transform: "rotate(-0.3deg)", display: "inline-block" }
                              : { background: "var(--ink)", color: "var(--paper)", borderRadius: "2px" }
                          }
                        >
                          {isPaused ? "Paused" : allUnknown ? "Not Yet Checked" : hasAny ? "In Stock" : "Sold Out"}
                        </span>

                        {/* View link overlaid */}
                        <a
                          href={cleanUrl(product.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute top-3 right-3 font-mono text-[0.58rem] tracking-widest uppercase px-2 py-0.5 hover:bg-accent hover:text-paper transition-colors"
                          style={{ background: "var(--paper)", border: "1px solid var(--grid-line)", color: "var(--ink-soft)" }}
                        >
                          View ↗
                        </a>

                        {/* Corner bracket */}
                        <span className="absolute top-0 left-0 translate-x-[-1px] translate-y-[-1px] opacity-30 pointer-events-none">
                          <Bracket pos="tl" />
                        </span>
                      </div>

                      {/* Card content */}
                      <div className="p-5 flex flex-col flex-1">
                        {/* Product name */}
                        <h2
                          className="font-display font-bold text-ink mb-1 leading-tight line-clamp-2"
                          style={{ fontSize: "1.1rem", letterSpacing: "-0.01em" }}
                        >
                          {product.name}
                        </h2>

                        {/* Store domain */}
                        <p className="font-mono text-[0.6rem] text-ink-soft opacity-50 truncate mb-4">
                          {product.url.replace(/^https?:\/\//, "").replace(/\/products\/.*/, "")}
                        </p>

                        {/* Size badges */}
                        {product.watch_sizes.length === 0 ? (
                          <p className="font-mono text-[0.6rem] uppercase tracking-widest text-ink-soft opacity-40">
                            No sizes selected — <Link href="/settings" className="underline hover:text-accent">pick some</Link>
                          </p>
                        ) : (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {product.watch_sizes.map((size) => (
                              <SizeBadge key={size} size={size} avail={product.sizes[size]} />
                            ))}
                          </div>
                        )}

                        {/* Footer */}
                        <div className="mt-auto pt-3 border-t border-grid-line flex items-center justify-between">
                          <span className="font-mono text-[0.58rem] tracking-widest uppercase text-ink-soft">
                            {allUnknown ? "First check coming soon" : `${available} of ${total} sizes available`}
                          </span>
                          {hasAny && (
                            <span className="font-display italic text-accent text-xs font-semibold">
                              Buy fast →
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
