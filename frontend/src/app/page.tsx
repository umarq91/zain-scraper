"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { DashboardData } from "@/types";

function cleanUrl(url: string): string {
  try {
    const u = new URL(url);
    u.search = "";
    return u.toString();
  } catch {
    return url;
  }
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [triggering, setTriggering] = useState(false);
  const [triggerMsg, setTriggerMsg] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error((await res.json()).error);
      setData(await res.json());
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 30_000);
    return () => clearInterval(id);
  }, [fetchData]);

  async function triggerCheck() {
    setTriggering(true);
    setTriggerMsg("");
    try {
      const res = await fetch("/api/trigger", { method: "POST" });
      setTriggerMsg(res.ok ? "Check triggered — results in ~30s." : "Failed to trigger.");
    } catch {
      setTriggerMsg("Failed to trigger.");
    } finally {
      setTriggering(false);
    }
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">Zaib Stock Watcher</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={triggerCheck}
            disabled={triggering}
            className="px-3 py-1.5 text-sm bg-gray-900 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            {triggering ? "Triggering…" : "Check Now"}
          </button>
          <Link
            href="/settings"
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700 transition-colors"
          >
            Settings
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {triggerMsg && (
          <div className="mb-5 px-4 py-2.5 bg-blue-50 text-blue-700 rounded-md text-sm">
            {triggerMsg}
          </div>
        )}

        {loading && (
          <p className="text-sm text-gray-400">Loading…</p>
        )}

        {!loading && error && (
          <div className="px-4 py-3 bg-red-50 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        {data && (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-500">
                Checks every {data.intervalMinutes} min via GitHub Actions
              </p>
              <button onClick={fetchData} className="text-sm text-blue-600 hover:underline">
                Refresh
              </button>
            </div>

            {data.products.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <p className="text-sm">No products configured.</p>
                <Link href="/settings" className="text-blue-600 hover:underline text-sm mt-1 inline-block">
                  Add products in Settings →
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {data.products.map((product) => {
                  const available = Object.values(product.sizes).filter(Boolean).length;
                  const total = Object.keys(product.sizes).length;
                  const hasAny = available > 0;

                  return (
                    <div
                      key={product.handle}
                      className={`bg-white rounded-xl border p-5 ${
                        hasAny ? "border-green-200" : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <h2 className="text-sm font-medium text-gray-900 leading-snug line-clamp-2">
                          {product.name}
                        </h2>
                        <a
                          href={cleanUrl(product.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 text-xs text-blue-600 hover:underline whitespace-nowrap"
                        >
                          View ↗
                        </a>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {data.watchSizes.map((size) => {
                          const avail = product.sizes[size];
                          return (
                            <span
                              key={size}
                              className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                                avail === null
                                  ? "bg-gray-100 text-gray-400"
                                  : avail
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-50 text-red-400"
                              }`}
                            >
                              {size}
                            </span>
                          );
                        })}
                      </div>

                      <p className="text-xs text-gray-400">
                        {available}/{total} sizes in stock
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
