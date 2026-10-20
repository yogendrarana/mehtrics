"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { authClient } from "@mehtrics/auth/client";
import { Button, buttonVariants } from "@mehtrics/ui/button";
import { Container } from "@mehtrics/ui/container";
import { Logo } from "@mehtrics/ui/logo";
import { UserButton } from "@/components/user-button";

export function Header() {
  const { data: session, isPending } = authClient.useSession();
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");

  return (
    <header className="border-b border-border sticky top-0 bg-background/50 backdrop-blur-md z-50">
      <Container>
        <div className="h-16 px-0 md:px-4 flex items-center justify-between border-x border-border">
          <Logo />

          <div className="flex items-center gap-3 sm:gap-4 ml-auto">
            {isPending ? (
              <div className="size-8 rounded-full bg-muted animate-pulse" />
            ) : session?.user ? (
              <>
                {!isDashboard && (
                  <Button
                    size="sm"
                    variant="outline"
                    render={<Link href="/dashboard" />}
                  >
                    Dashboard
                  </Button>
                )}
                <UserButton />
              </>
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
