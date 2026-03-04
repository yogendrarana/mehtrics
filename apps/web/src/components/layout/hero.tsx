import { Badge, Button, Container } from "@mehtrics/ui";

export function Hero() {
  return (
    <Container>
      <section className="border-x py-20 md:py-32 space-y-20 md:space-y-32">
        <div className="flex flex-col items-center gap-10">
          <Badge variant="outline" className="p-3 rounded-full">
            Open Source & Self-Hostable
          </Badge>

          <h1 className="text-2xl md:text-5xl font-extrabold tracking-tight">
            Analytics that you actually own.
          </h1>

          <p className="text-xl text-muted-foreground text-center max-w-3xl mx-auto">
            Mehtrics is a high-performance, privacy-first alternative to Google
            Analytics. Blazing fast, GDPR compliant, and beautifully simple.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="h-12 px-8 text-lg">
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-lg">
              View Demo
            </Button>
          </div>
        </div>

        <div className="w-full p-2 max-w-7xl mx-auto rounded-2xl border border-border bg-card shadow-xl ">
          <div className="aspect-video bg-muted rounded-xl flex items-center justify-center text-muted-foreground">
            [Dashboard Preview Image]
          </div>
        </div>
      </section>
    </Container>
  );
}
