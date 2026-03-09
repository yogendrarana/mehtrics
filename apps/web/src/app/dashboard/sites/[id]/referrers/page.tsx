import { SectionHeader } from "@/components/section-header";
import { Share2 } from "lucide-react";

export default async function ReferrersAnalyticsPage() {
  return (
    <div className="flex flex-col h-full">
      <SectionHeader 
        title="Referrer Sources" 
        subtitle="Understand where your traffic is coming from."
      />
      <div className="flex-1 p-8 flex flex-col items-center justify-center text-center space-y-4">
        <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center text-foreground">
          <Share2 size={32} />
        </div>
        <div className="max-w-md">
          <h3 className="text-lg font-semibold mb-2">Detailed Referrer Analytics</h3>
          <p className="text-muted-foreground">
            Analyze your primary traffic drivers, from social media to organic search and referral links.
          </p>
        </div>
      </div>
    </div>
  );
}
