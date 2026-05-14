import { NextResponse } from "next/server";
import { getFile } from "@/lib/github";
import type { Config, StockState, DashboardData, ProductStock } from "@/types";

function handleFromUrl(url: string): string {
  try {
    const u = new URL(url);
    const m = u.pathname.match(/\/products\/([^/]+)/);
    return m ? m[1] : u.pathname;
  } catch {
    return url;
  }
}

function nameFromHandle(handle: string): string {
  return handle
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export async function GET() {
  try {
    const { data: config } = await getFile<Config>("config.json");

    let state: StockState = {};
    try {
      const result = await getFile<StockState>("state.json");
      state = result.data;
    } catch {
      // state.json not yet created — first run hasn't happened
    }

    const watchSizes = (config.watchSizes ?? []).map((s: string) => s.toUpperCase());

    const products: ProductStock[] = (config.products ?? []).map((url: string) => {
      const handle = handleFromUrl(url);
      const productState = state[handle] ?? {};
      const sizes: { [size: string]: boolean | null } = {};
      for (const s of watchSizes) {
        sizes[s] = s in productState ? productState[s] : null;
      }
      return { url, handle, name: nameFromHandle(handle), sizes };
    });

    const data: DashboardData = {
      products,
      watchSizes,
      intervalMinutes: config.intervalMinutes ?? 5,
    };

    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
