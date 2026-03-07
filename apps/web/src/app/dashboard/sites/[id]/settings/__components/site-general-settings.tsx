"use client";

import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { Globe, Settings } from "lucide-react";
import { SectionCard } from "@/components/section-card";
import { Input } from "@mehtrics/ui/input";
import { Label } from "@mehtrics/ui/label";
import { Button } from "@mehtrics/ui/button";
import { toastManager } from "@mehtrics/ui/toast";
import { Spinner } from "@mehtrics/ui/spinner";
import { CreateSiteSchema } from "@/app/dashboard/sites/_lib/validation";

interface SiteGeneralSettingsProps {
  site: {
    id: string;
    name: string;
    domain: string;
  };
}

export function SiteGeneralSettings({ site }: SiteGeneralSettingsProps) {
  const router = useRouter();

  const { Field, Subscribe, handleSubmit } = useForm({
    defaultValues: {
      name: site.name,
      domain: site.domain,
    },
    validators: {
      onSubmit: CreateSiteSchema,
    },
    onSubmit: async ({ value }) => {
      const id = toastManager.add({
        type: "loading",
        title: "Updating site...",
        description: "Applying your changes.",
      });

      try {
        const res = await fetch(`/api/site/${site.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(value),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error ?? "Failed to update site.");
        }

        toastManager.update(id, {
          type: "success",
          title: "Site updated successfully!",
          description: "Your changes have been saved.",
        });

        router.refresh();
      } catch (err: any) {
        toastManager.update(id, {
          type: "error",
          title: "Error updating site",
          description: err?.message ?? "Something went wrong.",
        });
      }
    },
  });

  return (
    <SectionCard
      title="General Settings"
      subtitle="Update your site name and domain."
      Icon={Globe}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleSubmit();
        }}
        className="divide-y"
      >
        <div className="p-4 space-y-4">
          <Field
            name="name"
            children={(field) => (
              <div className="grid grid-cols-1 md:grid-cols-2 items-end gap-4">
                <div>
                  <Label htmlFor={field.name} className="text-sm font-medium">
                    Site Name
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    How you'll identify this site in your dashboard.
                  </p>
                </div>
                <div className="space-y-1">
                  <Input
                    name={field.name}
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="My Awesome Site"
                    className="bg-transparent"
                  />
                  {field.state.meta.isTouched &&
                    field.state.meta.errors.length > 0 && (
                      <p className="text-xs text-destructive">
                        {String(field.state.meta.errors[0])}
                      </p>
                    )}
                </div>
              </div>
            )}
          />

          <Field
            name="domain"
            children={(field) => (
              <div className="grid grid-cols-1 md:grid-cols-2 items-end gap-4">
                <div>
                  <Label htmlFor={field.name} className="text-sm font-medium">
                    Domain
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    The domain name where your site is hosted.
                  </p>
                </div>
                <div className="space-y-1">
                  <Input
                    name={field.name}
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="example.com"
                    className="bg-transparent"
                  />
                  {field.state.meta.isTouched &&
                    field.state.meta.errors.length > 0 && (
                      <p className="text-xs text-destructive">
                        {String(field.state.meta.errors[0])}
                      </p>
                    )}
                </div>
              </div>
            )}
          />
        </div>

        <div className="p-4 bg-muted flex justify-end">
          <Subscribe
            selector={(state) => [
              state.canSubmit,
              state.isSubmitting,
              state.isDirty,
            ]}
            children={([canSubmit, isSubmitting, isDirty]) => (
              <Button
                type="submit"
                disabled={!canSubmit || isSubmitting || !isDirty}
              >
                {isSubmitting ? "Saving Changes..." : "Save Changes"}
              </Button>
            )}
          />
        </div>
      </form>
    </SectionCard>
  );
}
