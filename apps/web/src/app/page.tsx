import { Hero } from "@/components/layout/hero";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Features } from "@/components/layout/features";

export default function LandingPage() {
  return (
    <div>
      <Header />
      <Hero />
      <Features />
      <Footer />
    </div>
  );
}
