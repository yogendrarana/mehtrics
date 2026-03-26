"use client";

import { User, Settings } from "lucide-react";
import { useState, useTransition } from "react";

import { authClient } from "@mehtrics/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@mehtrics/ui/avatar";
import { Input } from "@mehtrics/ui/input";
import { Label } from "@mehtrics/ui/label";
import { Button } from "@mehtrics/ui/button";
import { toastManager } from "@mehtrics/ui/toast";
import { SectionCard } from "@/components/dashboard/section-card";

interface ProfileSettingsProps {
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
}

export function ProfileSettings({ user }: ProfileSettingsProps) {
  const [isPending, startTransition] = useTransition();
  const [profileData, setProfileData] = useState({
    name: user.name || "",
    email: user.email || "",
  });

  const handleSave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    startTransition(async () => {
      if (!profileData.name || !profileData.email) {
        toastManager.add({
          title: "Error",
          description: "Name and email are required.",
          type: "error",
        });
        return;
      }

      const { error } = await authClient.updateUser(profileData);
      if (error) {
        toastManager.add({
          title: "Error",
          description: error.message,
          type: "error",
        });
        return;
      }

      toastManager.add({
        title: "Success",
        description: "Profile updated!",
        type: "success",
      });
    });
  };

  return (
    <SectionCard
      title="Profile Setting"
      subtitle="Change your profile data"
      Icon={User}
    >
      <div className="p-4 space-y-4">
        <div>
          <Avatar className="h-14 w-14">
            <AvatarImage src={user.image ?? undefined} />
            <AvatarFallback className="text-lg bg-muted text-foreground">
              {profileData.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Name Field */}
        <div className="grid grid-cols-1 md:grid-cols-2 items-end gap-4">
          <div>
            <Label htmlFor="name" className="text-sm font-medium">
              Name
            </Label>
            <p className="text-sm text-muted-foreground">
              Your full name, as visible to others.
            </p>
          </div>
          <Input
            id="name"
            value={profileData.name}
            onChange={(e) =>
              setProfileData({ ...profileData, name: e.target.value })
            }
            placeholder="Enter your full name"
          />
        </div>

        {/* Email Field */}
        <div className="grid grid-cols-1 md:grid-cols-2 items-end gap-4">
          <div>
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <p className="text-sm text-muted-foreground">
              Your email address associated with your account.
            </p>
          </div>
          <Input
            id="email"
            type="email"
            value={profileData.email}
            onChange={(e) =>
              setProfileData({ ...profileData, email: e.target.value })
            }
            placeholder="Enter your email address"
          />
        </div>
      </div>

      <div className="p-4 border-t bg-muted flex justify-end">
        <Button
          type="button"
          onClick={handleSave}
          disabled={
            isPending ||
            !profileData.name ||
            !profileData.email ||
            (profileData.name === user.name && profileData.email === user.email)
          }
        >
          {isPending ? (
            <>
              <Settings className="h-4 w-4 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </SectionCard>
  );
}
