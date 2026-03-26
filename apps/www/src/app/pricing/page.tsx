import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import Pricing from "@/app/pricing/__components/pricing";

export default function PricingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <Pricing />
      <Footer />
    </div>
  );
}
