import { Container } from "@mehtrics/ui/container";
import { GitHub } from "@mehtrics/ui/icons";
import { Logo } from "@mehtrics/ui/logo";
import Link from "next/link";

export function Footer() {
  return (
    <Container>
      <footer className="border-x border-border">
        <div>
          {/* Top section */}
          <div className="p-8 flex flex-col md:flex-row items-start justify-between gap-10">
            {/* Left */}
            <div className="max-w-sm">
              <Logo />
              <p className="mt-4 text-sm text-muted-foreground">
                Privacy-first traffic analytics with a fast, Vercel-style
                dashboard feel. Own your data. Ship with confidence.
              </p>
            </div>

            {/* GitHub icon in place of Product */}
            <div className="flex items-center justify-end w-full md:w-auto">
              <Link
                target="_blank"
                rel="noopener noreferrer"
                href="https://github.com/yogendrarana/mehtrics"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="GitHub"
              >
                <GitHub className="size-5" />
              </Link>
            </div>
          </div>

          {/* Bottom */}
          <div className="p-6 border-t border-border flex items-center justify-center">
            <div className="text-xs text-muted-foreground text-center">
              © 2026 Mehtrics. Built for privacy.
            </div>
          </div>
        </div>
      </footer>
    </Container>
  );
}
