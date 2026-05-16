"use client";

export function SizePill({
  label,
  state,
}: {
  label: string;
  state: "available" | "sold-out" | "watching";
}) {
  if (state === "available") {
    return (
      <span
        className="font-mono text-[0.6rem] font-bold px-2.5 py-1.5 uppercase tracking-wider"
        style={{
          background: "var(--accent)",
          color: "var(--paper)",
          borderRadius: "2px",
          transform: "rotate(-0.3deg)",
          display: "inline-block",
        }}
      >
        {label}
      </span>
    );
  }
  if (state === "sold-out") {
    return (
      <span className="font-mono text-[0.6rem] border border-ink px-2.5 py-1.5 uppercase tracking-wider text-ink-soft line-through opacity-30">
        {label}
      </span>
    );
  }
  return (
    <span className="font-mono text-[0.6rem] border border-grid-line px-2.5 py-1.5 uppercase tracking-wider text-ink-soft">
      {label}
    </span>
  );
}
