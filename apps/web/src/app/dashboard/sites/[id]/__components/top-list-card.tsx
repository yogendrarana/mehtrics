"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@mehtrics/ui/card";
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
}

export function TopListCard({ title, items, className }: TopListCardProps) {
  return (
    <Card
      className={cn("flex flex-col border shadow-none rounded-sm", className)}
    >
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <span className="text-xs text-foreground">{title}</span>
        <span className="text-xs text-muted-foreground/50">Visitors</span>
      </div>

      <CardContent className="p-0 flex-1 overflow-auto">
        {items.length === 0 ? (
          <div className="h-48 flex items-center justify-center p-8">
            <p className="text-xs text-muted-foreground italic">
              No data available
            </p>
          </div>
        ) : (
          <div className="flex flex-col py-2">
            {items.map((item, i) => (
              <div
                key={i}
                className="group flex items-center justify-between px-4 py-2 hover:bg-muted/30 transition-colors"
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
    </Card>
  );
}
