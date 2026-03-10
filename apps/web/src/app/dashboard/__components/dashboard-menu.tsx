"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useParams } from "next/navigation";
import {
  LayoutDashboard,
  Globe,
  CreditCard,
  Activity,
  Settings,
  BarChart3,
  Clock,
  Share2,
  MousePointerClick,
  FileText,
  Monitor,
  MapPin,
  ChevronLeft,
  Copy,
  Check,
  User,
  Settings2,
  Terminal,
} from "lucide-react";
import { cn } from "@mehtrics/utils/cn";
import { Card, CardContent } from "@mehtrics/ui/card";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@mehtrics/ui/button";

const ACCOUNT_NAV_GROUPS = [
  {
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "Sites", url: "/dashboard/sites", icon: Globe },
    ],
  },
  {
    title: "BILLING",
    items: [
      { title: "Subscription", url: "/dashboard/billing", icon: CreditCard },
      { title: "Usage", url: "/dashboard/billing/usage", icon: Activity },
      { title: "Invoices", url: "/dashboard/billing/invoices", icon: FileText },
    ],
  },
  {
    title: "SETTINGS",
    items: [
      { title: "Account", url: "/dashboard/settings/account", icon: User },
      {
        title: "Preferences",
        url: "/dashboard/settings/preferences",
        icon: Settings2,
      },
    ],
  },
];

const getSiteNavGroups = (siteId: string) => [
  {
    title: "ANALYTICS",
    items: [
      { title: "Overview", url: `/dashboard/sites/${siteId}`, icon: BarChart3 },
      {
        title: "Realtime",
        url: `/dashboard/sites/${siteId}/realtime`,
        icon: Clock,
      },
      {
        title: "Pages",
        url: `/dashboard/sites/${siteId}/pages`,
        icon: FileText,
      },
      {
        title: "Referrers",
        url: `/dashboard/sites/${siteId}/referrers`,
        icon: Share2,
      },
      {
        title: "Events",
        url: `/dashboard/sites/${siteId}/events`,
        icon: MousePointerClick,
      },
    ],
  },
  {
    title: "AUDIENCE",
    items: [
      {
        title: "Devices",
        url: `/dashboard/sites/${siteId}/devices`,
        icon: Monitor,
      },
      {
        title: "Locations",
        url: `/dashboard/sites/${siteId}/locations`,
        icon: MapPin,
      },
    ],
  },
  {
    title: "CONFIGURATION",
    items: [
      {
        title: "Settings",
        url: `/dashboard/sites/${siteId}/settings`,
        icon: Settings,
      },
      {
        title: "Tracking Script",
        url: `/dashboard/sites/${siteId}/tracking`,
        icon: Terminal,
      },
    ],
  },
];

export function DashboardMenu() {
  const pathname = usePathname();
  const params = useParams();
  const siteId = params?.id as string;

  const [siteData, setSiteData] = useState<{
    name: string;
    domain: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (siteId && siteId !== "new") {
      fetch(`/api/site/${siteId}`)
        .then((res) => res.json())
        .then((data) => setSiteData(data.site))
        .catch(() => setSiteData(null));
    }
  }, [siteId]);

  const copyId = () => {
    if (!siteId) return;
    navigator.clipboard.writeText(siteId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isSiteRoute =
    siteId &&
    siteId !== "new" &&
    pathname.includes(`/dashboard/sites/${siteId}`);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={isSiteRoute ? "site-view" : "account-view"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1, ease: "easeInOut" }}
          className="flex flex-col flex-1"
        >
          {/* site route */}
          {isSiteRoute && (
            <div className="">
              <Link
                href="/dashboard/sites"
                className="p-4 flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground no-underline group"
              >
                <ChevronLeft
                  size={14}
                  className="group-hover:-translate-x-0.5 transition-transform"
                />
                <span>Back to Sites</span>
              </Link>

              <div className="px-4 py-3 flex items-center justify-between gap-3 bg-muted/30 border-y border-border">
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold truncate text-foreground leading-tight">
                    {siteData?.name || "Loading..."}
                  </span>
                  <span className="text-[10px] font-medium text-muted-foreground truncate leading-none mt-0.5">
                    {siteData?.domain || "..."}
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="icon-xs"
                  onClick={copyId}
                  title="Copy Site ID"
                >
                  {copied ? (
                    <Check size={10} className="text-emerald-500" />
                  ) : (
                    <Copy size={10} />
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* navigation groups */}
          <div className="flex-1 flex flex-col min-h-0">
            {(isSiteRoute ? getSiteNavGroups(siteId) : ACCOUNT_NAV_GROUPS).map(
              (group, groupIdx, groups) => (
                <div
                  key={group.title || groupIdx}
                  className={cn(
                    "p-4 flex flex-col space-y-1",
                    groupIdx !== groups.length - 1 && "border-b border-border",
                  )}
                >
                  {group.title && (
                    <h3 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">
                      {group.title}
                    </h3>
                  )}
                  {group.items.map((item) => {
                    const isActive = pathname === item.url;

                    return (
                      <Link
                        key={item.title}
                        href={item.url}
                        className={cn(
                          "group py-1.5 flex items-center gap-3 text-sm font-medium transition-colors no-underline",
                          isActive
                            ? "text-foreground font-bold"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        <item.icon
                          size={16}
                          className={cn(
                            "transition-colors group-hover:text-foreground",
                            isActive
                              ? "text-foreground"
                              : "text-muted-foreground/60",
                          )}
                        />
                        <span className="group-hover:text-foreground truncate">
                          {item.title}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              ),
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {!isSiteRoute && (
        <div className="px-4 pb-4 mt-auto">
          <Card className="border rounded-sm shadow-sm bg-muted/30">
            <CardContent className="p-3">
              <p className="text-[10px] font-bold text-muted-foreground/60 uppercase mb-1">
                PRO FEATURES
              </p>
              <p className="text-[11px] text-muted-foreground/80 mb-2 leading-tight">
                Unlock advanced reporting and custom alerts.
              </p>
              <Link
                href="/pricing"
                className="text-xs font-bold text-foreground hover:opacity-80 decoration-foreground/30"
              >
                Upgrade Account &rarr;
              </Link>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
