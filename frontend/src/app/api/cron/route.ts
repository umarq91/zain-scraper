import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";
import { buildRestockEmail, buildPriceDropEmail } from "@/lib/emailTemplate";

function jsEndpoint(productUrl: string) {
  const u = new URL(productUrl);
  u.search = "";
  u.pathname = u.pathname.replace(/\/+$/, "") + ".js";
  return u.toString();
}

async function checkProduct(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  transporter: nodemailer.Transporter,
  product: { id: string; url: string; handle: string; watch_sizes: string[]; notify_mode: "once" | "always"; is_paused: boolean; watch_price: boolean; last_known_price: number | null },
  emailTo: string | null
) {
  if (product.is_paused) return;

  const want = product.watch_sizes.map((s) => s.toUpperCase());
  if (!want.length) return;

  let data: any;
  try {
    const res = await fetch(jsEndpoint(product.url), { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    data = await res.json();
  } catch (err: any) {
    console.error(`[${product.handle}] Fetch failed: ${err.message}`);
    return;
  }

  const availBySize: Record<string, boolean> = {};
  for (const v of data.variants) {
    const tokens = [v.option1, v.option2, v.option3]
      .filter(Boolean).join(" ").toUpperCase()
      .split(/[^A-Z0-9]+/).filter(Boolean);
    for (const s of want) {
      if (tokens.includes(s)) availBySize[s] = (availBySize[s] || false) || v.available;
    }
  }

  // Track price — always update, only email if watch_price is on
  const currentPrice: number | null = typeof data.price === "number" ? data.price : null;
  const comparePrice: number | null = typeof data.compare_at_price === "number" && data.compare_at_price > 0 ? data.compare_at_price : null;

  const priceDropped =
    product.watch_price &&
    currentPrice !== null &&
    product.last_known_price !== null &&
    currentPrice < product.last_known_price;

  await (supabase.from("products") as any).update({
    last_known_price: currentPrice,
    last_known_compare_price: comparePrice,
  }).eq("id", product.id);

  if (priceDropped && emailTo) {
    const img: string | null = data.featured_image ?? data.images?.[0] ?? null;
    const imageUrl = img ? (img.startsWith("//") ? "https:" + img : img) : null;
    const { subject, html, text } = buildPriceDropEmail({
      productName: data.title,
      productUrl: product.url,
      imageUrl,
      oldPrice: product.last_known_price as number,
      newPrice: currentPrice,
    });
    await transporter.sendMail({
      from: `StockWatch <${process.env.GMAIL_USER}>`,
      to: emailTo,
      subject,
      html,
      text,
    });
  }

  // Read previous state before upserting so we can detect transitions
  const { data: prevRows } = await supabase
    .from("product_state")
    .select("size, available")
    .eq("product_id", product.id)
    .in("size", want);

  const prevAvail: Record<string, boolean> = {};
  for (const row of (prevRows ?? [])) {
    prevAvail[row.size] = row.available;
  }

  const nowAvailable = want.filter((s) => availBySize[s]);
  const stateRows = want.filter((s) => s in availBySize).map((s) => ({
    product_id: product.id, size: s, available: availBySize[s], last_checked: new Date().toISOString(),
  }));

  if (stateRows.length) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("product_state") as any).upsert(stateRows, { onConflict: "product_id,size" });
  }

  // "once": only notify on sizes that just flipped unavailable → available
  // "always": notify every check while available
  const sizesToNotify = product.notify_mode === "once"
    ? nowAvailable.filter((s) => !prevAvail[s])
    : nowAvailable;

  if (sizesToNotify.length && emailTo) {
    const img: string | null = data.featured_image ?? data.images?.[0] ?? null;
    const imageUrl = img ? (img.startsWith("//") ? "https:" + img : img) : null;

    const { subject, html, text } = buildRestockEmail({
      productName: data.title,
      availableSizes: sizesToNotify,
      productUrl: product.url,
      imageUrl,
    });

    await transporter.sendMail({
      from: `StockWatch <${process.env.GMAIL_USER}>`,
      to: emailTo,
      subject,
      html,
      text,
    });
  }
}

export async function GET(req: Request) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.GMAIL_USER!, pass: process.env.GMAIL_APP_PASSWORD!.replace(/\s+/g, "") },
  });

  const { data: allSettings } = await supabase.from("user_settings").select("user_id, email_to");
  const emailByUser = Object.fromEntries((allSettings ?? []).map((s: any) => [s.user_id, s.email_to]));

  const { data: products } = await supabase.from("products").select("id, url, handle, watch_sizes, user_id, notify_mode, is_paused, watch_price, last_known_price");
  if (!products?.length) return NextResponse.json({ ok: true, checked: 0 });

  for (const product of products) {
    await checkProduct(supabase, transporter, product, emailByUser[product.user_id] ?? null);
  }

  return NextResponse.json({ ok: true, checked: products.length });
}
