import { Container } from "@mehtrics/ui";
import React from "react";

export function Footer() {
  return (
    <Container>
      <footer className="border-border py-12 border-x">
        <div className="px-4 text-center text-sm text-muted-foreground">
          © 2026 Mehtrics. Built for privacy.
        </div>
      </footer>
    </Container>
  );
}
