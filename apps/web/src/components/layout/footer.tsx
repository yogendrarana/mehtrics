import { Container } from "@mehtrics/ui/container";
import Link from "next/link";
import { Logo } from "@/components/logo";

export function Footer() {
  return (
    <Container>
      <footer className="border-x border-border">
        <div className="px-4 py-14 md:py-16">
          <div className="grid gap-10 md:grid-cols-12">
            <div className="md:col-span-4">
              <Logo />
              <p className="mt-4 text-sm text-muted-foreground max-w-sm">
                Privacy-first traffic analytics with a fast, Vercel-style
                dashboard feel. Own your data. Ship with confidence.
              </p>
            </div>

            <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
              <FooterCol
                title="Product"
                links={[
                  { label: "Pricing", href: "/pricing" },
                  { label: "Dashboard", href: "/dashboard" },
                  { label: "Docs", href: "/docs" },
                ]}
              />
              <FooterCol
                title="Developers"
                links={[
                  { label: "Tracking script", href: "/dashboard/sites" },
                  { label: "Events", href: "/dashboard/sites" },
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
              <FooterCol
                title="Legal"
                links={[
                  { label: "Privacy", href: "/docs" },
                  { label: "Terms", href: "/docs" },
                  { label: "Security", href: "/docs" },
                ]}
              />
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-muted-foreground">
              © 2026 Mehtrics. Built for privacy.
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-4">
              <Link
                href="/pricing"
                className="hover:text-foreground transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="/docs"
                className="hover:text-foreground transition-colors"
              >
                Docs
              </Link>
              <Link
                href="#features"
                className="hover:text-foreground transition-colors"
              >
                Features
              </Link>
            </div>
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
    <div>
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
