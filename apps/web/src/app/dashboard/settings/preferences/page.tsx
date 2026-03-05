"use client";

import { useState, useEffect } from "react";

import { authClient } from "@mehtrics/auth";

import { getUserSetting } from "./__lib/actions";
import { AppearanceSettings } from "./__components/appearance-settings";
import { NotificationSettings } from "./__components/notification-settings";
import { SettingHeader } from "@/app/dashboard/settings/__components/setting-header";
import { Separator } from "@mehtrics/ui";

export default function PreferencesPage() {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { isPending: sessionPending } = authClient.useSession();

  // When mounted on client, now we can show the UI
  useEffect(() => {
    setMounted(true);

    async function loadPreferences() {
      try {
        const response = await getUserSetting();
        if (response.success && response.data) {
          // If the DB has a theme, we can optionally sync it to next-themes here
        }
      } catch (error) {
        console.error("Failed to load preferences", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadPreferences();
  }, []);

  if (!mounted || isLoading || sessionPending) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <SettingHeader
        title="Preference Settings"
        subtitle="Manage your preference data"
        className="sticky top-0 z-10"
      />

      <div>
        <div className="p-4">
          <AppearanceSettings />
        </div>

        <Separator />

        <div className="p-4">
          <NotificationSettings />
        </div>
      </div>
    </div>
  );
}
