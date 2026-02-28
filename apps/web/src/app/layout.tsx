import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cn } from "@mehtrics/utils";
import "@mehtrics/ui/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mehtrics — Modern Privacy-First Analytics",
  description: "The analytics platform you actually own. Self-hostable, fast, and secure.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={cn(inter.className, "bg-background text-foreground min-h-screen")}>
        <nav className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-md z-50">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="font-bold text-xl tracking-tight">Mehtrics</div>
            <div className="hidden md:flex items-center gap-8 text-sm font-medium">
              <a href="#features" className="hover:text-primary transition-colors">Features</a>
              <a href="/pricing" className="hover:text-primary transition-colors">Pricing</a>
              <a href="/docs" className="hover:text-primary transition-colors">Docs</a>
            </div>
            <div className="flex items-center gap-4">
              <a href="/login" className="text-sm font-medium hover:text-primary">Login</a>
              <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
                Get Started
              </button>
            </div>
          </div>
        </nav>
        {children}
        <footer className="border-t border-border py-12 bg-muted/30">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            © 2026 Mehtrics. Built for privacy.
          </div>
        </footer>
      </body>
    </html>
  );
}
