"use client";

export function LoadingSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="bg-paper-pure border border-ink overflow-hidden" style={{ boxShadow: "4px 4px 0 #0A0A0A" }}>
          <div className="h-64 border-b border-grid-line relative overflow-hidden bg-grid">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-paper to-transparent animate-[shimmer_1.5s_infinite]" style={{ backgroundSize: "200% 100%" }} />
          </div>
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
  );
}
