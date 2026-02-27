import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cn } from "@mehtrics/utils";

import "@mehtrics/ui/globals.css";

export const metadata: Metadata = {
  title: "Mehtrics",
  description: "Mehtrics for traffic analysis",
};

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
     	<body
				className={cn(
					"w-full flex flex-col justify-center overflow-x-hidden scroll-smooth",
					inter.className,
				)}
			>
        {children}
      </body>
    </html>
  );
}
