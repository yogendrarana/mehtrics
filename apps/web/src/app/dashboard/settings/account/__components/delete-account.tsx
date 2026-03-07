"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPopup,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@mehtrics/ui/alert-dialog";
import { Button } from "@mehtrics/ui/button";
import { Label } from "@mehtrics/ui/label";
import { Input } from "@mehtrics/ui/input";

export function DeleteAccount() {
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <Button variant="destructive">Delete Account</Button>
      </AlertDialogTrigger>

      <AlertDialogPopup>
        <AlertDialogHeader className="pb-0">
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-red-500" />
            Delete Account Permanently
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove all your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="px-6 py-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
            <h4 className="font-medium text-red-800 mb-2">
              What will be deleted:
            </h4>
            <ul className="space-y-1 text-sm text-red-700">
              <li>• Your profile and account information</li>
              <li>• All uploaded files and documents</li>
              <li>• Account settings and preferences</li>
              <li>• Billing history and subscription data</li>
              <li>• All associated data and backups</li>
            </ul>
          </div>

          <div>
            <Label
              htmlFor="delete-confirmation"
              className="text-sm font-medium"
            >
              Type "DELETE" to confirm:
            </Label>
            <Input
              id="delete-confirmation"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="mt-2"
            />
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogClose onClick={() => setDeleteConfirmation("")}>
            Cancel
          </AlertDialogClose>
          <Button
            className="bg-red-600 hover:bg-red-700"
            disabled={deleteConfirmation !== "DELETE"}
            onClick={() => {
              setDeleteConfirmation("");
            }}
          >
            Delete Account Permanently
          </Button>
        </AlertDialogFooter>
      </AlertDialogPopup>
    </AlertDialog>
  );
}
