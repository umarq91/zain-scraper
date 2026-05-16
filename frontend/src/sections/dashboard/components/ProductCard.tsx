"use client";

import Link from "next/link";
import { Bracket } from "@/components/shared/Bracket";
import { SizeBadge } from "./SizeBadge";
import { cleanUrl, formatRelativeTime } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import type { ProductWithState } from "@/types";

export function ProductCard({ product }: { product: ProductWithState }) {
  const available = Object.values(product.sizes).filter(Boolean).length;
  const total = Object.keys(product.sizes).length;
  const hasAny = available > 0;
  const allUnknown = Object.values(product.sizes).every((v) => v === null);
  const isPaused = product.is_paused ?? false;
  const initial = product.name.charAt(0).toUpperCase();
  const lastChecked = product.last_checked_at;
  const isRecent = lastChecked
    ? Date.now() - new Date(lastChecked).getTime() < 6 * 60_000
    : false;

  return (
    <div
      className="relative bg-paper-pure border border-ink overflow-hidden flex flex-col"
      style={{
        boxShadow: isPaused ? "4px 4px 0 var(--grid-line)" : hasAny ? "4px 4px 0 var(--accent)" : "4px 4px 0 #0A0A0A",
        opacity: isPaused ? 0.65 : 1,
      }}
    >
      <div className="relative h-64 border-b border-grid-line flex-shrink-0">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image_url} alt={product.name} className="w-full h-full object-contain" />
        ) : (
          <div className="w-full h-full bg-grid flex items-center justify-center relative overflow-hidden">
            <span className="font-display font-bold select-none pointer-events-none" style={{ fontSize: "7rem", lineHeight: 1, color: "var(--ink)", opacity: 0.06 }}>
              {initial}
            </span>
            <svg className="absolute inset-0 w-full h-full" aria-hidden="true">
              <line x1="0" y1="100%" x2="100%" y2="0" stroke="var(--grid-line)" strokeWidth="1" />
              <line x1="-20%" y1="100%" x2="80%" y2="0" stroke="var(--grid-line)" strokeWidth="1" />
              <line x1="20%" y1="100%" x2="120%" y2="0" stroke="var(--grid-line)" strokeWidth="1" />
            </svg>
          </div>
        )}

        <span
          className="absolute top-3 left-3 font-mono text-[0.58rem] tracking-[0.14em] uppercase font-medium px-2 py-0.5"
          style={
            isPaused ? { background: "var(--paper)", color: "var(--ink-soft)", border: "1px solid var(--ink-soft)" }
            : allUnknown ? { background: "var(--paper)", color: "var(--ink-soft)", border: "1px solid var(--grid-line)" }
            : hasAny ? { background: "var(--accent)", color: "var(--paper)", borderRadius: "2px", transform: "rotate(-0.3deg)", display: "inline-block" }
            : { background: "var(--ink)", color: "var(--paper)", borderRadius: "2px" }
          }
        >
          {isPaused ? "Paused" : allUnknown ? "Not Yet Checked" : hasAny ? "In Stock" : "Sold Out"}
        </span>

        <a
          href={cleanUrl(product.url)}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-3 right-3 font-mono text-[0.58rem] tracking-widest uppercase px-2 py-0.5 hover:bg-accent hover:text-paper transition-colors"
          style={{ background: "var(--paper)", border: "1px solid var(--grid-line)", color: "var(--ink-soft)" }}
        >
          View ↗
        </a>

        <span className="absolute top-0 left-0 translate-x-[-1px] translate-y-[-1px] opacity-30 pointer-events-none">
          <Bracket pos="tl" />
        </span>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h2 className="font-display font-bold text-ink mb-1 leading-tight line-clamp-2" style={{ fontSize: "1.1rem", letterSpacing: "-0.01em" }}>
          {product.name}
        </h2>
        <p className="font-mono text-[0.6rem] text-ink-soft opacity-50 truncate mb-4">
          {product.url.replace(/^https?:\/\//, "").replace(/\/products\/.*/, "")}
        </p>

        {product.watch_sizes.length === 0 ? (
          <p className="font-mono text-[0.6rem] uppercase tracking-widest text-ink-soft opacity-40">
            No sizes selected —{" "}
            <Link href={ROUTES.SETTINGS} className="underline hover:text-accent">pick some</Link>
          </p>
        ) : (
          <div className="flex flex-wrap gap-2 mb-4">
            {product.watch_sizes.map((size) => (
              <SizeBadge key={size} size={size} avail={product.sizes[size]} />
            ))}
          </div>
        )}

        <div className="mt-auto pt-3 border-t border-grid-line space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[0.58rem] tracking-widest uppercase text-ink-soft">
              {allUnknown ? "Not yet checked" : `${available} of ${total} in stock`}
            </span>
            {hasAny && <span className="font-display italic text-accent text-xs font-semibold">Buy fast →</span>}
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: isRecent ? "var(--accent)" : "var(--grid-line)" }}
            />
            <span className="font-mono text-[0.52rem] uppercase tracking-widest text-ink-soft opacity-60">
              {lastChecked ? `Checked ${formatRelativeTime(lastChecked)}` : "Waiting for first check"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
