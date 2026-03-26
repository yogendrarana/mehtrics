import * as React from "react";
import { cn } from "@mehtrics/utils/cn";

export function SectionHeader({
  title,
  subtitle,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "p-4 border-b bg-background flex flex-col sm:flex-row sm:items-center justify-between gap-4",
        className,
      )}
    >
      <div>
        <h2 className="text-md font-semibold">{title}</h2>
        {subtitle && (
          <p className="text-muted-foreground text-sm">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
}
