"use client";

import * as React from "react";
import { useAgentStore } from "@/lib/store/agentStore";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  X,
  Lock,
  Loader2,
  ChevronDown,
  Radio,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ActivityEntry } from "@/lib/webmcp/types";

function StatusIcon({ status }: { status: ActivityEntry["status"] }) {
  switch (status) {
    case "running":
      return <Loader2 size={14} className="animate-spin text-signal" />;
    case "success":
      return <Check size={14} className="text-green" />;
    case "error":
      return <X size={14} className="text-red" />;
    case "rejected":
      return <X size={14} className="text-red" />;
    case "awaiting_approval":
      return <Lock size={14} className="text-amber" />;
  }
}

function permissionVariant(p: ActivityEntry["permission"]) {
  if (p === "read") return "read" as const;
  if (p === "prepare") return "prepare" as const;
  return "commit" as const;
}

function Row({ entry }: { entry: ActivityEntry }) {
  const [open, setOpen] = React.useState(false);
  const duration = entry.finishedAt ? entry.finishedAt - entry.startedAt : null;

  return (
    <li className="border-b border-line last:border-b-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="focus-ring flex w-full items-start gap-2.5 px-3 py-2.5 text-left hover:bg-canvas-sunken"
      >
        <div className="mt-0.5 shrink-0">
          <StatusIcon status={entry.status} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate font-mono text-[12px] text-ink">{entry.toolName}</span>
            <Badge variant={permissionVariant(entry.permission)} className="shrink-0">
              {entry.permission}
            </Badge>
          </div>
          <p className="mt-0.5 truncate text-[12.5px] text-ink-soft">{entry.summary}</p>
        </div>
        <ChevronDown
          size={14}
          className={cn("mt-1 shrink-0 text-slate transition-transform", open && "rotate-180")}
        />
      </button>
      {open && (
        <div className="space-y-2 border-t border-line bg-canvas-sunken px-3 py-2.5 font-mono text-[11px] text-ink-soft">
          <div>
            <div className="mb-1 text-slate">input</div>
            <pre className="overflow-x-auto whitespace-pre-wrap break-all rounded bg-canvas-raised p-2">
              {JSON.stringify(entry.input, null, 2)}
            </pre>
          </div>
          {entry.result && (
            <div>
              <div className="mb-1 text-slate">result</div>
              <pre className="overflow-x-auto whitespace-pre-wrap break-all rounded bg-canvas-raised p-2">
                {JSON.stringify(entry.result, null, 2)}
              </pre>
            </div>
          )}
          {duration !== null && <div className="text-slate">{duration}ms · {entry.domain}</div>}
        </div>
      )}
    </li>
  );
}

export function ActivityPanel() {
  const activity = useAgentStore((s) => s.activity);
  const webmcpConnected = useAgentStore((s) => s.webmcpConnected);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-line px-3 py-3">
        <span className="text-[13px] font-medium text-ink">Agent activity</span>
        <span className="flex items-center gap-1.5 text-[11px] text-slate">
          <Radio size={11} className={webmcpConnected ? "text-green" : "text-slate"} />
          {webmcpConnected ? "WebMCP" : "Local"}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {activity.length === 0 ? (
          <div className="px-3 py-8 text-center text-[12.5px] text-slate">
            No tool calls yet. Give the agent a goal to see it work.
          </div>
        ) : (
          <ul>
            {activity.map((entry) => (
              <Row key={entry.id} entry={entry} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
