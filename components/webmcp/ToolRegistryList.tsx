"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { allTools } from "@/lib/webmcp/registry";
import { useAgentStore } from "@/lib/store/agentStore";
import { ToolCard } from "./ToolCard";
import { Radio } from "lucide-react";

const DOMAIN_LABEL: Record<string, string> = {
  travel: "Travel",
  calendar: "Calendar",
  budget: "Budget",
  notes: "Notes",
  tasks: "Tasks",
};

export function ToolRegistryList() {
  const webmcpConnected = useAgentStore((s) => s.webmcpConnected);
  const domains = Array.from(new Set(allTools.map((t) => t.domain)));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[8px] border border-line bg-canvas-raised px-4 py-3">
        <div>
          <p className="text-[14px] font-medium text-ink">{allTools.length} tools available</p>
          <p className="text-[12.5px] text-slate">
            Shared registry — this list can never drift from what is actually registered.
          </p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-[12px] text-ink-soft">
          <Radio size={11} className={webmcpConnected ? "live-dot text-green" : "text-slate"} />
          {webmcpConnected ? "document.modelContext connected" : "Running in local simulation mode"}
        </span>
      </div>

      {domains.map((domain) => (
        <Card key={domain}>
          <CardHeader>
            <CardTitle>{DOMAIN_LABEL[domain] ?? domain}</CardTitle>
          </CardHeader>
          <div>
            {allTools
              .filter((t) => t.domain === domain)
              .map((tool) => (
                <ToolCard key={tool.name} tool={tool} />
              ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
