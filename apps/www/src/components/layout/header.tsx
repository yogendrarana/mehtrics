"use client";

import Link from "next/link";

import { Logo } from "@/components/logo";
import { Container } from "@mehtrics/ui/container";
import { Button } from "@mehtrics/ui/button";
import { clientEnv } from "@mehtrics/env/client";

export function Header() {
  return (
    <header className="border-b border-border sticky top-0 bg-background/50 backdrop-blur-md z-50">
      <Container>
        <div className="h-16 px-0 md:px-4 flex items-center justify-between border-x border-border">
          <Logo />

          <nav className="hidden md:flex items-center gap-8 ml-10">
            <Link
              href="/pricing"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/docs"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Docs
            </Link>
          </nav>

          <div className="flex items-center gap-4 ml-auto">
            <Button
              size="sm"
              render={
                <Link href={clientEnv.NEXT_PUBLIC_APP_URL} target="_blank" />
              }
            >
              Go to app
            </Button>
          </div>
        </div>
      </Container>
    </header>
  );
}
