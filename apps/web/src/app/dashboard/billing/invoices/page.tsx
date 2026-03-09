import { SectionHeader } from "@/components/section-header";
import { FileText } from "lucide-react";

export default function InvoicesPage() {
  return (
    <div className="flex flex-col h-full">
      <SectionHeader 
        title="Invoices & Billing History" 
        subtitle="Manage your past payments and download invoices."
      />
      <div className="flex-1 p-8 flex flex-col items-center justify-center text-center space-y-4">
        <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center text-foreground">
          <FileText size={32} />
        </div>
        <div className="max-w-md">
          <h3 className="text-lg font-semibold mb-2">Billing History</h3>
          <p className="text-muted-foreground">
            View your complete transaction history, download PDF invoices, and manage your billing information in one secure location.
          </p>
        </div>
      </div>
    </div>
  );
}
