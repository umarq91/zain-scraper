import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

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
  product: { id: string; url: string; handle: string; watch_sizes: string[] },
  emailTo: string | null
) {
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

  const nowAvailable = want.filter((s) => availBySize[s]);
  const stateRows = want.filter((s) => s in availBySize).map((s) => ({
    product_id: product.id, size: s, available: availBySize[s], last_checked: new Date().toISOString(),
  }));

  if (stateRows.length) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from("product_state") as any).upsert(stateRows, { onConflict: "product_id,size" });
  }

  if (nowAvailable.length && emailTo) {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: emailTo,
      subject: `IN STOCK: size ${nowAvailable.join(", ")} — ${data.title}`,
      text: `Size ${nowAvailable.join(", ")} now available.\n\n${data.title}\n${product.url}\n\nBuy fast!`,
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

  const { data: products } = await supabase.from("products").select("id, url, handle, watch_sizes, user_id");
  if (!products?.length) return NextResponse.json({ ok: true, checked: 0 });

  for (const product of products) {
    await checkProduct(supabase, transporter, product, emailByUser[product.user_id] ?? null);
  }

  return NextResponse.json({ ok: true, checked: products.length });
}
