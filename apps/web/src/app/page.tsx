import { Button } from "@mehtrics/ui";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="py-24 px-4 text-center space-y-8 max-w-4xl mx-auto">
        <div className="inline-block px-4 py-1.5 mb-4 text-xs font-semibold tracking-wider text-primary uppercase bg-primary/10 rounded-full">
          Open Source & Self-Hostable
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
          Analytics that you <span className="text-primary italic">actually</span> own.
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Mehtrics is a high-performance, privacy-first alternative to Google Analytics. 
          Blazing fast, GDPR compliant, and beautifully simple.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" className="h-12 px-8 text-lg">
            Start Free Trial
          </Button>
          <Button size="lg" variant="outline" className="h-12 px-8 text-lg">
            View Demo
          </Button>
        </div>
        <div className="pt-12">
          <div className="rounded-2xl border border-border bg-card shadow-2xl p-2 max-w-5xl mx-auto">
             <div className="aspect-video bg-muted rounded-xl flex items-center justify-center text-muted-foreground">
               [Dashboard Preview Image]
             </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-muted/30 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl font-bold">Why Mehtrics?</h2>
            <p className="text-muted-foreground">Built for modern developers who value speed and privacy.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            <FeatureCard 
              title="Self-Hostable" 
              description="Deploy on your own infra in 60 seconds. Full control over your data."
              icon="🏠"
            />
            <FeatureCard 
              title="Lightweight" 
              description="A tracking script under 3kb. Zero impact on your site's performance."
              icon="⚡"
            />
            <FeatureCard 
              title="GDPR Compliant" 
              description="No cookies, no fingerprinting, no raw IPs. Privacy by design."
              icon="🛡️"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ title, description, icon }: { title: string, description: string, icon: string }) {
  return (
    <div className="space-y-4">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
        {icon}
      </div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}
