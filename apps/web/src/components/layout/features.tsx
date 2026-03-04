import { Container } from "@mehtrics/ui";
import React from "react";

export function Features() {
  return (
    <Container className="border-y">
      <section
        id="features"
        className="py-20 md:py-32 bg-muted/50 border-x border-border"
      >
        <div className="px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl font-bold">Why Mehtrics?</h2>
            <p className="text-muted-foreground">
              Built for modern developers who value speed and privacy.
            </p>
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
    </Container>
  );
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="space-y-4">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
        {icon}
      </div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
