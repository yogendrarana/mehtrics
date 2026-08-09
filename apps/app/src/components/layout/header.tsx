"use client";

import { Container } from "@mehtrics/ui/container";

import { UserButton } from "@/components/user-button";
import { Logo } from "@mehtrics/ui/logo";

export function Header() {
  return (
    <header className="border-b border-border sticky top-0 bg-background/50 backdrop-blur-md z-50">
      <Container>
        <div className="h-16 px-0 md:px-4 flex items-center justify-between border-x border-border">
          <Logo />

          <div className="flex items-center gap-4">
            <UserButton />
          </div>
        </div>
      </Container>
    </header>
  );
}
