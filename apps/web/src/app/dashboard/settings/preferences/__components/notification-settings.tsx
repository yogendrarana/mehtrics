"use client";

import { Bell } from "lucide-react";
import { Label, Switch } from "@mehtrics/ui";
import { SettingCard } from "@/app/dashboard/settings/__components/setting-card";

export function NotificationSettings() {
  return (
    <SettingCard
      title="Notifications"
      subtitle="Control how you receive notifications"
      Icon={Bell}
    >
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="email-notifications">Email Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive notifications via email
            </p>
          </div>
          <Switch id="email-notifications" defaultChecked />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="browser-notifications">Browser Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Show notifications in your browser
            </p>
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
  );
}
