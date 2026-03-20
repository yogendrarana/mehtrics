"use client";

import type * as React from "react";
import { ExternalLink, Maximize2 } from "lucide-react";

import {
  Dialog,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
} from "@mehtrics/ui/dialog";
import { cn } from "@mehtrics/utils/cn";
import { Button } from "@mehtrics/ui/button";
import { Card, CardContent } from "@mehtrics/ui/card";

export type TopListItem = {
  label: string;
  value: number;
  icon?: React.ReactNode;
};

type TopListCardProps = {
  title: string;
  items: TopListItem[];
  className?: string;
  limit?: number;
  valueLabel?: string;
};

export function TopListCard({
  title,
  items,
  className,
  limit = 5,
  valueLabel = "Views",
}: TopListCardProps) {
  const displayedItems = items.slice(0, limit);
  const total = items.reduce((sum, item) => sum + item.value, 0) || 1;

  return (
    <Dialog>
      <Card
        className={cn(
          "group relative flex flex-col border shadow-none rounded-sm overflow-hidden",
          className,
        )}
      >
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <span className="text-xs text-foreground font-medium">{title}</span>
          <span className="text-xs text-muted-foreground/50">{valueLabel}</span>
        </div>

        <CardContent className="p-0 flex-1">
          {items.length === 0 ? (
            <div className="h-48 flex items-center justify-center p-8">
              <p className="text-xs text-muted-foreground italic">
                No data available
              </p>
            </div>
          ) : (
            <div className="flex flex-col py-2">
              {displayedItems.map((item, index) => (
                <div
                  key={`${item.label}-${index}`}
                  className="flex items-center justify-between px-4 py-2 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {item.icon ? (
                      <span className="text-muted-foreground shrink-0">
                        {item.icon}
                      </span>
                    ) : null}
                    <span className="text-xs truncate text-foreground/80 bg-muted/50 px-1.5 py-0.5 rounded-sm">
                      {item.label}
                    </span>
                  </div>
                  <span className="text-xs text-foreground ml-4">
                    {item.value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>

        {/* Floating action buttons – visible on card hover */}
        <div
          className={cn(
            items.length < 5 && "hidden",
            "absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 translate-y-2",
            "transition-all duration-300 ease-out pointer-events-none",
            "group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto",
          )}
        >
          <div className="flex items-center gap-1 p-1 bg-background/80 backdrop-blur-md border border-border shadow-lg rounded-full">
            <DialogTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="rounded-full h-8 w-8 hover:bg-accent"
                  title="Expand"
                />
              }
            >
              <Maximize2 className="size-3.5" />
            </DialogTrigger>
            <Button
              variant="ghost"
              size="icon-xs"
              className="rounded-full h-8 w-8 hover:bg-accent"
              title="Open details"
            >
              <ExternalLink className="size-3.5" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Dialog with full unsliced list */}
      <DialogPopup className="sm:max-w-md max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-between px-6 py-2 border-y">
          <span className="text-xs font-medium text-muted-foreground">
            Name
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            {valueLabel}
          </span>
        </div>

        <DialogPanel className="p-0" scrollFade>
          {items.length === 0 ? (
            <div className="py-10 flex items-center justify-center">
              <p className="text-xs text-muted-foreground italic">
                No data available
              </p>
            </div>
          ) : (
            <div className="flex flex-col">
              {items.map((item, index) => {
                const pct = Math.round((item.value / total) * 100);

                return (
                  <div
                    key={`${item.label}-${index}`}
                    className="relative flex items-center justify-between px-6 py-2.5 hover:bg-muted/30 transition-colors"
                  >
                    <div className="relative flex items-center gap-2 min-w-0 flex-1">
                      <span className="text-xs tabular-nums text-muted-foreground/40 w-4 shrink-0">
                        {index + 1}
                      </span>

                      <span className="text-xs truncate text-foreground/80 bg-muted/50 px-1.5 py-0.5 rounded-sm">
                        {item.label}
                      </span>
                    </div>

                    <div className="relative flex items-center gap-3 ml-4 shrink-0">
                      <span className="text-xs tabular-nums text-muted-foreground/50">
                        {pct}%
                      </span>
                      <span className="text-xs font-medium text-foreground tabular-nums">
                        {item.value.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </DialogPanel>

        <DialogFooter className="py-2">
          <DialogClose render={<Button variant="outline" size="sm" />}>
            Close
          </DialogClose>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
}
