import type { UserSettings } from "@/types";

export class SettingsModel {
  static async get(): Promise<UserSettings> {
    const res = await fetch("/api/settings");
    if (!res.ok) throw new Error("Failed to load settings");
    return res.json();
  }

  static async update(settings: UserSettings): Promise<void> {
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    if (!res.ok) throw new Error("Failed to save settings");
  }
}
