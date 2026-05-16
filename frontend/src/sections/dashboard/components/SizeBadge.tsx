"use client";

export function SizeBadge({ size, avail }: { size: string; avail: boolean | null }) {
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
