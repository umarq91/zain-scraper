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
    .select("id, url, handle, watch_sizes, is_paused, notify_mode, image_url, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

async function fetchProductImage(productUrl: string): Promise<string | null> {
  try {
    const u = new URL(productUrl);
    u.search = "";
    u.pathname = u.pathname.replace(/\/+$/, "") + ".js";
    const res = await fetch(u.toString(), { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) return null;
    const json = await res.json();
    const img: string | null = json.featured_image ?? json.images?.[0] ?? null;
    if (!img) return null;
    return img.startsWith("//") ? "https:" + img : img;
  } catch {
    return null;
  }
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
  const image_url = await fetchProductImage(url);

  const { data, error } = await supabase
    .from("products")
    .insert({
      user_id: user.id,
      url,
      handle,
      watch_sizes: body.watch_sizes ?? [],
      notify_mode: body.notify_mode === "always" ? "always" : "once",
      image_url,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
