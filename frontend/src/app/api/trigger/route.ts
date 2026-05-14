import { NextResponse } from "next/server";
import { triggerWorkflow } from "@/lib/github";

export async function POST() {
  try {
    await triggerWorkflow("watch.yml");
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
