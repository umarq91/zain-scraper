import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

const CHECKER_URL = process.env.CHECKER_URL; // e.g. http://localhost:3001 or https://your-server.railway.app
const TRIGGER_SECRET = process.env.TRIGGER_SECRET;

export async function POST() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!CHECKER_URL) {
      return NextResponse.json({ error: "CHECKER_URL not configured" }, { status: 503 });
    }

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (TRIGGER_SECRET) headers["x-trigger-secret"] = TRIGGER_SECRET;

    const res = await fetch(`${CHECKER_URL}/trigger`, { method: "POST", headers });
    if (!res.ok) throw new Error(`Checker returned ${res.status}`);

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
