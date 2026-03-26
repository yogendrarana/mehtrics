import { SectionHeader } from "@/components/section-header";
import { CreditCard } from "lucide-react";

export default function BillingPage() {
  return (
    <div className="flex flex-col h-full">
      <SectionHeader
        title="Account Billing"
        subtitle="Manage your subscription and invoices."
      />
      <div className="flex-1 p-8 flex flex-col items-center justify-center text-center space-y-4">
        <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center text-foreground">
          <CreditCard size={32} />
        </div>
        <div className="max-w-md">
          <h3 className="text-lg font-semibold mb-2">Billing & Subscription</h3>
          <p className="text-muted-foreground">
            View your current plan and manage your payment methods and bills in
            one place.
          </p>
        </div>
      </div>
    </div>
  );
}
