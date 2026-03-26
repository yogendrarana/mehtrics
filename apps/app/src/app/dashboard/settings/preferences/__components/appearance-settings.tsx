"use client";

import { useTheme } from "next-themes";
import { Palette, Moon, Sun } from "lucide-react";
import { useCallback } from "react";

import { authClient } from "@mehtrics/auth";
import { Label } from "@mehtrics/ui/label";
import { Button } from "@mehtrics/ui/button";
import { toastManager } from "@mehtrics/ui/toast";

import { updateMode } from "../__lib/actions";
import { SectionCard } from "@/components/dashboard/section-card";

export function AppearanceSettings() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const { data: sessionData, isPending: sessionPending } =
    authClient.useSession();

  const handleUpdateMode = useCallback(
    async (newTheme: "dark" | "light") => {
      if (theme === newTheme) return;

      setTheme(newTheme);

      if (!sessionData || sessionPending) return;

      await toastManager.promise(
        updateMode({
          userId: sessionData.user.id,
          theme: newTheme,
        }),
        {
          loading: {
            title: "Updating...",
            description: "Please wait...",
          },
          success: (response) => ({
            title: "Success!",
            description: response.message,
          }),
          error: (err) => ({
            title: "Error!",
            description: err?.message || "Something went wrong",
          }),
        },
      );
    },
    [sessionData, sessionPending, setTheme],
  );

  const activeTheme = theme === "system" ? resolvedTheme : theme;

  return (
    <SectionCard
      title="Appearance"
      subtitle="Customize how the app looks"
      Icon={Palette}
    >
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Mode</Label>
            <p className="text-sm text-muted-foreground">
              Choose your preferred theme
            </p>
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
    </SectionCard>
  );
}
