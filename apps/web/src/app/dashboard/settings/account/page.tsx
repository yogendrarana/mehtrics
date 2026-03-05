"use client";

import { useEffect, useState } from "react";
import { authClient } from "@mehtrics/auth";

import { SettingHeader } from "@/app/dashboard/settings/__components/setting-header";
import { ProfileSettings } from "./__components/profile-settings";
import { PasswordSettings } from "./__components/password-settings";
import { SessionSettings } from "./__components/session-settings";
import { AccountManagement } from "./__components/account-management";

export default function AccountSettingsPage() {
  const { data: session } = authClient.useSession();
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSessions() {
      try {
        const { data, error } = await authClient.listSessions();
        if (data && !error) {
          const activeSessions = data
            .filter((s) => new Date(s.expiresAt) > new Date())
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setSessions(activeSessions);
        }
      } catch (err) {
        console.error("Failed to load sessions", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSessions();
  }, []);

  if (isLoading || !session?.user) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <SettingHeader
        title="Profile Settings"
        subtitle="Manage your profile data"
        className="sticky top-0 z-10"
      />

      <div className="p-4 space-y-4">
        {/* Profile Settings Section */}
        <ProfileSettings user={session.user} />

        {/* Security / Password Settings Section */}
        <PasswordSettings />

        {/* Sessions Section */}
        <SessionSettings 
          initialSessions={sessions} 
          currentSessionToken={session.session.token} 
        />

        {/* Account Management Section */}
        <AccountManagement />
      </div>
    </div>
  );
}