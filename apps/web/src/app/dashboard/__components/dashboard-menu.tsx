"use client";

import Link from "next/link";
import {
  Home,
  Settings2,
  User,
  BarChart3,
  Share2,
  Clock,
  CreditCard,
  MousePointerClick,
  FileText,
} from "lucide-react";

const SIDEBAR_NAV_ITEMS = [
  {
    items: [
      {
        title: "Overview",
        url: "/dashboard",
        icon: BarChart3,
      },
      {
        title: "Realtime",
        url: "/dashboard/realtime",
        icon: Clock,
      },
      {
        title: "Referrers",
        url: "/dashboard/referrers",
        icon: Share2,
      },
      {
        title: "Events",
        url: "/dashboard/events",
        icon: MousePointerClick,
      },
      {
        title: "Pages",
        url: "/dashboard/pages",
        icon: FileText,
      },
    ],
  },
  {
    title: "Sites",
    items: [
      {
        title: "Sites",
        url: "/dashboard/sites",
        icon: Home,
      },
    ],
  },
  {
    title: "Billing",
    items: [
      {
        title: "Subscription",
        url: "/dashboard/billing",
        icon: CreditCard,
      },
      {
        title: "Usage",
        url: "/dashboard/billing/usage",
        icon: BarChart3,
      },
    ],
  },
  {
    title: "Settings",
    items: [
      {
        title: "Account",
        url: "/dashboard/settings/account",
        icon: User,
      },
      {
        title: "Preferences",
        url: "/dashboard/settings/preferences",
        icon: Settings2,
      },
    ],
  },
];

export function DashboardMenu() {
  return (
    <div>
      {SIDEBAR_NAV_ITEMS.map((item, index) => (
        <div key={index} className="p-4 space-y-4 border-b last:border-0">
          {item.title && (
            <div className="text-xs text-muted-foreground uppercase font-semibold">
              {item.title}
            </div>
          )}
          <div className="flex flex-col gap-4">
            {item.items.map((navItem) => (
              <Link
                key={navItem.title}
                href={navItem.url}
                className="w-full flex items-center space-x-3 text-sm"
              >
                <navItem.icon
                  size={18}
                  className="text-slate-500 group-hover:text-emerald-600 transition-colors duration-200"
                />
                <span>{navItem.title}</span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
