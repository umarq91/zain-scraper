"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Bracket } from "@/components/shared/Bracket";
import { ROUTES } from "@/constants/routes";

const ease = [0.16, 1, 0.3, 1] as const;

const STEPS = [
  {
    num: "01",
    title: "Paste any product URL",
    desc: "Copy the link from Nike, SNKRS, Adidas, or any supported store. If it sells out, we can watch it.",
    visual: (
      <div className="border border-grid-line bg-grid px-3 py-2 flex items-center gap-2 mt-4">
        <span className="font-mono text-[0.52rem] text-ink-soft">🔗</span>
        <span className="font-mono text-[0.52rem] text-ink-soft truncate">nike.com/t/sneaker-pro-...</span>
        <span className="font-mono text-[0.48rem] uppercase tracking-widest px-1.5 py-0.5 ml-auto flex-shrink-0" style={{ background: "var(--ink)", color: "var(--paper)" }}>
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
            className={`font-mono text-[0.6rem] px-2.5 py-1.5 uppercase tracking-wider border ${s === "M" || s === "L" ? "border-accent font-bold" : "border-grid-line text-ink-soft opacity-40"}`}
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
            <p className="font-mono text-[0.52rem] uppercase tracking-widest text-accent font-bold leading-none mb-0.5">Back in stock</p>
            <p className="font-body text-[0.65rem] text-ink">Size M just restocked</p>
          </div>
        </div>
      </div>
    ),
  },
] as const;

export function HowItWorks() {
  return (
    <section className="border-t border-grid-line bg-paper-pure py-24 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease }}
        >
          <div className="inline-flex items-center gap-2 border border-ink bg-paper shadow-hard-sm px-3 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
            <span className="font-mono text-[0.58rem] uppercase tracking-[0.15em] text-ink-soft">How it works</span>
          </div>
          <h2 className="font-display font-bold" style={{ fontSize: "clamp(2.2rem, 5vw, 3.8rem)", letterSpacing: "-0.025em", lineHeight: 0.9 }}>
            Three steps.
            <br />
            <span className="italic font-medium text-ink-soft">Zero effort.</span>
          </h2>
        </motion.div>

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
              <span className="absolute -top-px -left-px"><Bracket pos="tl" size={18} /></span>
              <span className="absolute -top-px -right-px"><Bracket pos="tr" size={18} /></span>
              <span className="absolute -bottom-px -left-px"><Bracket pos="bl" size={18} /></span>
              <span className="absolute -bottom-px -right-px"><Bracket pos="br" size={18} /></span>

              <div className="flex items-baseline gap-3 mb-5">
                <span className="font-display font-bold italic leading-none select-none" style={{ fontSize: "3.5rem", color: "var(--grid-line)", lineHeight: 1 }}>
                  {step.num}
                </span>
                {i < STEPS.length - 1 && (
                  <span className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 font-mono text-ink-soft text-sm font-bold">→</span>
                )}
              </div>

              <h3 className="font-display font-bold mb-2" style={{ fontSize: "clamp(1.1rem, 1.8vw, 1.3rem)", lineHeight: 1.1 }}>
                {step.title}
              </h3>
              <p className="font-body text-sm text-ink-soft leading-relaxed">{step.desc}</p>
              {step.visual}
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-12 flex justify-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease, delay: 0.3 }}
        >
          <Link
            href={ROUTES.LOGIN}
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
