"use client";

import Link from "next/link";

import { authClient } from "@mehtrics/auth/client";
import { Button, buttonVariants } from "@mehtrics/ui/button";
import { Container } from "@mehtrics/ui/container";
import { Logo } from "@mehtrics/ui/logo";

export function Header() {
  const { data: session, isPending } = authClient.useSession();

  return (
    <header className="border-b border-border sticky top-0 bg-background/50 backdrop-blur-md z-50">
      <Container>
        <div className="h-16 px-0 md:px-4 flex items-center justify-between border-x border-border">
          <Logo />

          <div className="flex items-center gap-4 ml-auto">
            <Link
              href="/docs"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Docs
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Pricing
            </Link>

            {isPending ? (
              <div className="h-8 w-16 rounded-md bg-muted animate-pulse" />
            ) : session?.user ? (
              <Button size="sm" render={<Link href="/dashboard" />}>
                Dashboard
              </Button>
            ) : (
              <Link
                href="/signin"
                className={buttonVariants({
                  variant: "outline",
                  size: "sm",
                  className:
                    "text-sm font-medium hover:text-primary transition-colors",
                })}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </Container>
    </header>
  );
}
