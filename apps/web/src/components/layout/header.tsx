"use client";

import Link from "next/link";

import { Logo } from "@/components/logo";
import { authClient } from "@mehtrics/auth";
import { Button } from "@mehtrics/ui/button";
import { Container } from "@mehtrics/ui/container";

export function Header() {
  const { isPending, data } = authClient.useSession();
  const isLoggedIn = !isPending && !!data?.user;

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

          <div className="flex items-center gap-4">
            {isLoggedIn && (
              <Button
                onClick={() => authClient.signOut()}
                variant="ghost"
                size="sm"
              >
                Sign Out
              </Button>
            )}
            <Button>
              <Link href={isLoggedIn ? "/dashboard" : "/signup"}>
                {isLoggedIn ? "Dashboard" : "Get Started"}
              </Link>
            </Button>
          </div>
        </div>
      </Container>
    </header>
  );
}
