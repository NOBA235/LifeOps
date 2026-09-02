"use client";

import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAgentStore } from "@/lib/store/agentStore";
import { resolveApprovalTicket } from "@/lib/webmcp/registry";
import { formatINR } from "@/lib/utils";
import { ShieldAlert } from "lucide-react";

/**
 * Watches the approval queue and surfaces the oldest pending ticket as a
 * blocking dialog, no matter which page the person is on. This is the one
 * moment in LifeOps where the agent must stop and wait for a human.
 */
export function ApprovalModalHost() {
  const approvals = useAgentStore((s) => s.approvals);
  const pending = [...approvals].reverse().find((a) => a.status === "pending");

  return (
    <Dialog open={!!pending}>
      <DialogContent onEscapeKeyDown={(e) => e.preventDefault()} onInteractOutside={(e) => e.preventDefault()}>
        {pending && (
          <>
            <div className="mb-3 flex items-center gap-2">
              <Badge variant="commit">Commit · needs approval</Badge>
            </div>
            <DialogTitle className="text-[16px] font-medium text-ink">{pending.title}</DialogTitle>
            <DialogDescription className="mt-1.5 text-[13.5px] leading-relaxed text-ink-soft">
              {pending.description}
            </DialogDescription>

            <div className="mt-4 space-y-2 rounded-[6px] border border-line bg-canvas-sunken p-3 text-[13px]">
              <div className="flex items-center gap-2 text-ink-soft">
                <ShieldAlert size={14} className="text-amber" />
                <span>Requesting tool</span>
                <span className="font-mono text-ink">{pending.toolName}</span>
              </div>
              {typeof pending.financialImpact === "number" && (
                <div className="flex items-center justify-between border-t border-line pt-2">
                  <span className="text-ink-soft">Financial impact</span>
                  <span className="font-mono font-medium text-ink">
                    {formatINR(pending.financialImpact)}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => resolveApprovalTicket(pending.id, false)}>
                Reject
              </Button>
              <Button variant="signal" onClick={() => resolveApprovalTicket(pending.id, true)}>
                Approve action
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
