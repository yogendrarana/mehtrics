import { SectionHeader } from "@/components/section-header";
import { FileText } from "lucide-react";

export default async function PagesAnalyticsPage() {
  return (
    <div className="flex flex-col h-full">
      <SectionHeader
        title="Page Performance"
        subtitle="Analyze which pages are performing best."
      />
      <div className="flex-1 p-8 flex flex-col items-center justify-center text-center space-y-4">
        <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center text-foreground">
          <FileText size={32} />
        </div>
        <div className="max-w-md">
          <h3 className="text-lg font-semibold mb-2">
            Detailed Page Analytics
          </h3>
          <p className="text-muted-foreground">
            Get insights into top pages, entry points, and exit paths to
            optimize your user experience.
          </p>
        </div>
      </div>
    </div>
  );
}
