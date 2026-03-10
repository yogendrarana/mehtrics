import { SectionHeader } from "@/components/section-header";
import { Activity } from "lucide-react";

export default function UsagePage() {
  return (
    <div className="flex flex-col h-full">
      <SectionHeader
        title="Usage Statistics"
        subtitle="Monitor your events, pageviews, and visitor counts."
      />
      <div className="flex-1 p-8 flex flex-col items-center justify-center text-center space-y-4">
        <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center text-foreground">
          <Activity size={32} />
        </div>
        <div className="max-w-md">
          <h3 className="text-lg font-semibold mb-2">
            Detailed Usage Breakdown
          </h3>
          <p className="text-muted-foreground">
            Monitor your event limits across all your websites to ensure your
            data stays tracked without interruption.
          </p>
        </div>
      </div>
    </div>
  );
}
