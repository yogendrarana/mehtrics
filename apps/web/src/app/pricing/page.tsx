import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { cn } from "@mehtrics/utils/cn";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@mehtrics/ui/card";
import { Button } from "@mehtrics/ui/button";
import { Container } from "@mehtrics/ui/container";

const planList = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for hobby projects",
    features: ["10k events/mo", "1 site", "Basic analytics"],
  },
  {
    name: "Pro",
    price: "$19",
    description: "For serious creators",
    features: [
      "1M events/mo",
      "20 sites",
      "Advanced breakdowns",
      "Priority support",
    ],
  },
  {
    name: "Business",
    price: "$49",
    description: "Unlimited scale",
    features: [
      "Unlimited events",
      "Unlimited sites",
      "Custom domains",
      "API access",
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <Container className="flex-1 flex flex-col border-b">
        <div className="flex-1 border-x border-border flex flex-col py-20 md:py-32">
          <div className="flex flex-col items-center justify-center text-center space-y-4 mb-16 md:mb-24 px-6">
            <h1 className="text-2xl md:text-5xl font-extrabold tracking-tight">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Choose the plan that's right for you. Everything you need to
              measure what matters.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto w-full">
            {planList.map((plan) => (
              <Card
                key={plan.name}
                className={cn(
                  "flex flex-col border-border/50 transition-all hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5",
                  plan.name === "Pro" &&
                    "border-primary/50 ring-1 ring-primary/20",
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
                      <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-full">
                        Popular
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
                  >
                    Get Started
                  </Button>
                </CardFooter>
              </Card>
            ))}
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
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
