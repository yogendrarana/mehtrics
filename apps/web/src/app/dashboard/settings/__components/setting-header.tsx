import { cn } from "@mehtrics/utils";

export function SettingHeader({
    title,
    subtitle,
    className
}: {
    title: string;
    subtitle?: string;
    className?: string;
}) {
    return (
        <div className={cn("p-4 border-b bg-background", className)}>
            <h2 className="text-md font-semibold">{title}</h2>
            {subtitle && <p className="text-muted-foreground text-sm">{subtitle}</p>}
        </div>
    );
}