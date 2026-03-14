import { SectionHeader } from "@/components/section-header";
import { Clock } from "lucide-react";

export default async function RealtimePage() {
  return (
    <div className="flex flex-col h-full">
      <SectionHeader
        title="Realtime Analytics"
        subtitle="See what's happening on your site right now."
        className="sticky top-0 z-10"
      />
      <div className="flex-1 p-8 flex flex-col items-center justify-center text-center space-y-4">
        <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center text-foreground">
          <Clock size={32} />
        </div>
        <div className="max-w-md">
          <h3 className="text-lg font-semibold mb-2">
            Realtime data is coming soon
          </h3>
          <p className="text-muted-foreground">
            We're building a lightning-fast realtime engine to show you live
            visitors, active pages, and current events.
          </p>
        </div>
      </div>
    </div>
  );
}
