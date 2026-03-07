"use client";

import { AlertTriangle, UserX, Trash2 } from "lucide-react";
import { SectionCard } from "@/components/section-card";
import { ConfirmDeactivateAccount } from "@/app/dashboard/settings/account/__components/confirm-deactivate-account";
import { ConfirmDeleteAccount } from "@/app/dashboard/settings/account/__components/confirm-delete-account";

export function AccountManagement() {
  return (
    <SectionCard
      Icon={AlertTriangle}
      title="Account Management"
      subtitle="Manage your account status and data"
    >
      <div>
        {/* Deactivate Account */}
        <div className="border-b p-4 bg-card">
          <div className="grid md:grid-cols-2 gap-4 items-center">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <UserX className="w-4 h-4 text-orange-500" />
                <h3 className="font-medium text-gray-900">
                  Deactivate Account
                </h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Temporarily disable your account. You can reactivate it anytime
                by logging back in. Your data will be preserved but your account
                will be hidden from other users.
              </p>
            </div>

            <div className="flex items-center justify-end">
              <ConfirmDeactivateAccount />
            </div>
          </div>
        </div>

        {/* Delete Account */}
        <div className="p-4 bg-card">
          <div className="grid md:grid-cols-2 gap-4 items-center">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-red-500" />
                <h3 className="font-medium text-gray-900">Delete Account</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data. This
                action cannot be undone. All your files, settings, and account
                information will be permanently removed.
              </p>
            </div>

            <div className="flex items-center justify-end">
              <ConfirmDeleteAccount />
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
