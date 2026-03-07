import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { cn } from "@mehtrics/utils/cn";
import Providers from "@/components/providers";

// css
import "@mehtrics/ui/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mehtrics — Modern Privacy-First Analytics",
  description:
    "The analytics platform you actually own. Self-hostable, fast, and secure.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          inter.className,
          "bg-background text-foreground min-h-screen",
        )}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
