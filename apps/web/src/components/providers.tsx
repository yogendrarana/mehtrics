import React from "react";

import { ToastProvider } from "@mehtrics/ui";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
