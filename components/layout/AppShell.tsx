"use client";

import * as React from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { NavList } from "./NavList";
import { ActivityPanel } from "@/components/agent/ActivityPanel";
import { ApprovalModalHost } from "@/components/agent/ApprovalModal";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [navOpen, setNavOpen] = React.useState(false);
  const [activityOpen, setActivityOpen] = React.useState(false);

  return (
    <div className="flex h-dvh flex-col bg-canvas">
      <TopBar onOpenNav={() => setNavOpen(true)} onOpenActivity={() => setActivityOpen(true)} />
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
        <aside className="hidden w-[300px] shrink-0 border-l border-line bg-canvas-raised lg:block">
          <ActivityPanel />
        </aside>
      </div>

      <Sheet open={navOpen} onOpenChange={setNavOpen}>
        <SheetContent side="left">
          <SheetTitle className="px-4 py-4 font-mono text-[13px] font-semibold text-ink">
            lifeops
          </SheetTitle>
          <NavList onNavigate={() => setNavOpen(false)} />
        </SheetContent>
      </Sheet>

      <Sheet open={activityOpen} onOpenChange={setActivityOpen}>
        <SheetContent side="bottom" className="h-[70vh]">
          <SheetTitle className="sr-only">Agent activity</SheetTitle>
          <ActivityPanel />
        </SheetContent>
      </Sheet>

      <ApprovalModalHost />
    </div>
  );
}
