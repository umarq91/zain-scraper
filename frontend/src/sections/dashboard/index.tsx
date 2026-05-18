"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useDashboard } from "@/hooks/useDashboard";
import { AppHeader } from "@/components/layout/AppHeader";
import { ProductCard } from "./components/ProductCard";
import { LoadingSkeleton } from "./components/LoadingSkeleton";
import { OnboardingEmptyState } from "./components/OnboardingEmptyState";
import { ROUTES } from "@/constants/routes";
import type { ProductWithState } from "@/types";

type Filter = "all" | "in_stock" | "sold_out" | "paused";

function stockScore(p: ProductWithState): number {
  if (p.is_paused) return 3;
  const vals = Object.values(p.sizes);
  if (vals.some(Boolean)) return 0;
  if (vals.every((v) => v === null)) return 1;
  return 2;
}

const FILTER_TABS: { key: Filter; label: (n: number) => string }[] = [
  { key: "all", label: (n) => `All (${n})` },
  { key: "in_stock", label: (n) => `In Stock (${n})` },
  { key: "sold_out", label: (n) => `Sold Out (${n})` },
  { key: "paused", label: (n) => `Paused (${n})` },
];

export default function Dashboard() {
  const router = useRouter();
  const supabase = createClient();
  const { data, loading, error, triggering, triggerMsg, fetchData, triggerCheck } = useDashboard();
  const [filter, setFilter] = useState<Filter>("all");

  async function signOut() {
    await supabase.auth.signOut();
    router.push(ROUTES.LOGIN);
  }

  const sorted = data
    ? [...data.products].sort((a, b) => stockScore(a) - stockScore(b))
    : [];

  const counts: Record<Filter, number> = {
    all: sorted.length,
    in_stock: sorted.filter((p) => !p.is_paused && Object.values(p.sizes).some(Boolean)).length,
    sold_out: sorted.filter((p) => !p.is_paused && !Object.values(p.sizes).some(Boolean) && !Object.values(p.sizes).every((v) => v === null)).length,
    paused: sorted.filter((p) => p.is_paused).length,
  };

  const filtered =
    filter === "all" ? sorted
    : filter === "in_stock" ? sorted.filter((p) => !p.is_paused && Object.values(p.sizes).some(Boolean))
    : filter === "sold_out" ? sorted.filter((p) => !p.is_paused && !Object.values(p.sizes).some(Boolean) && !Object.values(p.sizes).every((v) => v === null))
    : sorted.filter((p) => p.is_paused);

  const visibleTabs = FILTER_TABS.filter(({ key }) => key === "all" || counts[key] > 0);
  const showFilters = sorted.length > 0 && visibleTabs.length > 2;

  return (
    <div className="min-h-screen bg-grid">
      <AppHeader>
        <div className="py-4 pr-6 border-r border-ink flex items-center gap-3">
          <div>
            <span className="font-display font-bold text-ink" style={{ fontSize: "1.2rem", letterSpacing: "-0.02em" }}>StockWatch</span>
            <span className="block font-mono text-[0.55rem] tracking-[0.12em] uppercase text-ink-soft opacity-60 leading-none mt-0.5">your size radar</span>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-0">
          <button
            onClick={triggerCheck}
            disabled={triggering || !!triggerMsg}
            className="h-full px-5 font-mono text-[0.65rem] tracking-[0.08em] uppercase border-l border-ink text-ink hover:bg-accent hover:text-paper transition-colors disabled:opacity-40"
          >
            {triggering ? "Starting…" : triggerMsg ? "Scanning…" : "Scan Now"}
          </button>
          <Link href={ROUTES.SETTINGS} className="h-full px-5 flex items-center font-mono text-[0.65rem] tracking-[0.08em] uppercase border-l border-ink text-ink hover:bg-ink hover:text-paper transition-colors">
            My Products
          </Link>
          <button onClick={signOut} className="h-full px-5 font-mono text-[0.65rem] tracking-[0.08em] uppercase border-l border-ink text-ink-soft hover:text-ink transition-colors">
            Sign Out
          </button>
        </div>
      </AppHeader>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {triggerMsg && (
          <div className="mb-6 px-4 py-3 border border-ink bg-paper-pure font-body text-sm shadow-hard-sm flex items-center gap-3">
            <span className="w-2 h-2 rounded-full flex-shrink-0 animate-pulse" style={{ background: "var(--accent)" }} />
            {triggerMsg}
          </div>
        )}

        {loading && <LoadingSkeleton />}

        {!loading && error && (
          <div className="px-4 py-3 border border-red-700 bg-paper-pure text-red-700 font-body text-sm shadow-hard-sm flex items-center justify-between gap-4">
            <span>Something went wrong loading your products.</span>
            <button onClick={fetchData} className="font-mono text-[0.6rem] tracking-widest uppercase underline hover:text-red-900 flex-shrink-0 transition-colors">
              Try again
            </button>
          </div>
        )}

        {data && (
          <>
            {sorted.length === 0 ? (
              <OnboardingEmptyState />
            ) : (
              <div className="bg-paper-pure border border-grid-line overflow-hidden shadow-hard-sm">
                {/* Stats header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-grid-line flex-wrap gap-y-2">
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="font-mono text-[0.6rem] tracking-[0.12em] uppercase text-ink-soft">
                      {sorted.length} {sorted.length === 1 ? "product" : "products"} watching
                    </span>
                    {counts.in_stock > 0 && (
                      <>
                        <span className="text-grid-line">·</span>
                        <span className="font-mono text-[0.6rem] tracking-[0.12em] uppercase flex items-center gap-1.5" style={{ color: "var(--accent)" }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent)" }} />
                          {counts.in_stock} in stock now
                        </span>
                      </>
                    )}
                    {counts.sold_out > 0 && (
                      <>
                        <span className="text-grid-line">·</span>
                        <span className="font-mono text-[0.6rem] tracking-[0.12em] uppercase text-ink-soft">
                          {counts.sold_out} sold out
                        </span>
                      </>
                    )}
                    {counts.paused > 0 && (
                      <>
                        <span className="text-grid-line">·</span>
                        <span className="font-mono text-[0.6rem] tracking-[0.12em] uppercase text-ink-soft opacity-50">
                          {counts.paused} paused
                        </span>
                      </>
                    )}
                    <span className="text-grid-line">·</span>
                    <span className="font-mono text-[0.6rem] tracking-[0.12em] uppercase text-ink-soft">
                      checks every 10 min
                    </span>
                  </div>
                  <button onClick={fetchData} className="font-mono text-[0.6rem] tracking-widest uppercase text-ink-soft hover:text-accent transition-colors flex-shrink-0">
                    Refresh ↺
                  </button>
                </div>

                {/* Content area */}
                <div className="p-6">
                  {showFilters && (
                    <div className="flex items-center mb-6 border border-ink w-fit">
                      {visibleTabs.map(({ key, label }) => (
                        <button
                          key={key}
                          onClick={() => setFilter(key)}
                          className={`font-mono text-[0.6rem] tracking-[0.08em] uppercase px-4 py-2 border-r border-ink last:border-r-0 transition-colors ${
                            filter === key ? "bg-ink text-paper" : "text-ink-soft hover:text-ink bg-paper-pure"
                          }`}
                          style={filter === key && key === "in_stock" ? { background: "var(--accent)" } : {}}
                        >
                          {label(counts[key])}
                        </button>
                      ))}
                    </div>
                  )}

                  {filtered.length === 0 ? (
                    <div className="py-16 text-center">
                      <p className="font-body text-sm text-ink-soft opacity-60 mb-2">No products match this filter.</p>
                      <button
                        onClick={() => setFilter("all")}
                        className="font-mono text-[0.6rem] tracking-widest uppercase text-ink-soft hover:text-accent transition-colors underline"
                      >
                        Show all products
                      </button>
                    </div>
                  ) : (
                    <div className="grid gap-6 sm:grid-cols-2">
                      {filtered.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
