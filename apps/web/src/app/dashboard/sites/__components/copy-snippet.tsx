"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@mehtrics/ui/button";

export function CopySnippet({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="outline"
      size="icon-sm"
      className="bg-background shrink-0"
      onClick={copy}
    >
      {copied ? (
        <Check size={14} className="text-emerald-500" />
      ) : (
        <Copy size={14} />
      )}
    </Button>
  );
}
