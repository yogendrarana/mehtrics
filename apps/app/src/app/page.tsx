import { Features } from "@/components/marketing/features";
import { Footer } from "@/components/marketing/footer";
import { Header } from "@/components/marketing/header";
import { Hero } from "@/components/marketing/hero";

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
