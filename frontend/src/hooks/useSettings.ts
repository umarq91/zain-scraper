"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { SettingsModel } from "@/models/SettingsModel";
import type { UserSettings } from "@/types";

type Msg = { type: "success" | "error"; text: string };

export function useSettings() {
  const supabase = createClient();
  const [settings, setSettings] = useState<UserSettings>({ email_to: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<Msg | null>(null);

  useEffect(() => {
    async function load() {
      const [data, { data: { user } }] = await Promise.all([
        SettingsModel.get().catch(() => null),
        supabase.auth.getUser(),
      ]);
      setSettings({
        email_to: data?.email_to || user?.email || "",
      });
      setLoading(false);
    }
    load();
  }, []);

  async function saveSettings() {
    setSaving(true);
    setMsg(null);
    try {
      await SettingsModel.update(settings);
      setMsg({ type: "success", text: "Saved successfully." });
      setTimeout(() => setMsg(null), 3000);
    } catch {
      setMsg({ type: "error", text: "Could not save. Try again." });
    } finally {
      setSaving(false);
    }
  }

  return { settings, setSettings, loading, saving, msg, saveSettings };
}
