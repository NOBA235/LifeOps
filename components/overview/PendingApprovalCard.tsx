"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAgentStore } from "@/lib/store/agentStore";
import { resolveApprovalTicket } from "@/lib/webmcp/registry";
import { formatINR } from "@/lib/utils";
import { ShieldAlert } from "lucide-react";

export function PendingApprovalCard() {
  const approvals = useAgentStore((s) => s.approvals);
  const pending = [...approvals].reverse().find((a) => a.status === "pending");

  if (!pending) return null;

  return (
    <Card className="border-amber/40 bg-amber-soft">
      <div className="p-4">
        <div className="flex items-center gap-2">
          <ShieldAlert size={15} className="text-amber" />
          <span className="text-[13px] font-medium text-amber">Action requires your approval</span>
        </div>
        <p className="mt-2 text-[15px] font-medium text-ink">{pending.title}</p>
        <p className="mt-1 text-[13px] text-ink-soft">{pending.description}</p>
        <div className="mt-3 flex items-center gap-2">
          <Badge variant="commit">{pending.toolName}</Badge>
          {typeof pending.financialImpact === "number" && (
            <span className="font-mono text-[12.5px] text-ink-soft">
              {formatINR(pending.financialImpact)}
            </span>
          )}
        </div>
        <div className="mt-4 flex gap-2">
          <Button variant="outline" size="sm" onClick={() => resolveApprovalTicket(pending.id, false)}>
            Reject
          </Button>
          <Button variant="signal" size="sm" onClick={() => resolveApprovalTicket(pending.id, true)}>
            Approve
          </Button>
        </div>
      </div>
    </Card>
  );
}
