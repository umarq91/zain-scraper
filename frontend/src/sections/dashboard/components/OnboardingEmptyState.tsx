"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, MotionConfig, AnimatePresence } from "framer-motion";
import { Bracket } from "@/components/shared/Bracket";
import { ROUTES } from "@/constants/routes";

const ease = [0.16, 1, 0.3, 1] as const;

// ─── Step visuals ─────────────────────────────────────────────────────────────

function UrlVisual({ play }: { play: boolean }) {
  const TARGET = "nike.com/t/air-force-1-07";
  const [typed, setTyped] = useState("");

  useEffect(() => {
    if (!play) return;
    setTyped("");
    let i = 0;
    const t = setInterval(() => {
      i++;
      setTyped(TARGET.slice(0, i));
      if (i >= TARGET.length) clearInterval(t);
    }, 52);
    return () => clearInterval(t);
  }, [play]);

  return (
    <div className="mt-5 border border-ink bg-paper px-3 py-2.5 flex items-center gap-2 relative">
      <span className="absolute -top-px -left-px"><Bracket pos="tl" size={10} /></span>
      <span className="absolute -top-px -right-px"><Bracket pos="tr" size={10} /></span>
      <span className="font-mono text-[0.55rem] text-ink-soft opacity-40 flex-shrink-0">🔗</span>
      <span className="font-mono text-[0.58rem] text-ink truncate flex-1 min-w-0 leading-none">
        {typed}
        <motion.span
          className="inline-block w-[1.5px] h-3 bg-accent align-middle ml-px"
          animate={{ opacity: typed.length < TARGET.length ? [1, 0, 1] : 0 }}
          transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
        />
      </span>
    </div>
  );
}

function SizeVisual({ play }: { play: boolean }) {
  const SIZES = ["XS", "S", "M", "L", "XL"];
  const PICKS = ["M", "L"];
  const [active, setActive] = useState<string[]>([]);

  useEffect(() => {
    if (!play) return;
    setActive([]);
    let i = 0;
    const t = setInterval(() => {
      if (i < PICKS.length) setActive((prev) => [...prev, PICKS[i++]]);
      else clearInterval(t);
    }, 480);
    return () => clearInterval(t);
  }, [play]);

  return (
    <div className="mt-5 flex flex-wrap gap-1.5">
      {SIZES.map((s) => {
        const on = active.includes(s);
        return (
          <motion.span
            key={s}
            className="font-mono text-[0.62rem] tracking-wider uppercase px-2.5 py-1.5 border font-bold cursor-default select-none"
            animate={
              on
                ? { backgroundColor: "#F26B1F", color: "#ffffff", borderColor: "#F26B1F", scale: 1 }
                : { backgroundColor: "#ffffff", color: "#9AA4B2", borderColor: "#E4E4E0", scale: 1 }
            }
            whileHover={{ scale: 1.06 }}
            transition={{ type: "spring", stiffness: 360, damping: 24 }}
            style={{ borderRadius: "2px" }}
          >
            {s}
          </motion.span>
        );
      })}
    </div>
  );
}

function NotifVisual({ play }: { play: boolean }) {
  return (
    <AnimatePresence>
      {play && (
        <motion.div
          className="mt-5 border-2 border-accent bg-paper-pure px-3 py-2.5 relative"
          style={{ boxShadow: "3px 3px 0 #F26B1F" }}
          initial={{ opacity: 0, scale: 0.78, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
        >
          <span className="absolute -top-px -left-px"><Bracket pos="tl" color="#F26B1F" size={12} /></span>
          <span className="absolute -top-px -right-px"><Bracket pos="tr" color="#F26B1F" size={12} /></span>
          <span className="absolute -bottom-px -left-px"><Bracket pos="bl" color="#F26B1F" size={12} /></span>
          <span className="absolute -bottom-px -right-px"><Bracket pos="br" color="#F26B1F" size={12} /></span>
          <div className="flex items-start gap-2.5">
            <span className="text-base leading-none mt-0.5">📧</span>
            <div>
              <p className="font-mono text-[0.52rem] uppercase tracking-widest text-accent font-bold leading-none mb-1">
                Back in stock
              </p>
              <p className="font-body text-xs text-ink leading-snug">
                Size <strong>M</strong> just restocked
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <motion.span
                  className="w-1 h-1 rounded-full bg-accent"
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                <p className="font-mono text-[0.46rem] text-ink-soft uppercase tracking-wide">just now</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const STEPS = [
  {
    num: "01",
    title: "Grab the link",
    desc: "Paste any Shopify product URL — Nike, Gymshark, Supreme, anywhere.",
    Visual: UrlVisual,
    playDelay: 0,
  },
  {
    num: "02",
    title: "Pick your sizes",
    desc: "Choose exactly which sizes matter. We stay quiet about the rest.",
    Visual: SizeVisual,
    playDelay: 1500,
  },
  {
    num: "03",
    title: "Get the email",
    desc: "The second it restocks, we fire an alert. Be first. Actually get the drop.",
    Visual: NotifVisual,
    playDelay: 2600,
  },
] as const;

export function OnboardingEmptyState() {
  const [stepPlays, setStepPlays] = useState([false, false, false]);

  // Stagger step animations on mount, then loop every 8s
  useEffect(() => {
    function runCycle() {
      setStepPlays([false, false, false]);
      STEPS.forEach((step, i) => {
        setTimeout(() => {
          setStepPlays((prev) => {
            const next = [...prev];
            next[i] = true;
            return next;
          });
        }, step.playDelay + 200);
      });
    }

    runCycle();
    const loop = setInterval(runCycle, 8000);
    return () => clearInterval(loop);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        className="bg-paper-pure border border-ink shadow-hard-lg relative overflow-hidden"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
      >
        {/* Corner brackets */}
        <span className="absolute top-0 left-0 translate-x-[-1px] translate-y-[-1px]">
          <Bracket pos="tl" size={22} />
        </span>
        <span className="absolute top-0 right-0 translate-x-[1px] translate-y-[-1px]">
          <Bracket pos="tr" size={22} />
        </span>
        <span className="absolute bottom-0 left-0 translate-x-[-1px] translate-y-[1px]">
          <Bracket pos="bl" size={22} />
        </span>
        <span className="absolute bottom-0 right-0 translate-x-[1px] translate-y-[1px]">
          <Bracket pos="br" size={22} />
        </span>

        {/* Faint background text */}
        <span
          aria-hidden="true"
          className="absolute right-0 top-1/2 -translate-y-1/2 font-display font-bold italic pointer-events-none select-none"
          style={{
            fontSize: "clamp(6rem, 18vw, 14rem)",
            lineHeight: 1,
            color: "transparent",
            WebkitTextStroke: "1px var(--grid-line)",
            letterSpacing: "-0.03em",
          }}
        >
          WATCH
        </span>

        <div className="relative z-10 px-8 pt-10 pb-8">

          {/* Header */}
          <motion.div
            className="mb-10"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease, delay: 0.1 }}
          >
            <div className="inline-flex items-center gap-2 border border-grid-line bg-paper px-3 py-1 mb-5">
              <motion.span
                className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0"
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              />
              <span className="font-mono text-[0.55rem] uppercase tracking-[0.15em] text-ink-soft">
                3 easy steps
              </span>
            </div>

            <p
              className="font-display italic font-medium text-ink-soft mb-1"
              style={{ fontSize: "clamp(1rem, 2.2vw, 1.3rem)" }}
            >
              nothing here yet —
            </p>
            <h2
              className="font-display font-bold text-ink"
              style={{
                fontSize: "clamp(2.2rem, 6vw, 4rem)",
                letterSpacing: "-0.025em",
                lineHeight: 0.92,
              }}
            >
              Start watching
              <br />
              <span
                className="italic font-medium"
                style={{ color: "var(--accent)" }}
              >
                your first drop.
              </span>
            </h2>
          </motion.div>

          {/* Step grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-ink">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                className="p-6 relative"
                style={{ borderRight: i < 2 ? "1px solid var(--ink)" : undefined }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease, delay: 0.2 + i * 0.1 }}
              >
                {/* Step number */}
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="font-display font-bold italic leading-none select-none"
                    style={{ fontSize: "2.8rem", color: "var(--grid-line)", lineHeight: 1 }}
                  >
                    {step.num}
                  </span>
                  {i < STEPS.length - 1 && (
                    <motion.span
                      className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 font-mono text-ink font-bold text-base bg-paper-pure border border-ink w-6 h-6 flex items-center justify-center"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + i * 0.1, duration: 0.3, ease }}
                    >
                      →
                    </motion.span>
                  )}
                </div>

                <h3
                  className="font-display font-bold text-ink mb-1.5"
                  style={{ fontSize: "1.05rem", letterSpacing: "-0.01em" }}
                >
                  {step.title}
                </h3>
                <p className="font-body text-sm text-ink-soft leading-relaxed">
                  {step.desc}
                </p>

                <step.Visual play={stepPlays[i]} />
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            className="mt-8 flex flex-col sm:flex-row items-center gap-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease, delay: 0.5 }}
          >
            <Link
              href={ROUTES.SETTINGS}
              className="bg-accent text-paper font-mono text-[0.68rem] uppercase tracking-widest px-10 py-4 shadow-hard hover-lift font-medium"
              style={{ transition: "box-shadow 0.1s ease, transform 0.1s ease" }}
            >
              Start Watching Free →
            </Link>
            <span className="font-mono text-[0.55rem] uppercase tracking-widest text-ink-soft opacity-50">
              Takes less than a minute
            </span>
          </motion.div>
        </div>
      </motion.div>
    </MotionConfig>
  );
}
