"use client";

import { Code, Copy, Check } from "lucide-react";
import { useState } from "react";
import { SectionCard } from "@/components/section-card";
import { Button } from "@mehtrics/ui/button";
import { toastManager } from "@mehtrics/ui/toast";

interface SiteTrackingSettingsProps {
  site: {
    id: string;
  };
}

export function SiteTrackingSettings({ site }: SiteTrackingSettingsProps) {
  const [copied, setCopied] = useState(false);
  const trackingSnippet = `<script src="${process.env.NEXT_PUBLIC_APP_URL ?? ""}/api/script.js" data-site-id="${site.id}" async></script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(trackingSnippet);
    setCopied(true);
    toastManager.add({
      title: "Copied!",
      description: "Tracking snippet copied to clipboard.",
      type: "success",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <SectionCard
      title="Tracking Snippet"
      subtitle="Insert this snippet into your website's <head> section."
      Icon={Code}
    >
      <div className="p-4 space-y-4">
        <div className="relative group">
          <pre className="p-4 bg-muted rounded-lg text-xs font-mono overflow-x-auto break-all whitespace-pre-wrap pr-12 border">
            {trackingSnippet}
          </pre>
          <Button
            variant="outline"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Make sure to place this script ideally before any other scripts to
          ensure accurate tracking.
        </p>
      </div>
    </SectionCard>
  );
}
