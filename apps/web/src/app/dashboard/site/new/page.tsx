"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@mehtrics/ui";
import { Input } from "@mehtrics/ui";

export default function NewSitePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/site", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, domain }),
    });

    const data = (await res.json()) as {
      error?: string;
      site?: { id: string };
    };

    if (!res.ok) {
      setError(data.error ?? "Failed to create site.");
      setLoading(false);
      return;
    }

    router.push(`/dashboard/site/${data.site!.id}`);
  }

  return (
    <div className="flex flex-col max-w-2xl mx-auto w-full space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Add a new site</h1>
        <p className="text-muted-foreground">
          Enter your site details to start tracking.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 border border-border rounded-xl p-6 bg-card"
      >
        <div className="space-y-2">
          <label htmlFor="site-name" className="text-sm font-medium">
            Site Name
          </label>
          <Input
            id="site-name"
            type="text"
            placeholder="My Blog"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="bg-transparent"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="site-domain" className="text-sm font-medium">
            Domain
          </label>
          <Input
            id="site-domain"
            type="text"
            placeholder="myblog.com"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            required
            className="bg-transparent"
          />
          <p className="text-xs text-muted-foreground">
            Enter just the domain without https:// (e.g. myblog.com)
          </p>
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-4 border-t border-border">
          <Button type="submit" disabled={loading}>
            {loading ? "Creating…" : "Create Site"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
