import React from "react";

import { ThemeProvider } from "next-themes";
import { ToastProvider } from "@mehtrics/ui";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ToastProvider>{children}</ToastProvider>
    </ThemeProvider>
  );
}
