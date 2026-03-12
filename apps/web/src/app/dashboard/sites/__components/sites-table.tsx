"use client";

import * as React from "react";
import Link from "next/link";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  MoreHorizontal,
  ExternalLink,
  BarChart2,
  Settings,
} from "lucide-react";

import { Button } from "@mehtrics/ui/button";
import { DataTable } from "@mehtrics/ui/data-table";
import { Badge } from "@mehtrics/ui/badge";
import { formatDate } from "@mehtrics/utils/date";

import { Menu, MenuPopup, MenuItem, MenuTrigger } from "@mehtrics/ui/menu";

// Define it here or import from db types
type Site = {
  id: string;
  name: string;
  domain: string;
  createdAt: string | Date;
};

const columns: ColumnDef<Site>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const site = row.original;
      return (
        <div className="flex flex-col">
          <Link
            href={`/dashboard/sites/${site.id}`}
            className="font-medium hover:underline"
          >
            {site.name}
          </Link>
        </div>
      );
    },
  },
  {
    accessorKey: "domain",
    header: "Domain",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as string | Date;
      return <span className="text-sm">{formatDate(date)}</span>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: () => <Badge variant="secondary">Active</Badge>,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const site = row.original;

      return (
        <Menu>
          <MenuTrigger
            render={
              <Button
                variant="ghost"
                className="h-8 w-8 p-0 border-(--theme(--color-border))"
              >
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            }
          />

          <MenuPopup align="end">
            <MenuItem className="hover:bg-accent/10 focus:bg-accent/10">
              <Link
                href={`/dashboard/sites/${site.id}`}
                className="flex w-full items-center"
              >
                <BarChart2 className="mr-2 h-4 w-4" />
                <span>Analytics</span>
              </Link>
            </MenuItem>
            <MenuItem className="hover:bg-accent/10 focus:bg-accent/10">
              <Link
                href={`https://${site.domain}`}
                target="_blank"
                rel="noreferrer"
                className="flex w-full items-center"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                <span>Visit Site</span>
              </Link>
            </MenuItem>
            <MenuItem className="hover:bg-accent/10 focus:bg-accent/10">
              <Link
                href={`/dashboard/sites/${site.id}/settings`}
                className="flex w-full items-center"
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </MenuItem>
          </MenuPopup>
        </Menu>
      );
    },
  },
];

export function SitesTable({ data }: { data: Site[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
    },
  });

  return (
    <div className="space-y-4">
      <DataTable table={table} />
    </div>
  );
}
