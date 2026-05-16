"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ROUTES } from "@/constants/routes";

const ease = [0.16, 1, 0.3, 1] as const;

const FAQS = [
  {
    q: "Which stores does it work with?",
    a: "Any store built on Shopify — that covers thousands of brands including Nike, Gymshark, Supreme, Palace, Allbirds, and many more. If the product URL follows the /products/ pattern, we can watch it.",
  },
  {
    q: "How fast will I get the alert?",
    a: "Depends on your check interval. Set it to 1 minute and you'll know within 60 seconds of a restock. The default is 5 minutes. For high-demand drops, we recommend 1–2 minutes.",
  },
  {
    q: "Is it free?",
    a: "Yes — free to start, no credit card required. Sign up, paste a product link, pick your sizes, and you're watching immediately.",
  },
  {
    q: "Do I need an account?",
    a: "Yes, a simple email and password. This lets us store your watched products and send alerts to your inbox.",
  },
  {
    q: "What if the size sells out before I can buy?",
    a: "Switch notify mode to Always — we'll alert you every check interval as long as the size stays in stock. Default is Once per restock to avoid inbox spam.",
  },
  {
    q: "Can I watch multiple products at once?",
    a: "As many as you want. Use the Bulk add feature to queue up an entire drop in one go — paste URLs, set sizes, submit.",
  },
] as const;

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="border-t border-grid-line bg-paper-pure py-24 px-6 overflow-hidden">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease }}
        >
          <div className="inline-flex items-center gap-2 border border-ink bg-paper shadow-hard-sm px-3 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
            <span className="font-mono text-[0.58rem] uppercase tracking-[0.15em] text-ink-soft">
              FAQ
            </span>
          </div>
          <h2
            className="font-display font-bold"
            style={{ fontSize: "clamp(2.2rem, 5vw, 3.8rem)", letterSpacing: "-0.025em", lineHeight: 0.9 }}
          >
            Questions,
            <br />
            <span className="italic font-medium text-ink-soft">answered.</span>
          </h2>
        </motion.div>

        {/* Accordion */}
        <motion.div
          className="border border-ink divide-y divide-grid-line bg-paper-pure shadow-hard"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
          }}
        >
          {FAQS.map((faq, i) => (
            <motion.div
              key={i}
              variants={{
                hidden: { opacity: 0, x: -16 },
                visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease } },
              }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left group hover:bg-paper transition-colors"
              >
                <span
                  className="font-display font-bold text-ink pr-6 leading-snug"
                  style={{ fontSize: "clamp(0.95rem, 1.5vw, 1.05rem)" }}
                >
                  {faq.q}
                </span>
                <motion.span
                  animate={{ rotate: open === i ? 45 : 0 }}
                  transition={{ duration: 0.2, ease }}
                  className="font-mono text-2xl leading-none flex-shrink-0 text-ink-soft group-hover:text-accent transition-colors"
                  style={{ lineHeight: 1 }}
                >
                  +
                </motion.span>
              </button>

              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    key="answer"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease }}
                    style={{ overflow: "hidden" }}
                  >
                    <div className="px-6 pb-6 pt-1 border-t border-grid-line">
                      <p className="font-body text-sm text-ink-soft leading-relaxed">
                        {faq.a}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 border border-grid-line bg-paper px-6 py-5"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease, delay: 0.2 }}
        >
          <div>
            <p className="font-display font-bold text-ink" style={{ fontSize: "1rem", letterSpacing: "-0.01em" }}>
              Still have questions?
            </p>
            <p className="font-body text-sm text-ink-soft mt-0.5">
              Just sign up and try it — free, no card needed.
            </p>
          </div>
          <Link
            href={ROUTES.LOGIN}
            className="flex-shrink-0 bg-accent text-paper font-mono text-[0.65rem] uppercase tracking-widest px-7 py-3 shadow-hard-sm hover-lift font-medium"
            style={{ transition: "box-shadow 0.1s ease, transform 0.1s ease" }}
          >
            Get Started Free →
          </Link>
        </motion.div>

      </div>
    </section>
  );
}
