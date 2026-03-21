"use client";

import { Menu, X } from "lucide-react";
import {
  Drawer,
  DrawerTrigger,
  DrawerPopup,
  DrawerHeader,
  DrawerTitle,
  DrawerPanel,
  DrawerClose,
} from "@mehtrics/ui/drawer";
import { Button } from "@mehtrics/ui/button";
import { DashboardMenu } from "./dashboard-menu";

export function MobileDashboardMenu() {
  return (
    <Drawer position="left">
      <DrawerTrigger
        render={
          <Button variant="ghost" size="icon" className="rounded-none">
            <Menu className="size-5" />
          </Button>
        }
      />
      <DrawerPopup className="w-80" variant="inset">
        <DrawerHeader className="border-b py-4">
          <div className="flex items-center justify-between">
            <DrawerTitle>Dashboard</DrawerTitle>
            <DrawerClose
              render={
                <Button variant="secondary" size="icon" className="size-8">
                  <X className="size-4" />
                </Button>
              }
            />
          </div>
        </DrawerHeader>
        <DrawerPanel className="p-0">
          <DashboardMenu />
        </DrawerPanel>
      </DrawerPopup>
    </Drawer>
  );
}
