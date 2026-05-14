import { NextResponse } from "next/server";
import { getFile, putFile } from "@/lib/github";
import type { Config } from "@/types";

export async function GET() {
  try {
    const { data, sha } = await getFile<Config>("config.json");
    return NextResponse.json({ data, sha });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { config, sha } = (await req.json()) as { config: Config; sha: string };
    const newSha = await putFile("config.json", config, sha, "update config via UI");
    return NextResponse.json({ sha: newSha });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
