import { Logo } from "@/components/logo";
import { Button, Container } from "@mehtrics/ui";
import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-border sticky top-0 bg-background/50 backdrop-blur-md">
      <Container>
        <div className="h-16 px-0 md:px-4 flex items-center justify-between border-x border-border">
          <Logo />

          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link
              href="/pricing"
              className="hover:text-primary transition-colors"
            >
              Pricing
            </Link>
            <Link href="/docs" className="hover:text-primary transition-colors">
              Docs
            </Link>
          </div>

          <Button>
            <Link href="/signup">Get Started</Link>
          </Button>
        </div>
      </Container>
    </header>
  );
}
