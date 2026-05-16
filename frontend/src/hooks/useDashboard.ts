"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { DashboardData } from "@/types";
import { ROUTES } from "@/constants/routes";

export function useDashboard() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [triggering, setTriggering] = useState(false);
  const [triggerMsg, setTriggerMsg] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (res.status === 401) { router.push(ROUTES.LOGIN); return; }
      if (!res.ok) throw new Error((await res.json()).error);
      setData(await res.json());
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData();
    const intervalMs = Math.max(30_000, (data?.interval_minutes ?? 5) * 60_000);
    const id = setInterval(fetchData, intervalMs);
    return () => clearInterval(id);
  }, [fetchData, data?.interval_minutes]);

  async function triggerCheck() {
    setTriggering(true);
    setTriggerMsg("");
    try {
      const res = await fetch("/api/trigger", { method: "POST" });
      setTriggerMsg(
        res.ok
          ? `Scan started — results in ~${data?.interval_minutes ?? 5} min.`
          : "Could not start scan."
      );
    } catch {
      setTriggerMsg("Could not start scan.");
    } finally {
      setTriggering(false);
    }
  }

  return { data, loading, error, triggering, triggerMsg, fetchData, triggerCheck };
}
