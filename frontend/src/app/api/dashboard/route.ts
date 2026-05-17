import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import type { DashboardData, ProductWithState } from "@/types";

function nameFromHandle(handle: string): string {
  return handle
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [
      { data: products, error: prodError },
      { data: userSettings },
    ] = await Promise.all([
      supabase
        .from("products")
        .select("id, url, handle, watch_sizes, image_url, is_paused, notify_mode, watch_price, last_known_price, last_known_compare_price")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true }),
      supabase
        .from("user_settings")
        .select("interval_minutes")
        .eq("user_id", user.id)
        .single(),
    ]);

    if (prodError) throw prodError;
    const interval_minutes: number = userSettings?.interval_minutes ?? 5;

    const productIds = (products ?? []).map((p) => p.id);
    let stateMap: Record<string, Record<string, boolean>> = {};
    let lastCheckedMap: Record<string, string> = {};

    if (productIds.length > 0) {
      const { data: states } = await supabase
        .from("product_state")
        .select("product_id, size, available, last_checked")
        .in("product_id", productIds);

      for (const s of states ?? []) {
        if (!stateMap[s.product_id]) stateMap[s.product_id] = {};
        stateMap[s.product_id][s.size] = s.available;

        if (s.last_checked) {
          const current = lastCheckedMap[s.product_id];
          if (!current || s.last_checked > current) {
            lastCheckedMap[s.product_id] = s.last_checked;
          }
        }
      }
    }

    const productsWithState: ProductWithState[] = (products ?? []).map((p) => {
      const state = stateMap[p.id] ?? {};
      const sizes: { [size: string]: boolean | null } = {};
      for (const s of p.watch_sizes) {
        sizes[s] = s in state ? state[s] : null;
      }
      return {
        id: p.id,
        url: p.url,
        handle: p.handle,
        name: nameFromHandle(p.handle),
        image_url: p.image_url ?? null,
        watch_sizes: p.watch_sizes,
        is_paused: p.is_paused ?? false,
        notify_mode: (p.notify_mode ?? "once") as "once" | "always",
        watch_price: p.watch_price ?? false,
        last_known_price: p.last_known_price ?? null,
        last_known_compare_price: p.last_known_compare_price ?? null,
        sizes,
        last_checked_at: lastCheckedMap[p.id] ?? null,
      };
    });

    const sorted = [...productsWithState].sort((a, b) => {
      // Paused → always last
      if (a.is_paused !== b.is_paused) return a.is_paused ? 1 : -1;

      const aAvail = Object.values(a.sizes).some(Boolean);
      const bAvail = Object.values(b.sizes).some(Boolean);
      const aUnknown = Object.values(a.sizes).every((v) => v === null);
      const bUnknown = Object.values(b.sizes).every((v) => v === null);

      // In-stock → first
      if (aAvail !== bAvail) return aAvail ? -1 : 1;
      // Not-yet-checked → before sold-out (shows "coming soon" above "sold out")
      if (aUnknown !== bUnknown) return aUnknown ? -1 : 1;

      return 0;
    });

    const data: DashboardData = {
      products: sorted,
      interval_minutes,
    };

    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
