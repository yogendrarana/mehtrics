import { SectionHeader } from "@/components/section-header";
import { MousePointerClick } from "lucide-react";

export default async function EventsAnalyticsPage() {
  return (
    <div className="flex flex-col h-full">
      <SectionHeader 
        title="Event Tracking" 
        subtitle="Track button clicks, video views, and custom events."
      />
      <div className="flex-1 p-8 flex flex-col items-center justify-center text-center space-y-4">
        <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center text-foreground">
          <MousePointerClick size={32} />
        </div>
        <div className="max-w-md">
          <h3 className="text-lg font-semibold mb-2">Custom Event Tracking</h3>
          <p className="text-muted-foreground">
            Monitor critical conversions, UI interactions, and custom user journeys in real-time.
          </p>
        </div>
      </div>
    </div>
  );
}
