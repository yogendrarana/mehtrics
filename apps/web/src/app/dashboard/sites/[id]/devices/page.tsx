import { SectionHeader } from "@/components/section-header";
import { Monitor } from "lucide-react";

export default async function DevicesAnalyticsPage() {
  return (
    <div className="flex flex-col h-full">
      <SectionHeader 
        title="Device & Platform Analytics" 
        subtitle="Analyze traffic by devices, browsers, and OS versions."
      />
      <div className="flex-1 p-8 flex flex-col items-center justify-center text-center space-y-4">
        <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center text-foreground">
          <Monitor size={32} />
        </div>
        <div className="max-w-md">
          <h3 className="text-lg font-semibold mb-2">Device & Browser Insights</h3>
          <p className="text-muted-foreground">
            Understand how many users use mobile vs desktop, and identify common browsers and operating systems.
          </p>
        </div>
      </div>
    </div>
  );
}
