"use client";

import Link from "next/link";
import { ROUTES } from "@/constants/routes";

export function Footer() {
  return (
    <footer
      className="border-t border-ink bg-paper-pure px-6"
      style={{ boxShadow: "inset 0 2px 0 #0A0A0A" }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Main row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 py-8 border-b border-grid-line">
          {/* Brand */}
          <div>
            <span
              className="font-display font-bold text-ink block"
              style={{ fontSize: "1.15rem", letterSpacing: "-0.02em" }}
            >
              StockWatch
            </span>
            <span className="font-mono text-[0.55rem] tracking-[0.14em] uppercase text-ink-soft opacity-50 mt-0.5 block">
              your size radar
            </span>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-0 border border-ink">
            <Link
              href={ROUTES.LOGIN}
              className="font-mono text-[0.62rem] tracking-widest uppercase px-5 py-2.5 text-ink-soft hover:text-ink hover:bg-paper transition-colors border-r border-ink"
            >
              Sign In
            </Link>
            <Link
              href={ROUTES.LOGIN}
              className="font-mono text-[0.62rem] tracking-widest uppercase px-5 py-2.5 bg-ink text-paper hover:bg-accent transition-colors"
            >
              Get Started →
            </Link>
          </nav>
        </div>

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 py-4">
          <span className="font-mono text-[0.55rem] tracking-widest uppercase text-ink-soft opacity-40">
            © {new Date().getFullYear()} StockWatch — all rights reserved
          </span>
          <span className="font-mono text-[0.55rem] tracking-widest uppercase text-ink-soft opacity-30">
            Works with any Shopify store
          </span>
        </div>
      </div>
    </footer>
  );
}
