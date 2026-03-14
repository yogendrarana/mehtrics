"use client";

import Link from "next/link";
import {
  LogOut,
  Settings,
  LayoutDashboard,
  Home,
  Globe,
  CreditCard,
  Activity,
  FileText,
  User,
  Settings2,
} from "lucide-react";

import { authClient } from "@mehtrics/auth";
import {
  Menu,
  MenuTrigger,
  MenuPopup,
  MenuItem,
  MenuSeparator,
  MenuGroupLabel,
  MenuGroup,
} from "@mehtrics/ui/menu";
import { Avatar, AvatarImage, AvatarFallback } from "@mehtrics/ui/avatar";
import { Button } from "@mehtrics/ui/button";

export function UserButton() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <div className="size-8 rounded-full bg-muted animate-pulse" />;
  }

  const user = session?.user;

  if (!user) {
    return (
      <Button render={<Link href="/signup" />} size="sm">
        Get Started
      </Button>
    );
  }

  return (
    <Menu>
      <MenuTrigger className="rounded-full cursor-pointer">
        <Avatar className="size-8">
          <AvatarImage src={user.image || undefined} alt={user.name} />
          <AvatarFallback>
            {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>
      </MenuTrigger>

      <MenuPopup align="end" className="min-w-56" sideOffset={8}>
        <MenuGroup>
          <MenuGroupLabel className="flex flex-col gap-1 px-2 py-1.5 font-normal text-start">
            <p className="text-sm font-medium leading-none text-foreground">
              {user.name}
            </p>
            <p className="text-xs leading-none text-muted-foreground truncate">
              {user.email}
            </p>
          </MenuGroupLabel>
        </MenuGroup>

        <MenuSeparator />

        <MenuGroup>
          <MenuItem
            render={<Link href="/dashboard" />}
            className="cursor-pointer"
          >
            <Home className="size-4" />
            <span>Overview</span>
          </MenuItem>
          <MenuItem
            render={<Link href="/dashboard/sites" />}
            className="cursor-pointer"
          >
            <Globe className="size-4" />
            <span>Sites</span>
          </MenuItem>
        </MenuGroup>

        <MenuSeparator />

        <MenuGroup>
          <MenuGroupLabel>Billing</MenuGroupLabel>
          <MenuItem
            render={<Link href="/dashboard/billing" />}
            className="cursor-pointer"
          >
            <CreditCard className="size-4" />
            <span>Subscription</span>
          </MenuItem>
          <MenuItem
            render={<Link href="/dashboard/billing/usage" />}
            className="cursor-pointer"
          >
            <Activity className="size-4" />
            <span>Usage</span>
          </MenuItem>
          <MenuItem
            render={<Link href="/dashboard/billing/invoices" />}
            className="cursor-pointer"
          >
            <FileText className="size-4" />
            <span>Invoices</span>
          </MenuItem>
        </MenuGroup>

        <MenuSeparator />

        <MenuGroup>
          <MenuGroupLabel>Settings</MenuGroupLabel>
          <MenuItem
            render={<Link href="/dashboard/settings/account" />}
            className="cursor-pointer"
          >
            <User className="size-4" />
            <span>Account</span>
          </MenuItem>
          <MenuItem
            render={<Link href="/dashboard/settings/preferences" />}
            className="cursor-pointer"
          >
            <Settings2 className="size-4" />
            <span>Preferences</span>
          </MenuItem>
        </MenuGroup>

        <MenuSeparator />

        <MenuGroup>
          <MenuItem
            variant="destructive"
            onClick={() =>
              authClient.signOut({
                fetchOptions: {
                  onSuccess: () => {
                    window.location.href = "/";
                  },
                },
              })
            }
            className="cursor-pointer"
          >
            <LogOut className="size-4" />
            <span>Log out</span>
          </MenuItem>
        </MenuGroup>
      </MenuPopup>
    </Menu>
  );
}
