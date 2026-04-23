"use client";

import { Button } from "@mehtrics/ui/button";
import { Container } from "@mehtrics/ui/container";
import { GitHub } from "@mehtrics/ui/icons";
import Link from "next/link";

import { Logo } from "@/components/logo";

export function Header() {
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
            <Button
              variant="outline"
              size="sm"
              render={
                <Link
                  href="https://github.com/yogendrarana/mehtrics"
                  target="_blank"
                />
              }
            >
              <GitHub className="size-4" />
              GitHub
            </Button>
          </div>
        </div>
      </Container>
    </header>
  );
}
