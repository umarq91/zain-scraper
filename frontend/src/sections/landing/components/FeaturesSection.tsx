"use client";

import { motion } from "framer-motion";
import { Bracket } from "@/components/shared/Bracket";

const ease = [0.16, 1, 0.3, 1] as const;

const FEATURES = [
  {
    symbol: "✉",
    label: "Alerts",
    title: "Email you instantly",
    desc: "The moment your size comes back in stock, we fire an alert. Not batched. Not delayed. Right now.",
    featured: true,
  },
  {
    symbol: "◎",
    label: "Precision",
    title: "Exact sizes only",
    desc: "S restocked but you wear L? We stay quiet. You only hear about the sizes you actually want.",
    featured: false,
  },
  {
    symbol: "∞",
    label: "Stores",
    title: "Any Shopify store",
    desc: "Nike, Gymshark, Supreme, Palace — if it runs on Shopify, we can watch it. No setup needed.",
    featured: false,
  },
  {
    symbol: "⏸",
    label: "Control",
    title: "Pause, resume, remove",
    desc: "Going offline? Pause in one click. Back? Resume. Done? Delete. Full control, always yours.",
    featured: false,
  },
  {
    symbol: "⊞",
    label: "Bulk",
    title: "Add products in bulk",
    desc: "Watching a whole drop? Paste multiple URLs at once. We fetch and queue them all together.",
    featured: false,
  },
  {
    symbol: "↻",
    label: "Intervals",
    title: "You set the pace",
    desc: "Check every minute for high-demand drops or every 30 for casual watching. Your call entirely.",
    featured: false,
  },
] as const;

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
};

export function FeaturesSection() {
  return (
    <section className="border-t border-grid-line bg-paper py-24 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <motion.div
          className="mb-14"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease }}
        >
          <div className="inline-flex items-center gap-2 border border-ink bg-paper-pure shadow-hard-sm px-3 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
            <span className="font-mono text-[0.58rem] uppercase tracking-[0.15em] text-ink-soft">
              Why StockWatch
            </span>
          </div>
          <h2
            className="font-display font-bold"
            style={{ fontSize: "clamp(2.2rem, 5vw, 3.8rem)", letterSpacing: "-0.025em", lineHeight: 0.9 }}
          >
            Built for people who
            <br />
            <span className="italic font-medium text-ink-soft">actually need the drop.</span>
          </h2>
        </motion.div>

        {/* Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={containerVariants}
        >
          {FEATURES.map((f) => (
            <motion.div
              key={f.label}
              variants={cardVariants}
              className="relative overflow-hidden p-7"
              style={
                f.featured
                  ? {
                      background: "var(--paper-pure)",
                      border: "2px solid var(--accent)",
                      boxShadow: "6px 6px 0 var(--accent)",
                    }
                  : {
                      background: "var(--paper-pure)",
                      border: "1px solid var(--grid-line)",
                      boxShadow: "4px 4px 0 var(--grid-line)",
                    }
              }
            >
              {/* Corner brackets */}
              <span className="absolute -top-px -left-px">
                <Bracket pos="tl" color={f.featured ? "#F26B1F" : "#0A0A0A"} size={16} />
              </span>
              <span className="absolute -top-px -right-px">
                <Bracket pos="tr" color={f.featured ? "#F26B1F" : "#0A0A0A"} size={16} />
              </span>
              <span className="absolute -bottom-px -left-px">
                <Bracket pos="bl" color={f.featured ? "#F26B1F" : "#0A0A0A"} size={16} />
              </span>
              <span className="absolute -bottom-px -right-px">
                <Bracket pos="br" color={f.featured ? "#F26B1F" : "#0A0A0A"} size={16} />
              </span>

              {/* Faint background symbol */}
              <span
                aria-hidden="true"
                className="absolute right-4 top-3 font-mono select-none pointer-events-none"
                style={{
                  fontSize: "5rem",
                  lineHeight: 1,
                  opacity: f.featured ? 0.08 : 0.05,
                  color: f.featured ? "var(--accent)" : "var(--ink)",
                }}
              >
                {f.symbol}
              </span>

              {/* Label chip */}
              <span
                className="inline-block font-mono text-[0.52rem] uppercase tracking-[0.15em] px-2 py-0.5 mb-4"
                style={
                  f.featured
                    ? { background: "var(--accent)", color: "var(--paper)", borderRadius: "2px" }
                    : { border: "1px solid var(--grid-line)", color: "var(--ink-soft)" }
                }
              >
                {f.label}
              </span>

              <h3
                className="font-display font-bold mb-2 relative"
                style={{
                  fontSize: "clamp(1.05rem, 1.6vw, 1.2rem)",
                  letterSpacing: "-0.01em",
                  lineHeight: 1.15,
                  color: f.featured ? "var(--ink)" : "var(--ink)",
                }}
              >
                {f.title}
              </h3>
              <p className="font-body text-sm leading-relaxed relative" style={{ color: "var(--ink-soft)" }}>
                {f.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
