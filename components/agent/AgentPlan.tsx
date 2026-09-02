"use client";

import { Circle, CheckCircle2, Loader2, AlertCircle, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PlanStep } from "@/lib/store/agentStore";

function StepIcon({ status }: { status: PlanStep["status"] }) {
  switch (status) {
    case "pending":
      return <Circle size={16} className="text-line-strong" />;
    case "active":
      return <Loader2 size={16} className="animate-spin text-signal" />;
    case "done":
      return <CheckCircle2 size={16} className="text-green" />;
    case "error":
      return <AlertCircle size={16} className="text-red" />;
    case "blocked":
      return <Lock size={16} className="text-amber" />;
  }
}

export function AgentPlan({ plan }: { plan: PlanStep[] }) {
  if (plan.length === 0) {
    return (
      <div className="rounded-[8px] border border-dashed border-line-strong px-4 py-8 text-center text-[13px] text-slate">
        No plan yet. Describe a goal and run it to see the agent build one.
      </div>
    );
  }

  return (
    <ol className="space-y-0">
      {plan.map((step, i) => (
        <li key={step.id} className="flex gap-3 py-2.5">
          <div className="flex flex-col items-center">
            <StepIcon status={step.status} />
            {i < plan.length - 1 && <div className="mt-1 w-px flex-1 bg-line" />}
          </div>
          <div className={cn("min-w-0 flex-1 pb-1", step.status === "pending" && "opacity-50")}>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-[11px] text-slate">
                {String(step.order).padStart(2, "0")}
              </span>
              <span
                className={cn(
                  "text-[13.5px]",
                  step.status === "done" ? "text-ink" : "text-ink-soft",
                  step.status === "active" && "font-medium text-ink"
                )}
              >
                {step.label}
              </span>
            </div>
            {step.detail && <p className="mt-0.5 pl-0 text-[12.5px] text-slate">{step.detail}</p>}
            <div className="mt-1 flex flex-wrap gap-1">
              {step.toolNames.map((t) => (
                <span key={t} className="rounded-[3px] bg-canvas-sunken px-1.5 py-0.5 font-mono text-[10.5px] text-ink-soft">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
