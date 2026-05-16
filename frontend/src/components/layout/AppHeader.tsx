import type { ReactNode } from "react";

export function AppHeader({
  children,
  maxWidth = "max-w-5xl",
}: {
  children: ReactNode;
  maxWidth?: string;
}) {
  return (
    <header
      className="bg-paper-pure border-b border-ink sticky top-0 z-20"
      style={{ boxShadow: "0 2px 0 #0A0A0A" }}
    >
      <div className={`${maxWidth} mx-auto px-6 flex items-stretch`}>
        {children}
      </div>
    </header>
  );
}
