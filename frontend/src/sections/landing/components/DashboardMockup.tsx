"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bracket } from "@/components/shared/Bracket";
import { SizePill } from "./SizePill";

const ease = [0.16, 1, 0.3, 1] as const;

export function DashboardMockup() {
  const [demoPhase, setDemoPhase] = useState<"available" | "sold-out">("available");
  const [notifVisible, setNotifVisible] = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    timers.push(setTimeout(() => setNotifVisible(true), 1200));

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
    <motion.div
      className="relative select-none"
      animate={{ y: [0, -9, 0] }}
      transition={{ delay: 1.4, duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
    >
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
                <p className="font-mono text-[0.58rem] uppercase tracking-widest text-accent font-bold leading-none mb-1">Back in stock</p>
                <p className="font-body text-xs text-ink leading-snug">Size <strong>M</strong> just restocked</p>
                <p className="font-mono text-[0.52rem] text-ink-soft mt-1 uppercase tracking-wide">just now</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-paper-pure border border-ink shadow-hard-lg relative">
        <span className="absolute -top-px -left-px"><Bracket pos="tl" /></span>
        <span className="absolute -top-px -right-px"><Bracket pos="tr" /></span>
        <span className="absolute -bottom-px -left-px"><Bracket pos="bl" /></span>
        <span className="absolute -bottom-px -right-px"><Bracket pos="br" /></span>

        <div className="border-b border-grid-line px-4 py-2.5 flex items-center justify-between">
          <span className="font-mono text-[0.58rem] uppercase tracking-widest text-ink font-bold">StockWatch</span>
          <span className="font-mono text-[0.52rem] uppercase tracking-widest text-ink-soft">3 watching</span>
        </div>

        <div className="p-4 space-y-3">
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
                      <motion.span key="in-stock" className="font-mono text-[0.5rem] uppercase tracking-widest px-1.5 py-0.5 flex-shrink-0" style={{ background: "var(--accent)", color: "var(--paper)" }} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }} transition={{ duration: 0.22 }}>IN STOCK</motion.span>
                    ) : (
                      <motion.span key="sold-out" className="font-mono text-[0.5rem] uppercase tracking-widest px-1.5 py-0.5 border border-ink text-ink-soft flex-shrink-0" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }} transition={{ duration: 0.22 }}>SOLD OUT</motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <div className="flex gap-1.5 flex-wrap items-center">
                  <SizePill label="S" state="sold-out" />
                  <AnimatePresence mode="wait">
                    {isAvailable ? (
                      <motion.span key="m-avail" className="font-mono text-[0.6rem] font-bold px-2.5 py-1.5 uppercase tracking-wider" style={{ background: "var(--accent)", color: "var(--paper)", borderRadius: "2px", display: "inline-block" }} initial={{ opacity: 0, scale: 0.65 }} animate={{ opacity: 1, scale: 1, rotate: -0.3 }} exit={{ opacity: 0, scale: 0.65 }} transition={{ type: "spring", stiffness: 380, damping: 22 }}>M</motion.span>
                    ) : (
                      <motion.span key="m-sold" className="font-mono text-[0.6rem] border border-ink px-2.5 py-1.5 uppercase tracking-wider text-ink-soft line-through" style={{ display: "inline-block" }} initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>M</motion.span>
                    )}
                  </AnimatePresence>
                  <SizePill label="L" state="sold-out" />
                  <SizePill label="XL" state="sold-out" />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div className="border border-grid-line bg-paper p-3" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, ease, delay: 0.65 }}>
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 border border-grid-line bg-grid flex-shrink-0 flex items-center justify-center">
                <span className="font-display font-bold italic text-2xl text-grid-line">B</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <p className="font-display font-bold text-sm leading-tight truncate text-ink-soft">Runner Pro</p>
                  <span className="font-mono text-[0.5rem] uppercase tracking-widest px-1.5 py-0.5 border border-ink text-ink-soft flex-shrink-0">SOLD OUT</span>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  <SizePill label="M" state="sold-out" />
                  <SizePill label="L" state="sold-out" />
                  <SizePill label="XL" state="sold-out" />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div className="border border-grid-line bg-paper p-3 opacity-60" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 0.6, x: 0 }} transition={{ duration: 0.4, ease, delay: 0.75 }}>
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
        <span className="font-mono text-[0.55rem] uppercase tracking-widest">checked 2 min ago</span>
      </motion.div>
    </motion.div>
  );
}
