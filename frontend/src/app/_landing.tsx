"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, MotionConfig, AnimatePresence } from "framer-motion";

const ease = [0.16, 1, 0.3, 1] as const;

function Bracket({
  pos,
  color = "#0A0A0A",
  size = 24,
}: {
  pos: "tl" | "tr" | "bl" | "br";
  color?: string;
  size?: number;
}) {
  const t = { tl: "", tr: "scaleX(-1)", bl: "scaleY(-1)", br: "scale(-1,-1)" }[pos];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      aria-hidden="true"
      style={{ display: "block", transform: t }}
    >
      <path d="M2 16 L2 2 L16 2" fill="none" stroke={color} strokeWidth="2.5" />
    </svg>
  );
}

function SizePill({
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

// ─── Dashboard Mockup ─────────────────────────────────────────────────────────

function DashboardMockup() {
  const [demoPhase, setDemoPhase] = useState<"available" | "sold-out">("available");
  const [notifVisible, setNotifVisible] = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    // Show notif after entry animations settle
    timers.push(setTimeout(() => setNotifVisible(true), 1200));

    // Live demo cycle: available → sold-out → available …
    function cycle() {
      setDemoPhase("sold-out");
      setNotifVisible(false);
      timers.push(
        setTimeout(() => {
          setDemoPhase("available");
          timers.push(setTimeout(() => setNotifVisible(true), 450));
        }, 2200)
      );
      timers.push(setTimeout(cycle, 5500));
    }
    timers.push(setTimeout(cycle, 4000));

    return () => timers.forEach(clearTimeout);
  }, []);

  const isAvailable = demoPhase === "available";

  return (
    // Bob float — everything lifts together
    <motion.div
      className="relative select-none"
      animate={{ y: [0, -9, 0] }}
      transition={{ delay: 1.4, duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Floating email alert — AnimatePresence controlled */}
      <AnimatePresence>
        {notifVisible && (
          <motion.div
            key="notif"
            className="absolute -top-6 -right-4 z-20 bg-paper-pure border-2 border-accent shadow-hard-accent px-4 py-3 min-w-[190px]"
            initial={{ opacity: 0, scale: 0.75, y: 10, rotate: 1.5 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotate: 1.5 }}
            exit={{ opacity: 0, scale: 0.8, y: 6, rotate: 1.5 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
          >
            <span className="absolute -top-px -left-px"><Bracket pos="tl" color="#F26B1F" size={16} /></span>
            <span className="absolute -top-px -right-px"><Bracket pos="tr" color="#F26B1F" size={16} /></span>
            <span className="absolute -bottom-px -left-px"><Bracket pos="bl" color="#F26B1F" size={16} /></span>
            <span className="absolute -bottom-px -right-px"><Bracket pos="br" color="#F26B1F" size={16} /></span>
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 text-base leading-none">📧</span>
              <div>
                <p className="font-mono text-[0.58rem] uppercase tracking-widest text-accent font-bold leading-none mb-1">
                  Back in stock
                </p>
                <p className="font-body text-xs text-ink leading-snug">
                  Size <strong>M</strong> just restocked
                </p>
                <p className="font-mono text-[0.52rem] text-ink-soft mt-1 uppercase tracking-wide">
                  just now
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main dashboard card */}
      <div className="bg-paper-pure border border-ink shadow-hard-lg relative">
        <span className="absolute -top-px -left-px"><Bracket pos="tl" /></span>
        <span className="absolute -top-px -right-px"><Bracket pos="tr" /></span>
        <span className="absolute -bottom-px -left-px"><Bracket pos="bl" /></span>
        <span className="absolute -bottom-px -right-px"><Bracket pos="br" /></span>

        <div className="border-b border-grid-line px-4 py-2.5 flex items-center justify-between">
          <span className="font-mono text-[0.58rem] uppercase tracking-widest text-ink font-bold">
            StockWatch
          </span>
          <span className="font-mono text-[0.52rem] uppercase tracking-widest text-ink-soft">
            3 watching
          </span>
        </div>

        <div className="p-4 space-y-3">
          {/* Row 1 — live demo row */}
          <motion.div
            className="bg-paper-pure p-3 relative border"
            initial={{ opacity: 0, x: -8, borderColor: "#F26B1F", boxShadow: "3px 3px 0 #F26B1F" }}
            animate={{
              opacity: 1,
              x: 0,
              borderColor: isAvailable ? "#F26B1F" : "#d4d4d4",
              boxShadow: isAvailable ? "3px 3px 0 #F26B1F" : "3px 3px 0 transparent",
            }}
            transition={{
              opacity: { duration: 0.4, ease, delay: 0.55 },
              x: { duration: 0.4, ease, delay: 0.55 },
              borderColor: { duration: 0.35 },
              boxShadow: { duration: 0.35 },
            }}
          >
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 border border-grid-line bg-grid flex-shrink-0 flex items-center justify-center">
                <span className="font-display font-bold italic text-2xl text-grid-line">A</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <motion.p
                    className="font-display font-bold text-sm leading-tight truncate"
                    animate={{ color: isAvailable ? "var(--ink)" : "var(--ink-soft)" }}
                    transition={{ duration: 0.3 }}
                  >
                    Classic Sneaker
                  </motion.p>
                  <AnimatePresence mode="wait">
                    {isAvailable ? (
                      <motion.span
                        key="in-stock"
                        className="font-mono text-[0.5rem] uppercase tracking-widest px-1.5 py-0.5 flex-shrink-0"
                        style={{ background: "var(--accent)", color: "var(--paper)" }}
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.22 }}
                      >
                        IN STOCK
                      </motion.span>
                    ) : (
                      <motion.span
                        key="sold-out"
                        className="font-mono text-[0.5rem] uppercase tracking-widest px-1.5 py-0.5 border border-ink text-ink-soft flex-shrink-0"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.22 }}
                      >
                        SOLD OUT
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <div className="flex gap-1.5 flex-wrap items-center">
                  <SizePill label="S" state="sold-out" />
                  {/* M pill — live animated */}
                  <AnimatePresence mode="wait">
                    {isAvailable ? (
                      <motion.span
                        key="m-avail"
                        className="font-mono text-[0.6rem] font-bold px-2.5 py-1.5 uppercase tracking-wider"
                        style={{ background: "var(--accent)", color: "var(--paper)", borderRadius: "2px", display: "inline-block" }}
                        initial={{ opacity: 0, scale: 0.65 }}
                        animate={{ opacity: 1, scale: 1, rotate: -0.3 }}
                        exit={{ opacity: 0, scale: 0.65 }}
                        transition={{ type: "spring", stiffness: 380, damping: 22 }}
                      >
                        M
                      </motion.span>
                    ) : (
                      <motion.span
                        key="m-sold"
                        className="font-mono text-[0.6rem] border border-ink px-2.5 py-1.5 uppercase tracking-wider text-ink-soft line-through"
                        style={{ display: "inline-block" }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.3 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        M
                      </motion.span>
                    )}
                  </AnimatePresence>
                  <SizePill label="L" state="sold-out" />
                  <SizePill label="XL" state="sold-out" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Row 2 */}
          <motion.div
            className="border border-grid-line bg-paper p-3"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease, delay: 0.65 }}
          >
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 border border-grid-line bg-grid flex-shrink-0 flex items-center justify-center">
                <span className="font-display font-bold italic text-2xl text-grid-line">B</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <p className="font-display font-bold text-sm leading-tight truncate text-ink-soft">Runner Pro</p>
                  <span className="font-mono text-[0.5rem] uppercase tracking-widest px-1.5 py-0.5 border border-ink text-ink-soft flex-shrink-0">
                    SOLD OUT
                  </span>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  <SizePill label="M" state="sold-out" />
                  <SizePill label="L" state="sold-out" />
                  <SizePill label="XL" state="sold-out" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Row 3 */}
          <motion.div
            className="border border-grid-line bg-paper p-3 opacity-60"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 0.6, x: 0 }}
            transition={{ duration: 0.4, ease, delay: 0.75 }}
          >
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 border border-grid-line bg-grid flex-shrink-0 flex items-center justify-center">
                <span className="font-display font-bold italic text-2xl text-grid-line">C</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display font-bold text-sm leading-tight mb-1.5 text-ink-soft">Vintage Tee</p>
                <div className="flex gap-1.5 flex-wrap">
                  <SizePill label="S" state="watching" />
                  <SizePill label="M" state="watching" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Floating bottom stat */}
      <motion.div
        className="absolute -bottom-4 -left-3 z-10 bg-paper-pure border border-ink shadow-hard-sm px-3 py-2 flex items-center gap-2"
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease, delay: 0.9 }}
      >
        <motion.span
          className="w-1.5 h-1.5 rounded-full bg-accent"
          animate={{ scale: [1, 1.6, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />
        <span className="font-mono text-[0.55rem] uppercase tracking-widest">
          checked 2 min ago
        </span>
      </motion.div>
    </motion.div>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────

const STEPS = [
  {
    num: "01",
    title: "Paste any product URL",
    desc: "Copy the link from Nike, SNKRS, Adidas, or any supported store. If it sells out, we can watch it.",
    visual: (
      <div className="border border-grid-line bg-grid px-3 py-2 flex items-center gap-2 mt-4">
        <span className="font-mono text-[0.52rem] text-ink-soft">🔗</span>
        <span className="font-mono text-[0.52rem] text-ink-soft truncate">nike.com/t/sneaker-pro-...</span>
        <span
          className="font-mono text-[0.48rem] uppercase tracking-widest px-1.5 py-0.5 ml-auto flex-shrink-0"
          style={{ background: "var(--ink)", color: "var(--paper)" }}
        >
          Add
        </span>
      </div>
    ),
  },
  {
    num: "02",
    title: "Pick your exact sizes",
    desc: "Select only the sizes you want. No noise — you hear about what matters to you, nothing else.",
    visual: (
      <div className="flex gap-1.5 flex-wrap mt-4">
        {["XS", "S", "M", "L", "XL"].map((s) => (
          <span
            key={s}
            className={`font-mono text-[0.6rem] px-2.5 py-1.5 uppercase tracking-wider border ${
              s === "M" || s === "L"
                ? "border-accent font-bold"
                : "border-grid-line text-ink-soft opacity-40"
            }`}
            style={s === "M" || s === "L" ? { background: "var(--accent)", color: "var(--paper)", borderRadius: "2px" } : {}}
          >
            {s}
          </span>
        ))}
      </div>
    ),
  },
  {
    num: "03",
    title: "Get the email instantly",
    desc: "The moment your size restocks, you get an alert. Be first in line. Actually get the drop.",
    visual: (
      <div className="border-2 border-accent px-3 py-2.5 mt-4 relative" style={{ boxShadow: "2px 2px 0 var(--accent)" }}>
        <span className="absolute -top-px -left-px"><Bracket pos="tl" color="#F26B1F" size={12} /></span>
        <span className="absolute -top-px -right-px"><Bracket pos="tr" color="#F26B1F" size={12} /></span>
        <div className="flex items-center gap-2">
          <span className="text-sm">📧</span>
          <div>
            <p className="font-mono text-[0.52rem] uppercase tracking-widest text-accent font-bold leading-none mb-0.5">
              Back in stock
            </p>
            <p className="font-body text-[0.65rem] text-ink">Size M just restocked</p>
          </div>
        </div>
      </div>
    ),
  },
] as const;

function HowItWorks() {
  return (
    <section className="border-t border-grid-line bg-paper-pure py-24 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease }}
        >
          <div className="inline-flex items-center gap-2 border border-ink bg-paper shadow-hard-sm px-3 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
            <span className="font-mono text-[0.58rem] uppercase tracking-[0.15em] text-ink-soft">
              How it works
            </span>
          </div>
          <h2
            className="font-display font-bold"
            style={{ fontSize: "clamp(2.2rem, 5vw, 3.8rem)", letterSpacing: "-0.025em", lineHeight: 0.9 }}
          >
            Three steps.
            <br />
            <span className="italic font-medium text-ink-soft">Zero effort.</span>
          </h2>
        </motion.div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-grid-line border border-grid-line">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              className="bg-paper-pure p-8 relative"
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, ease, delay: i * 0.1 }}
            >
              {/* Corner brackets */}
              <span className="absolute -top-px -left-px"><Bracket pos="tl" size={18} /></span>
              <span className="absolute -top-px -right-px"><Bracket pos="tr" size={18} /></span>
              <span className="absolute -bottom-px -left-px"><Bracket pos="bl" size={18} /></span>
              <span className="absolute -bottom-px -right-px"><Bracket pos="br" size={18} /></span>

              {/* Number + step indicator */}
              <div className="flex items-baseline gap-3 mb-5">
                <span
                  className="font-display font-bold italic leading-none select-none"
                  style={{ fontSize: "3.5rem", color: "var(--grid-line)", lineHeight: 1 }}
                >
                  {step.num}
                </span>
                {i < STEPS.length - 1 && (
                  <span className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 font-mono text-ink-soft text-sm font-bold">
                    →
                  </span>
                )}
              </div>

              <h3
                className="font-display font-bold mb-2"
                style={{ fontSize: "clamp(1.1rem, 1.8vw, 1.3rem)", lineHeight: 1.1 }}
              >
                {step.title}
              </h3>
              <p className="font-body text-sm text-ink-soft leading-relaxed">
                {step.desc}
              </p>

              {step.visual}
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="mt-12 flex justify-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease, delay: 0.3 }}
        >
          <Link
            href="/login"
            className="bg-accent text-paper font-mono text-[0.68rem] uppercase tracking-widest px-10 py-4 shadow-hard hover-lift font-medium"
            style={{ transition: "box-shadow 0.1s ease, transform 0.1s ease" }}
          >
            Start Watching Free →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Landing Page ─────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="bg-grid relative">

        {/* ── NAV ── */}
        <motion.header
          className="sticky top-0 z-30 border-b border-grid-line bg-paper"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease }}
        >
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <span className="font-display font-bold text-xl tracking-tight select-none">
              StockWatch
            </span>
            <nav className="flex items-center gap-3">
              <Link
                href="/login"
                className="font-mono text-[0.62rem] tracking-widest uppercase text-ink-soft hover:text-ink transition-colors px-2 py-1"
              >
                Sign In
              </Link>
              <Link
                href="/login"
                className="bg-ink text-paper font-mono text-[0.62rem] tracking-widest uppercase px-4 py-2.5 shadow-hard-sm hover-lift"
                style={{ transition: "box-shadow 0.1s ease, transform 0.1s ease" }}
              >
                Get Started →
              </Link>
            </nav>
          </div>
        </motion.header>

        {/* ── HERO ── */}
        <section className="relative min-h-[calc(100vh-65px)] flex items-center overflow-hidden px-6 py-24">

          {/* Corner brackets */}
          {(["tl", "tr", "bl", "br"] as const).map((pos, i) => (
            <motion.span
              key={pos}
              className={`absolute pointer-events-none ${
                pos === "tl" ? "top-6 left-6" :
                pos === "tr" ? "top-6 right-6" :
                pos === "bl" ? "bottom-6 left-6" :
                "bottom-6 right-6"
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.25 }}
              transition={{ duration: 0.6, delay: 0.1 + i * 0.05 }}
            >
              <Bracket pos={pos} size={28} />
            </motion.span>
          ))}

          {/* Giant faint background word */}
          <motion.span
            aria-hidden="true"
            className="absolute right-0 top-1/2 -translate-y-1/2 font-display font-bold italic pointer-events-none"
            style={{
              fontSize: "clamp(8rem, 24vw, 22rem)",
              lineHeight: 1,
              color: "transparent",
              WebkitTextStroke: "1.5px var(--grid-line)",
              userSelect: "none",
              letterSpacing: "-0.03em",
            }}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, ease }}
          >
            STOCK
          </motion.span>

          <div className="max-w-6xl mx-auto w-full relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-16 xl:gap-24 items-center">

              {/* ── LEFT: Copy ── */}
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
                  <motion.span
                    className="italic font-medium block text-ink-soft"
                    style={{ fontSize: "clamp(1.1rem, 2.8vw, 1.7rem)", lineHeight: 1.4, marginBottom: "0.3em" }}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease, delay: 0.25 }}
                  >
                    never miss
                  </motion.span>

                  <motion.span
                    className="font-bold block"
                    style={{ fontSize: "clamp(4rem, 10vw, 7.5rem)", letterSpacing: "-0.025em", lineHeight: 0.88 }}
                    initial={{ opacity: 0, y: 22 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease, delay: 0.35 }}
                  >
                    YOUR
                  </motion.span>

                  <motion.span
                    className="font-bold block"
                    style={{ fontSize: "clamp(4rem, 10vw, 7.5rem)", letterSpacing: "-0.025em", lineHeight: 0.88 }}
                    initial={{ opacity: 0, y: 22 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease, delay: 0.45 }}
                  >
                    SIZE
                    <span
                      className="font-bold italic inline-block ml-3"
                      style={{
                        background: "var(--accent)",
                        color: "var(--paper)",
                        padding: "0.05em 0.2em 0.12em",
                        transform: "rotate(-1.5deg)",
                        borderRadius: "2px",
                        fontSize: "0.88em",
                        verticalAlign: "baseline",
                      }}
                    >
                      again.
                    </span>
                  </motion.span>

                  <motion.span
                    className="italic font-medium block text-ink-soft mt-3"
                    style={{ fontSize: "clamp(1.1rem, 2.8vw, 1.7rem)", lineHeight: 1.4 }}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease, delay: 0.55 }}
                  >
                    the moment it's back.
                  </motion.span>
                </h1>

                <motion.p
                  className="font-body text-ink-soft mb-10 leading-relaxed max-w-[460px]"
                  style={{ fontSize: "clamp(0.95rem, 1.6vw, 1.1rem)" }}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease, delay: 0.65 }}
                >
                  Paste a product link, pick the sizes you want, and we'll email you
                  the{" "}
                  <em className="font-semibold text-ink not-italic">exact moment</em>{" "}
                  they're back in stock. No refreshing. No missing out.
                </motion.p>

                <motion.div
                  className="flex flex-wrap gap-4 mb-8"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease, delay: 0.75 }}
                >
                  <Link
                    href="/login"
                    className="bg-accent text-paper font-mono text-[0.68rem] uppercase tracking-widest px-8 py-4 shadow-hard hover-lift font-medium"
                    style={{ transition: "box-shadow 0.1s ease, transform 0.1s ease" }}
                  >
                    Start Watching Free →
                  </Link>
                  <Link
                    href="/login"
                    className="border border-ink bg-paper-pure font-mono text-[0.68rem] uppercase tracking-widest px-8 py-4 shadow-hard-sm hover-lift font-medium"
                    style={{ transition: "box-shadow 0.1s ease, transform 0.1s ease" }}
                  >
                    Sign In
                  </Link>
                </motion.div>

                <motion.div
                  className="flex flex-wrap items-center gap-x-6 gap-y-2"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: {},
                    visible: { transition: { staggerChildren: 0.08, delayChildren: 0.85 } },
                  }}
                >
                  {["Free to start", "Email alerts", "Any product link"].map((item) => (
                    <motion.span
                      key={item}
                      className="flex items-center gap-1.5"
                      variants={{
                        hidden: { opacity: 0, y: 8 },
                        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease } },
                      }}
                    >
                      <span className="text-accent font-bold text-xs leading-none">✓</span>
                      <span className="font-mono text-[0.58rem] uppercase tracking-widest text-ink-soft">
                        {item}
                      </span>
                    </motion.span>
                  ))}
                </motion.div>
              </div>

              {/* ── RIGHT: Dashboard Mockup ── */}
              <motion.div
                className="hidden lg:block"
                initial={{ opacity: 0, x: 48 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.65, ease, delay: 0.4 }}
              >
                <DashboardMockup />
              </motion.div>

            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <HowItWorks />

      </div>
    </MotionConfig>
  );
}
