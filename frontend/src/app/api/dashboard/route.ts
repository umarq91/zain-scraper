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

    const { data: products, error: prodError } = await supabase
      .from("products")
      .select("id, url, handle, watch_sizes, image_url, is_paused")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (prodError) throw prodError;

    const productIds = (products ?? []).map((p) => p.id);
    let stateMap: Record<string, Record<string, boolean>> = {};

    if (productIds.length > 0) {
      const { data: states } = await supabase
        .from("product_state")
        .select("product_id, size, available")
        .in("product_id", productIds);

      for (const s of states ?? []) {
        if (!stateMap[s.product_id]) stateMap[s.product_id] = {};
        stateMap[s.product_id][s.size] = s.available;
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
        sizes,
      };
    });

    const data: DashboardData = {
      products: productsWithState,
    };

    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
