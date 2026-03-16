import { Button } from "@mehtrics/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@mehtrics/ui/card";
import { Container } from "@mehtrics/ui/container";
import { cn } from "@mehtrics/utils/cn";
import Link from "next/link";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

const planList = [
  {
    name: "Starter",
    price: "$3",
    description: "For shipping your first site",
    features: [
      "50k events / month",
      "1 site",
      "Realtime analytics",
      "UTM + referrer breakdowns",
    ],
  },
  {
    name: "Pro",
    price: "$6",
    description: "For growing products",
    features: [
      "250k events / month",
      "5 sites",
      "Custom events + goals",
      "Funnels and conversions",
      "Email summaries",
    ],
  },
  {
    name: "Scale",
    price: "$9",
    description: "For teams and multiple properties",
    features: [
      "1M events / month",
      "20 sites",
      "Team access",
      "Priority support",
      "Export-ready reporting",
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <Container className="flex-1 flex flex-col border-b border-border">
        <div className="flex-1 border-x border-border flex flex-col py-20 md:py-28 px-4">
          <div className="flex flex-col items-center justify-center text-center space-y-4 mb-14 md:mb-18">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-balance">
              Simple pricing. Three plans.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl text-pretty">
              Flat monthly pricing. No annual contracts, no billing toggles, no
              surprises.
            </p>
            <div className="text-sm text-muted-foreground">
              Need help choosing?{" "}
              <Link
                href="/docs"
                className="underline underline-offset-4 hover:text-foreground"
              >
                Read the docs
              </Link>
              .
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto w-full">
            {planList.map((plan) => (
              <Card
                key={plan.name}
                className={cn(
                  "flex flex-col border-border/60 bg-card/70 backdrop-blur supports-[backdrop-filter]:bg-card/50 transition-all hover:border-foreground/20 hover:shadow-2xl hover:shadow-black/5 dark:hover:shadow-black/30",
                  plan.name === "Pro" &&
                    "border-foreground/15 ring-1 ring-foreground/10",
                )}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      <CardDescription className="mt-2">
                        {plan.description}
                      </CardDescription>
                    </div>
                    {plan.name === "Pro" && (
                      <span className="bg-foreground/5 text-foreground text-xs font-semibold px-2.5 py-1 rounded-full border border-border">
                        Best value
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-grow space-y-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl md:text-5xl font-extrabold tracking-tight">
                      {plan.price}
                    </span>
                    <span className="text-muted-foreground font-medium">
                      /mo
                    </span>
                  </div>
                  <ul className="space-y-4">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start text-sm">
                        <CheckIcon className="mr-3 h-5 w-5 text-primary shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full h-11"
                    variant={plan.name === "Pro" ? "default" : "outline"}
                    render={<Link href="/signup" />}
                  >
                    Start {plan.name}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="mt-14 md:mt-18 max-w-6xl mx-auto w-full">
            <div className="rounded-3xl border border-border bg-muted/30 px-6 py-8 text-center">
              <div className="text-sm text-muted-foreground">
                All plans include: cookie-free tracking, unlimited dashboards,
                and dark mode.
              </div>
              <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button render={<Link href="/signup" />}>
                  Create an account
                </Button>
                <Button variant="outline" render={<Link href="/#features" />}>
                  Explore features
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Container>
      <Footer />
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      className={className}
    >
      <title>Included</title>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
