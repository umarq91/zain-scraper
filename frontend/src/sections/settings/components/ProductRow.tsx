"use client";

import { ALL_SIZES } from "@/constants/sizes";
import { formatHandle, formatStoreDomain } from "@/lib/utils";
import type { Product } from "@/types";

export function ProductRow({
  product,
  intervalMinutes,
  onRemove,
  onTogglePause,
  onToggleSize,
  onToggleNotify,
}: {
  product: Product;
  intervalMinutes: number;
  onRemove: () => void;
  onTogglePause: () => void;
  onToggleSize: (size: string) => void;
  onToggleNotify: (mode: "once" | "always") => void;
}) {
  const name = formatHandle(product.handle);
  const store = formatStoreDomain(product.url);
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="relative bg-paper-pure flex gap-0" style={product.is_paused ? { opacity: 0.65 } : {}}>
      {product.is_paused && (
        <div className="absolute left-0 top-0 bottom-0 w-0.5" style={{ background: "var(--ink-soft)" }} />
      )}

      <div className="flex-shrink-0 border-r border-grid-line overflow-hidden" style={{ width: 120, alignSelf: "stretch", minHeight: 120 }}>
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image_url} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-grid flex items-center justify-center relative overflow-hidden">
            <svg className="absolute inset-0 w-full h-full" aria-hidden="true">
              <line x1="0" y1="100%" x2="100%" y2="0" stroke="var(--grid-line)" strokeWidth="1" />
              <line x1="-30%" y1="100%" x2="70%" y2="0" stroke="var(--grid-line)" strokeWidth="1" />
              <line x1="30%" y1="100%" x2="130%" y2="0" stroke="var(--grid-line)" strokeWidth="1" />
            </svg>
            <span className="font-display font-bold select-none relative" style={{ fontSize: "3rem", color: "var(--ink)", opacity: 0.07, lineHeight: 1 }}>
              {initial}
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 px-5 py-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <p className="font-display font-semibold text-ink leading-tight" style={{ fontSize: "1rem" }}>{name}</p>
              {product.is_paused && (
                <span className="font-mono text-[0.5rem] tracking-[0.1em] uppercase px-1.5 py-0.5 border border-ink-soft text-ink-soft">Paused</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <p className="font-mono text-[0.58rem] text-ink-soft opacity-40 truncate">{store}</p>
              <a href={product.url} target="_blank" rel="noopener noreferrer" className="font-mono text-[0.55rem] tracking-widest uppercase text-ink-soft opacity-40 hover:opacity-100 hover:text-accent transition-opacity flex-shrink-0">↗</a>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={onTogglePause} className="font-mono text-[0.58rem] tracking-widest uppercase border px-2.5 py-1.5 transition-colors border-grid-line text-ink-soft hover:border-ink hover:text-ink">
              {product.is_paused ? "Resume" : "Pause"}
            </button>
            <button onClick={onRemove} className="font-mono text-[0.65rem] text-ink-soft hover:text-red-600 border border-grid-line w-7 h-7 flex items-center justify-center transition-colors">
              ×
            </button>
          </div>
        </div>

        <div className="mb-4">
          <p className="font-mono text-[0.52rem] tracking-[0.1em] uppercase text-ink-soft opacity-40 mb-2">Watching sizes</p>
          <div className="flex flex-wrap gap-2">
            {ALL_SIZES.map((size) => {
              const active = product.watch_sizes.includes(size);
              return (
                <button
                  key={size}
                  onClick={() => onToggleSize(size)}
                  className={`font-mono text-[0.62rem] tracking-widest uppercase px-3 py-1.5 border transition-all ${active ? "bg-ink text-paper border-ink shadow-hard-sm" : "bg-paper text-ink-soft border-grid-line hover:border-ink hover:text-ink"}`}
                  style={active ? { transform: "rotate(-0.3deg)" } : {}}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <p className="font-mono text-[0.52rem] tracking-[0.1em] uppercase text-ink-soft opacity-40 flex-shrink-0">Notify</p>
          <div className="flex border border-grid-line overflow-hidden">
            {(["once", "always"] as const).map((mode) => {
              const active = (product.notify_mode ?? "once") === mode;
              return (
                <button
                  key={mode}
                  onClick={() => onToggleNotify(mode)}
                  className={`font-mono text-[0.55rem] tracking-[0.08em] uppercase px-3 py-1 transition-colors ${active ? "bg-ink text-paper" : "text-ink-soft hover:text-ink bg-paper-pure"}`}
                >
                  {mode === "once" ? "Once" : `Every ${intervalMinutes} min`}
                </button>
              );
            })}
          </div>
          <p className="font-mono text-[0.5rem] text-ink-soft opacity-30 leading-tight">
            {(product.notify_mode ?? "once") === "once" ? "Alert once per restock" : `Alert every ${intervalMinutes} min while in stock`}
          </p>
        </div>
      </div>
    </div>
  );
}
