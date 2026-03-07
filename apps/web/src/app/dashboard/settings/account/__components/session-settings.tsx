"use client";

import { useState, useTransition } from "react";
import { Globe, Settings, Clock } from "lucide-react";
import { authClient } from "@mehtrics/auth";
import { Button } from "@mehtrics/ui/button";
import { Badge } from "@mehtrics/ui/badge";
import { toastManager } from "@mehtrics/ui/toast";
import {
  cn,
  formatDate,
  formatExpiryDate,
  getBrowserName,
  getDeviceName,
} from "@mehtrics/utils";
import { SettingCard } from "../../__components/setting-card";

interface SessionSettingsProps {
  initialSessions: any[];
  currentSessionToken?: string;
}

export function SessionSettings({
  initialSessions,
  currentSessionToken,
}: SessionSettingsProps) {
  const [isPending, startTransition] = useTransition();
  const [sessions, setSessions] = useState(initialSessions);

  const handleRevokeSession = async (sessionToken: string) => {
    startTransition(async () => {
      try {
        const res = await authClient.revokeSession({
          token: sessionToken,
        });

        if (res.error) {
          throw new Error(res.error.message);
        }

        setSessions((prev) => prev.filter((s) => s.token !== sessionToken));
        toastManager.add({
          title: "Success",
          description: "Revoked the session successfully",
          type: "success",
        });
      } catch (err: any) {
        toastManager.add({
          title: "Error",
          description: err?.message || "Error while revoking the token",
          type: "error",
        });
      }
    });
  };

  return (
    <SettingCard
      Icon={Globe}
      title="Session Settings"
      subtitle={`Manage your active login sessions across all devices (${sessions.length} active)`}
    >
      <div className="">
        {sessions.map((session, idx) => (
          <div
            key={session.id}
            className={cn("flex flex-col gap-2 p-4", {
              "border-b": idx !== sessions.length - 1,
            })}
          >
            {/* Row 1: Device info and Revoke button */}
            <div className="flex items-center gap-3">
              <span className="truncate flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                {session.userAgent
                  ? getDeviceName(session.userAgent)
                  : "Unknown Device"}
              </span>

              <Badge
                variant="secondary"
                className="text-xs px-2 py-0.5 rounded-full"
              >
                {session.userAgent
                  ? getBrowserName(session.userAgent)
                  : "Unknown Browser"}
              </Badge>

              {currentSessionToken === session.token && (
                <Badge className="ml-2 text-xs px-2 py-0.5 rounded-full border bg-green-100 text-green-700 border-green-200">
                  Current Session
                </Badge>
              )}

              <div className="flex-1" />

              {currentSessionToken !== session.token && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRevokeSession(session.token)}
                  className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Settings className="h-4 w-4 animate-spin mr-2" />
                      Revoking...
                    </>
                  ) : (
                    <>Revoke</>
                  )}
                </Button>
              )}
            </div>

            {/* Row 2: IP, Created, Expires */}
            <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4" />
                <span>Created {formatDate(session.createdAt)}</span>
              </div>

              <div className="flex items-center gap-1">
                <span className="h-4 w-4 inline-block">
                  <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                    <rect
                      width="16"
                      height="16"
                      rx="2"
                      fill="hsl(var(--muted))"
                    />
                    <path
                      d="M8 4v4l3 1"
                      stroke="hsl(var(--muted-foreground))"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>

                <span>{formatExpiryDate(session.expiresAt)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SettingCard>
  );
}
