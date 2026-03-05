import React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@mehtrics/utils";

export function SettingCard({
  title,
  subtitle,
  Icon,
  children,
  className,
}: {
  title: string;
  subtitle: string;
  Icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="rounded-md overflow-hidden border">
      <div className="px-4 py-3 border-b">
        <div className="flex items-center space-x-2 text-base font-medium">
          {Icon && <Icon className="h-4 w-4" />}
          <span>{title}</span>
        </div>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>

      <div className={cn("", className)}>{children}</div>
    </div>
  );
}
