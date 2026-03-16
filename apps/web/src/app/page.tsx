import { CTASection } from "@/components/layout/cta";
import { Features } from "@/components/layout/features";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { Hero } from "@/components/layout/hero";

export default function LandingPage() {
  return (
    <div>
      <Header />
      <Hero />
      <Features />
      <CTASection />
      <Footer />
    </div>
  );
}
