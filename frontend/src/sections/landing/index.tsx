"use client";

import Link from "next/link";
import { motion, MotionConfig } from "framer-motion";
import { Bracket } from "@/components/shared/Bracket";
import { DashboardMockup } from "./components/DashboardMockup";
import { HowItWorks } from "./components/HowItWorks";
import { ROUTES } from "@/constants/routes";

const ease = [0.16, 1, 0.3, 1] as const;

export default function LandingPage() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="bg-grid relative">

        <motion.header
          className="sticky top-0 z-30 border-b border-grid-line bg-paper"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease }}
        >
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <span className="font-display font-bold text-xl tracking-tight select-none">StockWatch</span>
            <nav className="flex items-center gap-3">
              <Link href={ROUTES.LOGIN} className="font-mono text-[0.62rem] tracking-widest uppercase text-ink-soft hover:text-ink transition-colors px-2 py-1">
                Sign In
              </Link>
              <Link
                href={ROUTES.LOGIN}
                className="bg-ink text-paper font-mono text-[0.62rem] tracking-widest uppercase px-4 py-2.5 shadow-hard-sm hover-lift"
                style={{ transition: "box-shadow 0.1s ease, transform 0.1s ease" }}
              >
                Get Started →
              </Link>
            </nav>
          </div>
        </motion.header>

        <section className="relative min-h-[calc(100vh-65px)] flex items-center overflow-hidden px-6 py-24">
          {(["tl", "tr", "bl", "br"] as const).map((pos, i) => (
            <motion.span
              key={pos}
              className={`absolute pointer-events-none ${pos === "tl" ? "top-6 left-6" : pos === "tr" ? "top-6 right-6" : pos === "bl" ? "bottom-6 left-6" : "bottom-6 right-6"}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.25 }}
              transition={{ duration: 0.6, delay: 0.1 + i * 0.05 }}
            >
              <Bracket pos={pos} size={28} />
            </motion.span>
          ))}

          <motion.span
            aria-hidden="true"
            className="absolute right-0 top-1/2 -translate-y-1/2 font-display font-bold italic pointer-events-none"
            style={{ fontSize: "clamp(8rem, 24vw, 22rem)", lineHeight: 1, color: "transparent", WebkitTextStroke: "1.5px var(--grid-line)", userSelect: "none", letterSpacing: "-0.03em" }}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, ease }}
          >
            STOCK
          </motion.span>

          <div className="max-w-6xl mx-auto w-full relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-16 xl:gap-24 items-center">

              <div>
                <motion.div
                  className="inline-flex items-center gap-2 border border-ink bg-paper-pure shadow-hard-sm px-3 py-1.5 mb-10"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease, delay: 0.15 }}
                >
                  <motion.span
                    className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0"
                    animate={{ scale: [1, 1.6, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                  />
                  <span className="font-mono text-[0.58rem] uppercase tracking-[0.15em] text-ink-soft">
                    Restock alerts · never miss a drop
                  </span>
                </motion.div>

                <h1 className="font-display mb-8" style={{ lineHeight: 0.92 }}>
                  <motion.span className="italic font-medium block text-ink-soft" style={{ fontSize: "clamp(1.1rem, 2.8vw, 1.7rem)", lineHeight: 1.4, marginBottom: "0.3em" }} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease, delay: 0.25 }}>
                    never miss
                  </motion.span>
                  <motion.span className="font-bold block" style={{ fontSize: "clamp(4rem, 10vw, 7.5rem)", letterSpacing: "-0.025em", lineHeight: 0.88 }} initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease, delay: 0.35 }}>
                    YOUR
                  </motion.span>
                  <motion.span className="font-bold block" style={{ fontSize: "clamp(4rem, 10vw, 7.5rem)", letterSpacing: "-0.025em", lineHeight: 0.88 }} initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease, delay: 0.45 }}>
                    SIZE
                    <span className="font-bold italic inline-block ml-3" style={{ background: "var(--accent)", color: "var(--paper)", padding: "0.05em 0.2em 0.12em", transform: "rotate(-1.5deg)", borderRadius: "2px", fontSize: "0.88em", verticalAlign: "baseline" }}>
                      again.
                    </span>
                  </motion.span>
                  <motion.span className="italic font-medium block text-ink-soft mt-3" style={{ fontSize: "clamp(1.1rem, 2.8vw, 1.7rem)", lineHeight: 1.4 }} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease, delay: 0.55 }}>
                    the moment it&apos;s back.
                  </motion.span>
                </h1>

                <motion.p className="font-body text-ink-soft mb-10 leading-relaxed max-w-[460px]" style={{ fontSize: "clamp(0.95rem, 1.6vw, 1.1rem)" }} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease, delay: 0.65 }}>
                  Paste a product link, pick the sizes you want, and we&apos;ll email you the{" "}
                  <em className="font-semibold text-ink not-italic">exact moment</em>{" "}
                  they&apos;re back in stock. No refreshing. No missing out.
                </motion.p>

                <motion.div className="flex flex-wrap gap-4 mb-8" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease, delay: 0.75 }}>
                  <Link href={ROUTES.LOGIN} className="bg-accent text-paper font-mono text-[0.68rem] uppercase tracking-widest px-8 py-4 shadow-hard hover-lift font-medium" style={{ transition: "box-shadow 0.1s ease, transform 0.1s ease" }}>
                    Start Watching Free →
                  </Link>
                  <Link href={ROUTES.LOGIN} className="border border-ink bg-paper-pure font-mono text-[0.68rem] uppercase tracking-widest px-8 py-4 shadow-hard-sm hover-lift font-medium" style={{ transition: "box-shadow 0.1s ease, transform 0.1s ease" }}>
                    Sign In
                  </Link>
                </motion.div>

                <motion.div
                  className="flex flex-wrap items-center gap-x-6 gap-y-2"
                  initial="hidden"
                  animate="visible"
                  variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.85 } } }}
                >
                  {["Free to start", "Email alerts", "Any product link"].map((item) => (
                    <motion.span key={item} className="flex items-center gap-1.5" variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease } } }}>
                      <span className="text-accent font-bold text-xs leading-none">✓</span>
                      <span className="font-mono text-[0.58rem] uppercase tracking-widest text-ink-soft">{item}</span>
                    </motion.span>
                  ))}
                </motion.div>
              </div>

              <motion.div className="hidden lg:block" initial={{ opacity: 0, x: 48 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.65, ease, delay: 0.4 }}>
                <DashboardMockup />
              </motion.div>

            </div>
          </div>
        </section>

        <HowItWorks />

      </div>
    </MotionConfig>
  );
}
