import { Button } from "@mehtrics/ui";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@mehtrics/ui";

const plans = [
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
    features: ["1M events/mo", "20 sites", "Advanced breakdowns", "Priority support"],
  },
  {
    name: "Business",
    price: "$49",
    description: "Unlimited scale",
    features: ["Unlimited events", "Unlimited sites", "Custom domains", "API access"],
  },
];

export default function PricingPage() {
  return (
    <div className="container mx-auto py-24 px-4">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
        <p className="text-xl text-muted-foreground">Choose the plan that's right for you.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <Card key={plan.name} className="flex flex-col">
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="text-4xl font-bold mb-6">{plan.price}<span className="text-lg font-normal text-muted-foreground">/mo</span></div>
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center text-sm">
                    <span className="mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Get Started</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
