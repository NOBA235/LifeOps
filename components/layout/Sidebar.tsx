"use client";

import { NavList } from "./NavList";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store/appStore";
import { useAgentStore } from "@/lib/store/agentStore";
import { RotateCcw } from "lucide-react";

export function Sidebar() {
  const resetDemo = useAppStore((s) => s.resetDemo);
  const resetAgent = useAgentStore((s) => s.resetAgent);

  return (
    <aside className="hidden w-[216px] shrink-0 border-r border-line bg-canvas-raised md:flex md:flex-col">
      <div className="px-4 py-4">
        <span className="font-mono text-[13px] font-semibold tracking-tight text-ink">
          lifeops
        </span>
      </div>
      <div className="flex-1 py-1">
        <NavList />
      </div>
      <div className="border-t border-line p-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-ink-soft"
          onClick={() => {
            resetDemo();
            resetAgent();
          }}
        >
          <RotateCcw size={14} />
          Reset demo data
        </Button>
      </div>
    </aside>
  );
}
