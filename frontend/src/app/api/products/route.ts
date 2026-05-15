import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

function handleFromUrl(url: string): string {
  try {
    const u = new URL(url);
    const m = u.pathname.match(/\/products\/([^/]+)/);
    return m ? m[1] : u.pathname;
  } catch {
    return url;
  }
}

function cleanUrl(url: string): string {
  try {
    const u = new URL(url);
    u.search = "";
    return u.toString();
  } catch {
    return url;
  }
}

export async function GET() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("products")
    .select("id, url, handle, watch_sizes, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  if (!body.url) return NextResponse.json({ error: "url required" }, { status: 400 });

  const url = cleanUrl(body.url);
  const handle = handleFromUrl(url);

  const { data, error } = await supabase
    .from("products")
    .insert({
      user_id: user.id,
      url,
      handle,
      watch_sizes: body.watch_sizes ?? [],
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
