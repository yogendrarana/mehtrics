"use client";

import { Maximize2, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@mehtrics/ui/card";
import { Button } from "@mehtrics/ui/button";
import { cn } from "@mehtrics/utils/cn";

interface ListItem {
  label: string;
  value: number;
  icon?: React.ReactNode;
}

interface TopListCardProps {
  title: string;
  items: ListItem[];
  className?: string;
  limit?: number;
}

export function TopListCard({ title, items, className, limit = 5 }: TopListCardProps) {
  const displayedItems = items.slice(0, limit);

  return (
    <Card
      className={cn(
        "group relative flex flex-col border shadow-none rounded-sm overflow-hidden",
        className
      )}
    >
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <span className="text-xs text-foreground font-medium">{title}</span>
        <span className="text-xs text-muted-foreground/50">Visitors</span>
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
            {displayedItems.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-4 py-2 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {item.icon && (
                    <span className="text-muted-foreground shrink-0">
                      {item.icon}
                    </span>
                  )}
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

      {/* Floating Action Buttons */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out pointer-events-none group-hover:pointer-events-auto">
        <div className="flex items-center gap-1 p-1 bg-background/80 backdrop-blur-md border border-border shadow-lg rounded-full">
          <Button
            variant="ghost"
            size="icon-xs"
            className="rounded-full h-8 w-8 hover:bg-accent"
            title="Expand"
          >
            <Maximize2 className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            className="rounded-full h-8 w-8 hover:bg-accent"
            title="Open Details"
          >
            <ExternalLink className="size-3.5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
