"use client";

import { Trash2, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { SectionCard } from "@/components/dashboard/section-card";
import { Button } from "@mehtrics/ui/button";
import { toastManager } from "@mehtrics/ui/toast";
import { Spinner } from "@mehtrics/ui/spinner";
import {
  Dialog,
  DialogPopup,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@mehtrics/ui/dialog";

interface SiteDangerSettingsProps {
  site: {
    id: string;
    name: string;
  };
}

export function SiteDangerSettings({ site }: SiteDangerSettingsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const id = toastManager.add({
      type: "loading",
      title: "Deleting site...",
      description: `Removing ${site.name} and all its data.`,
    });

    try {
      const res = await fetch(`/api/site/${site.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to delete site.");
      }

      toastManager.update(id, {
        type: "success",
        title: "Site deleted",
        description: "The site and all its data have been permanently removed.",
      });

      router.push("/dashboard/sites");
      router.refresh();
    } catch (err: any) {
      toastManager.update(id, {
        type: "error",
        title: "Error deleting site",
        description: err?.message ?? "Something went wrong.",
      });
      setIsDeleting(false);
      setIsOpen(false);
    }
  };

  return (
    <SectionCard
      title="Danger Zone"
      subtitle="Irreversible actions for your site."
      Icon={AlertTriangle}
      className="border-destructive/50"
    >
      <div className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium">Delete this site</p>
          <p className="text-sm text-muted-foreground">
            Once you delete a site, there is no going back. Please be certain.
          </p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger
            render={<Button variant="destructive">Delete Site</Button>}
          />
          <DialogPopup>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-destructive" />
                Delete {site.name}?
              </DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete the
                site and all associated analytics data.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-6">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting && <Spinner className="mr-2 h-4 w-4" />}
                Permanently Delete
              </Button>
            </DialogFooter>
          </DialogPopup>
        </Dialog>
      </div>
    </SectionCard>
  );
}
