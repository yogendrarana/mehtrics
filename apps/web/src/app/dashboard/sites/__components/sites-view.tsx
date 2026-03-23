"use client";

import * as React from "react";
import Link from "next/link";
import {
  MoreHorizontal,
  ExternalLink,
  BarChart2,
  Settings,
  LayoutGrid,
  List,
  Copy,
  Check,
} from "lucide-react";
import { format } from "date-fns";
import type { SiteSelect } from "@mehtrics/db/schema";

import { Button } from "@mehtrics/ui/button";
import { Menu, MenuPopup, MenuItem, MenuTrigger } from "@mehtrics/ui/menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@mehtrics/ui/table";
import { cn } from "@mehtrics/utils/cn";
import { formatDate } from "@mehtrics/utils/date";
import { SectionHeader } from "@/components/section-header";
import { toastManager } from "@mehtrics/ui/toast";

type ViewMode = "list" | "grid";

export function SitesView({ data }: { data: SiteSelect[] }) {
  const [view, setView] = React.useState<ViewMode>("grid");

  return (
    <div className="flex flex-col min-h-full">
      <SectionHeader
        title="Sites"
        subtitle="Manage your analytics sites."
        className="sticky top-0 z-10"
      >
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5 bg-muted rounded-lg border border-border">
            <Button
              variant="ghost"
              onClick={() => setView("list")}
              className={cn(view === "list" && "bg-background shadow-xs")}
            >
              <List />
            </Button>
            <Button
              variant="ghost"
              onClick={() => setView("grid")}
              className={cn(view === "grid" && "bg-background shadow-xs")}
            >
              <LayoutGrid />
            </Button>
          </div>

          <Button render={<Link href="/dashboard/sites/new" />}>
            Add Site
          </Button>
        </div>
      </SectionHeader>

      <div className="p-4">
        {data.length === 0 ? (
          <div className="border border-dashed border-border rounded-sm py-20 text-center space-y-3 bg-card/50">
            <p className="text-muted-foreground">No sites found.</p>
          </div>
        ) : view === "list" ? (
          <SitesListView data={data} />
        ) : (
          <SitesGridView data={data} />
        )}
      </div>
    </div>
  );
}

// list view
function SitesListView({ data }: { data: SiteSelect[] }) {
  return (
    <div className="rounded-sm border bg-card overflow-hidden shadow-none">
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow className="hover:bg-transparent">
            <TableHead className="font-semibold text-foreground">
              Name
            </TableHead>
            <TableHead className="font-semibold text-foreground">
              Domain
            </TableHead>
            <TableHead className="font-semibold text-foreground">
              Created At
            </TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        
        <TableBody>
          {data.map((site) => (
            <TableRow key={site.id} className="group transition-colors">
              <TableCell>
                <Link
                  href={`/dashboard/sites/${site.id}`}
                  className="font-medium hover:text-primary transition-colors text-sm"
                >
                  {site.name}
                </Link>
              </TableCell>
              <TableCell className="text-sm font-mono text-muted-foreground/80">
                {site.domain}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                {formatDate(site.createdAt)}
              </TableCell>
              <TableCell>
                <SiteActionsMenu site={site} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// grid view
function SitesGridView({ data }: { data: SiteSelect[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.map((site) => (
        <div
          key={site.id}
          className="group relative bg-card border border-border rounded-sm"
        >
          <div className="p-3 flex items-start justify-between">
            <div className="min-w-0">
              <p className="block font-semibold text-foreground truncate hover:text-primary transition-colors mb-0.5">
                {site.name}
              </p>

              <Link
                href={`https://${site.domain}`}
                target="_blank"
                rel="noreferrer"
              >
                <p className="hover:underline text-xs text-muted-foreground font-mono truncate">
                  {site.domain}
                </p>
              </Link>
            </div>
            <SiteActionsMenu site={site} />
          </div>

          <div className="p-3 bg-muted/50 border-t flex items-center justify-between font-mono text-[10px]">
            <span className="text-muted-foreground/50">
              {format(new Date(site.createdAt), "MMM dd, yyyy")}
            </span>

            <Link href={`/dashboard/sites/${site.id}`}>
              <p className="group-hover:underline text-muted-foreground uppercase tracking-widest">
                View more
              </p>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

// site actions menu
function SiteActionsMenu({ site }: { site: SiteSelect }) {
  return (
    <Menu>
      <MenuTrigger
        render={
          <Button
            variant="ghost"
            className="h-8 w-8 p-0 opacity-50 hover:opacity-100 data-[state=open]:opacity-100 transition-opacity"
          >
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        }
      />

      <MenuPopup align="end" className="min-w-48 shadow-lg border-border/50">
        <MenuItem
          className="py-2.5"
          render={<Link href={`/dashboard/sites/${site.id}`} />}
        >
          <BarChart2 className="mr-2 h-4 w-4 text-primary" />
          <span>Analytics</span>
        </MenuItem>
        <MenuItem
          className="py-2.5"
          render={
            <Link
              href={`https://${site.domain}`}
              target="_blank"
              rel="noreferrer"
            />
          }
        >
          <ExternalLink className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>Visit Site</span>
        </MenuItem>
        <MenuItem
          className="py-2.5"
          render={<Link href={`/dashboard/sites/${site.id}/settings`} />}
        >
          <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>Settings</span>
        </MenuItem>
      </MenuPopup>
    </Menu>
  );
}
