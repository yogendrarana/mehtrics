"use client";

import { useCallback, useState, useEffect } from "react";
import { Palette, Bell, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { authClient } from "@mehtrics/auth";
import { 
  Label, 
  Switch, 
  Button, 
  toastManager 
} from "@mehtrics/ui";
import { SettingCard } from "@/app/dashboard/settings/__components/setting-card";
import { SettingHeader } from "@/app/dashboard/settings/__components/setting-header";
import { getUserPreference, updateMode } from "./__lib/actions";

export default function PreferencesPage() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { data: sessionData, isPending: sessionPending } = authClient.useSession();
  const [isLoading, setIsLoading] = useState(true);

  // When mounted on client, now we can show the UI
  useEffect(() => {
    setMounted(true);
    
    async function loadPreferences() {
      try {
        const response = await getUserPreference();
        if (response.success && response.data) {
        }
      } catch (error) {
        console.error("Failed to load preferences", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadPreferences();
  }, []);

  const handleUpdateMode = useCallback(async (newTheme: "dark" | "light") => {
    setTheme(newTheme);

    if (!sessionData || sessionPending) return;

    try {
      const response = await updateMode({
        userId: sessionData.user.id,
        theme: newTheme,
      });

      if (response.success) {
        toastManager.add({
          title: "Success!",
          description: response.message,
          type: "success",
        });
      } else {
        toastManager.add({
          title: "Error!",
          description: response.message,
          type: "error",
        });
      }
    } catch (err: any) {
      toastManager.add({
        title: "Error!",
        description: err?.message || "Something went wrong",
        type: "error",
      });
    }
  }, [sessionData, sessionPending, setTheme]);

  if (!mounted || isLoading || sessionPending) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Use resolvedTheme to correctly identify dark/light even if 'system' is selected
  const activeTheme = theme === "system" ? resolvedTheme : theme;

  return (
    <div>
      <SettingHeader
        title="Preference Settings"
        subtitle="Manage your preference data"
        className="sticky top-0 z-10"
      />

      <div className="p-4 space-y-4">
        <SettingCard title="Appearance" subtitle="Customize how the app looks" Icon={Palette}>
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Mode</Label>
                <p className="text-sm text-muted-foreground">Choose your preferred theme</p>
              </div>

              <div className="flex rounded-md bg-muted p-1 relative">
                {/* Background slider */}
                <div
                  className={`absolute top-1 h-8 w-8 bg-background rounded-md shadow-sm transition-transform duration-200 ease-in-out ${
                    activeTheme === "dark" ? "translate-x-8" : "translate-x-0"
                  }`}
                />

                {/* Light mode button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleUpdateMode("light")}
                  className={`size-8 hover:bg-transparent relative z-10 rounded-md transition-colors duration-200 ${
                    activeTheme === "light"
                      ? "text-foreground hover:text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Sun className="h-4 w-4" />
                </Button>

                {/* Dark mode button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleUpdateMode("dark")}
                  className={`size-8 hover:bg-transparent relative z-10 rounded-md transition-colors duration-200 ${
                    activeTheme === "dark"
                      ? "text-foreground hover:text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Moon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </SettingCard>

        {/* Notifications */}
        <SettingCard
          title="Notifications"
          subtitle="Control how you receive notifications"
          Icon={Bell}
        >
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive notifications via email</p>
              </div>
              <Switch id="email-notifications" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="browser-notifications">Browser Notifications</Label>
                <p className="text-sm text-muted-foreground">Show notifications in your browser</p>
              </div>
              <Switch id="browser-notifications" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="share-notifications">Share Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  When someone shares a video with you
                </p>
              </div>
              <Switch id="share-notifications" defaultChecked />
            </div>
          </div>
        </SettingCard>
      </div>
    </div>
  );
}