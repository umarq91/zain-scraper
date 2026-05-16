"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useDashboard } from "@/hooks/useDashboard";
import { AppHeader } from "@/components/layout/AppHeader";
import { Bracket } from "@/components/shared/Bracket";
import { ProductCard } from "./components/ProductCard";
import { LoadingSkeleton } from "./components/LoadingSkeleton";
import { ROUTES } from "@/constants/routes";

export default function Dashboard() {
  const router = useRouter();
  const supabase = createClient();
  const { data, loading, error, triggering, triggerMsg, fetchData, triggerCheck } = useDashboard();

  async function signOut() {
    await supabase.auth.signOut();
    router.push(ROUTES.LOGIN);
  }

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
          <button onClick={triggerCheck} disabled={triggering} className="h-full px-5 font-mono text-[0.65rem] tracking-[0.08em] uppercase border-l border-ink text-ink hover:bg-accent hover:text-paper transition-colors disabled:opacity-40">
            {triggering ? "Scanning…" : "Scan Now"}
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
            <span className="font-display italic font-bold text-xs px-1.5 py-0.5" style={{ background: "var(--accent)", color: "var(--paper)", borderRadius: "2px" }}>Info</span>
            {triggerMsg}
          </div>
        )}

        {loading && <LoadingSkeleton />}

        {!loading && error && (
          <div className="px-4 py-3 border border-red-700 bg-paper-pure text-red-700 font-body text-sm shadow-hard-sm">{error}</div>
        )}

        {data && (
          <>
            <div className="flex items-center justify-between mb-8 bg-paper-pure px-4 py-3 border border-grid-line -mx-1">
              <div className="flex items-center gap-4">
                <span className="font-mono text-[0.6rem] tracking-[0.12em] uppercase text-ink-soft">Checking every {data.interval_minutes} min</span>
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
              <div className="bg-paper-pure border border-ink p-12 shadow-hard-lg relative flex flex-col items-center justify-center text-center">
                <span className="absolute top-3 left-3 opacity-30"><Bracket pos="tl" /></span>
                <span className="absolute top-3 right-3 opacity-30"><Bracket pos="tr" /></span>
                <span className="absolute bottom-3 left-3 opacity-30"><Bracket pos="bl" /></span>
                <span className="absolute bottom-3 right-3 opacity-30"><Bracket pos="br" /></span>
                <p className="font-display italic text-ink-soft mb-2" style={{ fontSize: "1.1rem", fontWeight: 500 }}>you&apos;re not watching anything yet</p>
                <h2 className="font-display font-bold text-ink mb-3" style={{ fontSize: "clamp(2rem, 5vw, 3rem)", letterSpacing: "-0.02em", lineHeight: 1 }}>
                  Add your first product
                </h2>
                <p className="font-body text-sm text-ink-soft mb-8 max-w-xs">
                  Paste a product link, pick your sizes, and we&apos;ll email you the second it comes back in stock.
                </p>
                <Link href={ROUTES.SETTINGS} className="inline-block px-6 py-3 bg-ink text-paper font-mono text-[0.65rem] tracking-[0.1em] uppercase shadow-hard-sm hover-lift">
                  Start Watching →
                </Link>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                {data.products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
