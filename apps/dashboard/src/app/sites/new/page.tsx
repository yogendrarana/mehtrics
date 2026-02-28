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

    const res = await fetch("/api/sites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, domain }),
    });

    const data = await res.json() as { error?: string; site?: { id: string } };

    if (!res.ok) {
      setError(data.error ?? "Failed to create site.");
      setLoading(false);
      return;
    }

    router.push(`/sites/${data.site!.id}`);
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-xl font-bold">Mehtrics</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <div className="space-y-2 mb-6">
          <h2 className="text-lg font-semibold">Add a new site</h2>
          <p className="text-sm text-muted-foreground">
            Enter your site details to start tracking.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="site-name" className="text-sm font-medium">Site Name</label>
            <Input
              id="site-name"
              type="text"
              placeholder="My Blog"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="site-domain" className="text-sm font-medium">Domain</label>
            <Input
              id="site-domain"
              type="text"
              placeholder="myblog.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Enter just the domain without https:// (e.g. myblog.com)
            </p>
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">{error}</p>
          )}

          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? "Creating…" : "Create Site"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
