"use client";

import type { Column } from "@tanstack/react-table";
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  EyeOff,
  X,
} from "lucide-react";

import { cn } from "@mehtrics/utils/cn";
import {
  Menu,
  MenuCheckboxItem,
  MenuItem,
  MenuPopup,
  MenuTrigger,
} from "../ui/menu";

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.ComponentProps<typeof MenuTrigger> {
  column: Column<TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
  ...props
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort() && !column.getCanHide()) {
    return <div className={cn(className)}>{title}</div>;
  }

  return (
    <Menu>
      <MenuTrigger
        className={cn(
          "-ml-1.5 flex h-8 items-center gap-1.5 rounded-md px-2 py-1.5 hover:bg-accent focus:outline-none data-[state=open]:bg-accent [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground",
          className,
        )}
        {...props}
      >
        {title}
        {column.getCanSort() &&
          (column.getIsSorted() === "desc" ? (
            <ChevronDown className="h-4 w-4" />
          ) : column.getIsSorted() === "asc" ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronsUpDown className="h-4 w-4" />
          ))}
      </MenuTrigger>
      
      <MenuPopup align="start" className="w-28">
        {column.getCanSort() && (
          <>
            <MenuCheckboxItem
              className="relative pr-8 pl-2 cursor-pointer [&>span:first-child]:right-2 [&>span:first-child]:left-auto [&_svg]:text-muted-foreground"
              checked={column.getIsSorted() === "asc"}
              onClick={() => column.toggleSorting(false)}
            >
              <ChevronUp className="h-4 w-4 mr-2" />
              Asc
            </MenuCheckboxItem>
            <MenuCheckboxItem
              className="relative pr-8 pl-2 cursor-pointer [&>span:first-child]:right-2 [&>span:first-child]:left-auto [&_svg]:text-muted-foreground"
              checked={column.getIsSorted() === "desc"}
              onClick={() => column.toggleSorting(true)}
            >
              <ChevronDown className="h-4 w-4 mr-2" />
              Desc
            </MenuCheckboxItem>
            {column.getIsSorted() && (
              <MenuItem
                className="pl-2 [&_svg]:text-muted-foreground"
                onClick={() => column.clearSorting()}
              >
                <X className="h-4 w-4 mr-2" />
                Reset
              </MenuItem>
            )}
          </>
        )}

        {column.getCanHide() && (
          <MenuCheckboxItem
            className="relative pr-8 pl-2 cursor-pointer [&>span:first-child]:right-2 [&>span:first-child]:left-auto [&_svg]:text-muted-foreground"
            checked={!column.getIsVisible()}
            onClick={() => column.toggleVisibility(false)}
          >
            <EyeOff className="h-4 w-4 mr-2" />
            Hide
          </MenuCheckboxItem>
        )}
      </MenuPopup>
    </Menu>
  );
}
