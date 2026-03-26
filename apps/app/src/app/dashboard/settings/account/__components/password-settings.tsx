"use client";

import { useState, useTransition } from "react";
import { Shield, Settings } from "lucide-react";

import { Input } from "@mehtrics/ui/input";
import { Label } from "@mehtrics/ui/label";
import { authClient } from "@mehtrics/auth";
import { Button } from "@mehtrics/ui/button";
import { toastManager } from "@mehtrics/ui/toast";
import { SectionCard } from "@/components/dashboard/section-card";

export function PasswordSettings() {
  const [isPending, startTransition] = useTransition();
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  function handlePasswordChange() {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toastManager.add({
        title: "Error",
        description: "New password and confirmation do not match.",
        type: "error",
      });
      return;
    }

    startTransition(async () => {
      try {
        const res = await authClient.changePassword({
          newPassword: passwordData.newPassword,
          currentPassword: passwordData.currentPassword,
          revokeOtherSessions: true,
        });

        if (res?.error?.code === "INVALID_PASSWORD") {
          toastManager.add({
            title: "Error",
            description: "Current password is incorrect. Please try again.",
            type: "error",
          });
          return;
        }

        if (!res.error) {
          toastManager.add({
            title: "Success",
            description: "Password has been changed successfully.",
            type: "success",
          });
          setPasswordData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
        }
      } catch (err: any) {
        toastManager.add({
          title: "Error",
          description:
            err?.message || "Something went wrong. Please try again.",
          type: "error",
        });
      }
    });
  }

  return (
    <SectionCard
      title="Password"
      subtitle="Manage your account password"
      Icon={Shield}
    >
      <div className="p-4 space-y-4">
        {/* Row: Current Password */}
        <div className="grid grid-cols-1 md:grid-cols-2 items-end gap-4">
          <div>
            <Label htmlFor="currentPassword" className="text-sm font-medium">
              Current Password
            </Label>
            <p className="text-sm text-muted-foreground">
              Enter your existing password
            </p>
          </div>
          <Input
            id="currentPassword"
            type="password"
            value={passwordData.currentPassword}
            onChange={(e) =>
              setPasswordData((prev) => ({
                ...prev,
                currentPassword: e.target.value,
              }))
            }
            placeholder="Current password"
          />
        </div>

        {/* Row: New Password */}
        <div className="grid grid-cols-1 md:grid-cols-2 items-end gap-4">
          <div>
            <Label htmlFor="newPassword" className="text-sm font-medium">
              New Password
            </Label>
            <p className="text-sm text-muted-foreground">
              Choose a strong new password
            </p>
          </div>
          <Input
            id="newPassword"
            type="password"
            value={passwordData.newPassword}
            onChange={(e) =>
              setPasswordData((prev) => ({
                ...prev,
                newPassword: e.target.value,
              }))
            }
            placeholder="New password"
          />
        </div>

        {/* Row: Confirm New Password */}
        <div className="grid grid-cols-1 md:grid-cols-2 items-end gap-4">
          <div>
            <Label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm New Password
            </Label>
            <p className="text-sm text-muted-foreground">
              Re-enter new password
            </p>
          </div>
          <Input
            id="confirmPassword"
            type="password"
            value={passwordData.confirmPassword}
            onChange={(e) =>
              setPasswordData((prev) => ({
                ...prev,
                confirmPassword: e.target.value,
              }))
            }
            placeholder="New password"
          />
        </div>
      </div>

      {/* Action buttons */}
      <div className="p-4 border-t flex gap-2 justify-end bg-muted">
        <Button
          onClick={handlePasswordChange}
          disabled={
            isPending ||
            !passwordData.currentPassword ||
            !passwordData.newPassword ||
            !passwordData.confirmPassword
          }
        >
          {isPending ? (
            <>
              <Settings className="h-4 w-4 animate-spin mr-2" />
              Updating...
            </>
          ) : (
            <>Save Changes</>
          )}
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            setPasswordData({
              currentPassword: "",
              newPassword: "",
              confirmPassword: "",
            })
          }
        >
          Reset
        </Button>
      </div>
    </SectionCard>
  );
}
