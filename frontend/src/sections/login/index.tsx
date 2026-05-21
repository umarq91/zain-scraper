"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Bracket } from "@/components/shared/Bracket";
import { ROUTES } from "@/constants/routes";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");
    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else { router.push(ROUTES.HOME); router.refresh(); }
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else if (data.session) { router.push(ROUTES.HOME); router.refresh(); }
      else { setNotice("Check your email to confirm, then sign in."); setMode("signin"); }
    }
    setLoading(false);
  }

  return (
    <div className="bg-grid min-h-screen relative flex items-center justify-center px-6 py-16">
      <span className="absolute top-5 left-5"><Bracket pos="tl" size={28} /></span>
      <span className="absolute top-5 right-5"><Bracket pos="tr" size={28} /></span>
      <span className="absolute bottom-5 left-5"><Bracket pos="bl" size={28} /></span>
      <span className="absolute bottom-5 right-5"><Bracket pos="br" size={28} /></span>

      <svg aria-hidden="true" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.06]" style={{ width: "min(600px, 90vw)", aspectRatio: "1" }} viewBox="0 0 400 400">
        <circle cx="200" cy="200" r="190" fill="none" stroke="#0A0A0A" strokeWidth="1.5" strokeDasharray="4 4" />
      </svg>

      <div className="w-full max-w-[360px] relative z-10">
        <div className="text-center mb-10 select-none">
          <p className="font-display italic text-ink-soft mb-1" style={{ fontSize: "clamp(0.9rem, 2.5vw, 1.1rem)", fontWeight: 500 }}>never miss a</p>
          <h1 className="font-display leading-none" style={{ fontSize: "clamp(3rem, 9vw, 4.5rem)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 0.95 }}>
            STOCK{" "}
            <span className="font-display italic" style={{ background: "var(--accent)", color: "var(--paper)", padding: "0.02em 0.2em 0.06em", borderRadius: "2px", transform: "rotate(-0.5deg)", display: "inline-block", fontWeight: 700 }}>
              DROP
            </span>
          </h1>
          <p className="font-display italic text-ink-soft mt-2" style={{ fontSize: "clamp(0.9rem, 2.5vw, 1.1rem)", fontWeight: 500 }}>again.</p>
        </div>

        <div className="relative bg-paper-pure border border-ink p-7 shadow-hard-lg">
          <span className="absolute -top-0.5 -left-0.5"><Bracket pos="tl" size={28} /></span>
          <span className="absolute -top-0.5 -right-0.5"><Bracket pos="tr" size={28} /></span>
          <span className="absolute -bottom-0.5 -left-0.5"><Bracket pos="bl" size={28} /></span>
          <span className="absolute -bottom-0.5 -right-0.5"><Bracket pos="br" size={28} /></span>

          <div className="flex border border-ink mb-6">
            {(["signin", "signup"] as const).map((m, i) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setError(""); }}
                className={`flex-1 py-2 font-mono text-[0.65rem] tracking-[0.1em] uppercase transition-colors ${i > 0 ? "border-l border-ink" : ""} ${mode === m ? "bg-ink text-paper" : "text-ink hover:bg-grid-line"}`}
              >
                {m === "signin" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          {notice && <div className="mb-5 px-3 py-2.5 border border-ink text-sm font-body" style={{ background: "var(--accent-soft)" }}>{notice}</div>}
          {error && <div className="mb-5 px-3 py-2.5 border border-red-700 text-red-700 text-sm font-body bg-red-50">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-mono text-[0.6rem] tracking-[0.12em] uppercase text-ink-soft mb-1.5">Email Address</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full border border-ink bg-paper px-3 py-2.5 text-sm font-body focus-hard transition-shadow" />
            </div>
            <div>
              <label className="block font-mono text-[0.6rem] tracking-[0.12em] uppercase text-ink-soft mb-1.5">Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full border border-ink bg-paper px-3 py-2.5 text-sm font-body focus-hard transition-shadow" />
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 bg-accent text-paper font-mono text-[0.7rem] tracking-[0.1em] uppercase font-medium disabled:opacity-50 hover-lift shadow-hard-sm mt-2" style={{ transition: "box-shadow 0.1s ease, transform 0.1s ease" }}>
              {loading ? "…" : mode === "signin" ? "Sign In →" : "Create Account →"}
            </button>
          </form>
        </div>

        <p className="text-center mt-5 font-mono text-[0.6rem] tracking-widest uppercase text-ink-soft opacity-60">Your personal stock radar</p>
      </div>
    </div>
  );
}
