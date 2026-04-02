import Link from "next/link";

import { Logo } from "@/components/logo";
import { GitHub } from "@mehtrics/ui/icons";
import { Container } from "@mehtrics/ui/container";

export function Footer() {
  return (
    <Container>
      <footer className="border-x border-border">
        <div className="">
          {/* Top section */}
          <div className="p-8 flex flex-col md:flex-row justify-between gap-10">
            {/* Left */}
            <div className="max-w-sm">
              <Logo />
              <p className="mt-4 text-sm text-muted-foreground">
                Privacy-first traffic analytics with a fast, Vercel-style
                dashboard feel. Own your data. Ship with confidence.
              </p>
            </div>

            <div className="flex justify-end gap-12 w-full md:w-auto">
              <FooterCol
                title="Developers"
                links={[
                  { label: "Tracking script", href: "/docs" },
                  { label: "Events", href: "/docs" },
                  { label: "API", href: "/docs" },
                ]}
              />
              <FooterCol
                title="Company"
                links={[
                  { label: "About", href: "/" },
                  { label: "Changelog", href: "/docs" },
                  { label: "Contact", href: "/pricing" },
                ]}
              />
            </div>
          </div>

          {/* Bottom */}
          <div className="p-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-muted-foreground">
              © 2026 Mehtrics. Built for privacy.
            </div>
            <Link
              target="_blank"
              href="https://github.com/yogendrarana/mehtrics"
              className="hover:text-foreground transition-colors"
            >
              <GitHub className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </footer>
    </Container>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: Array<{ label: string; href: string }>;
}) {
  return (
    <div className="text-right min-w-30">
      <div className="text-sm font-semibold tracking-tight">{title}</div>
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
