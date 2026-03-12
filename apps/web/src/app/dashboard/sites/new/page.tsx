"use client";

import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";

import { CreateSiteSchema } from "../_lib/validation";

import { Input } from "@mehtrics/ui/input";
import { Label } from "@mehtrics/ui/label";
import { Button } from "@mehtrics/ui/button";
import { toastManager } from "@mehtrics/ui/toast";

export default function NewSitePage() {
  const router = useRouter();

  const {
    state: { isSubmitting },
    handleSubmit,
    Field,
    Subscribe,
  } = useForm({
    defaultValues: {
      name: "",
      domain: "",
    },
    validators: {
      onSubmit: CreateSiteSchema,
    },
    onSubmit: async ({ value }) => {
      const id = toastManager.add({
        type: "loading",
        title: "Creating site...",
        description: "Please wait while we set up your site analytics.",
      });

      try {
        const res = await fetch("/api/site", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(value),
        });

        const data = (await res.json()) as {
          error?: string;
          site?: { id: string };
        };

        if (!res.ok) {
          throw new Error(data.error ?? "Failed to create site.");
        }

        toastManager.update(id, {
          type: "success",
          title: "Site created successfully!",
          description: "You're all set to go!",
        });

        router.push(`/dashboard/sites/${data.site!.id}`);
        router.refresh();
      } catch (err: any) {
        toastManager.update(id, {
          type: "error",
          title: "Error creating site",
          description:
            err?.message ?? "Something went wrong. Please try again.",
        });
      }
    },
  });

  return (
    <div className="w-full flex flex-col">
      <div className="p-4 border-b">
        <h1 className="text-xl font-semibold">Add a new site</h1>
        <p className="text-sm text-muted-foreground">
          Enter your site details to start tracking.
        </p>
      </div>

      <div className="p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleSubmit();
          }}
          className="space-y-4 bg-card border rounded-lg overflow-hidden"
        >
          <div className="p-4 space-y-4 text-accent-foreground">
            {/* site name */}
            <Field
              name="name"
              children={(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name} className="text-sm font-medium">
                    Site Name
                  </Label>
                  <Input
                    name={field.name}
                    id={field.name}
                    type="text"
                    placeholder="My Blog"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="bg-transparent"
                  />
                  {field.state.meta.isTouched &&
                    field.state.meta.errors.length > 0 && (
                      <div className="space-y-1">
                        {field.state.meta.errors.map((err, i) => (
                          <p key={i} className="text-xs text-destructive">
                            {typeof err === "string"
                              ? err
                              : (err as any).message}
                          </p>
                        ))}
                      </div>
                    )}
                </div>
              )}
            />

            {/* site domain */}
            <Field
              name="domain"
              children={(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name} className="text-sm font-medium">
                    Domain
                  </Label>
                  <Input
                    name={field.name}
                    id={field.name}
                    type="text"
                    placeholder="myblog.com"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="bg-transparent"
                  />
                  {field.state.meta.isTouched &&
                    field.state.meta.errors.length > 0 && (
                      <div className="space-y-1">
                        {field.state.meta.errors.map((err, i) => (
                          <p key={i} className="text-xs text-destructive">
                            {typeof err === "string"
                              ? err
                              : (err as any).message}
                          </p>
                        ))}
                      </div>
                    )}

                  <p className="text-xs text-muted-foreground mt-1">
                    Enter just the domain without https:// (e.g. myblog.com)
                  </p>
                </div>
              )}
            />
          </div>

          <div className="p-4 flex justify-end gap-3 border-t border-border bg-muted">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit || isSubmitting}>
                  {isSubmitting ? "Creating…" : "Create Site"}
                </Button>
              )}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
