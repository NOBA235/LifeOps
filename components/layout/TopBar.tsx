"use client";

import { Menu, Radio, ListTree } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAgentStore } from "@/lib/store/agentStore";

export function TopBar({
  onOpenNav,
  onOpenActivity,
}: {
  onOpenNav: () => void;
  onOpenActivity: () => void;
}) {
  const webmcpConnected = useAgentStore((s) => s.webmcpConnected);

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-line bg-canvas-raised px-3 md:px-5">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onOpenNav} aria-label="Open navigation">
          <Menu size={18} />
        </Button>
        <span className="font-mono text-[13px] font-semibold tracking-tight text-ink md:hidden">
          lifeops
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-[12px] text-ink-soft sm:flex">
          <Radio size={11} className={webmcpConnected ? "live-dot text-green" : "text-slate"} />
          Agent
          <span className="text-slate">·</span>
          <span>{webmcpConnected ? "Connected" : "Running locally"}</span>
        </span>
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onOpenActivity} aria-label="Open activity">
          <ListTree size={18} />
        </Button>
      </div>
    </header>
  );
}
