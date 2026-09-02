"use client";

import { useAgentStore } from "@/lib/store/agentStore";
import { runGeminiAgent } from "@/lib/agent/geminiAgent";
import { Button } from "@/components/ui/button";
import { AgentPlan } from "./AgentPlan";
import { BudgetAlertCard } from "./BudgetAlertCard";
import { Play, Sparkles, AlertCircle, MessageSquare } from "lucide-react";

export function AgentWorkspace() {
  const goalText = useAgentStore((s) => s.goalText);
  const setGoalText = useAgentStore((s) => s.setGoalText);
  const isRunning = useAgentStore((s) => s.isRunning);
  const plan = useAgentStore((s) => s.plan);
  const finalMessage = useAgentStore((s) => s.finalMessage);
  const error = useAgentStore((s) => s.error);
  const budgetAlert = useAgentStore((s) => s.budgetAlert);

  const doneCount = plan.filter((s) => s.status === "done").length;
  const progressLabel = plan.length > 0 ? `${doneCount} / ${plan.length} calls` : null;

  return (
    <div className="mx-auto max-w-2xl px-5 py-6 md:px-8 md:py-8">
      <label htmlFor="goal" className="text-[13px] font-medium text-ink-soft">
        What would you like to accomplish?
      </label>
      <textarea
        id="goal"
        value={goalText}
        onChange={(e) => setGoalText(e.target.value)}
        disabled={isRunning}
        rows={2}
        className="focus-ring mt-2 w-full resize-none rounded-[8px] border border-line-strong bg-canvas-raised px-3.5 py-3 text-[14.5px] text-ink placeholder:text-slate disabled:opacity-60"
        placeholder={'e.g. "Prepare my Delhi trip for Friday under ₹10,000"'}
      />

      <div className="mt-3 flex items-center gap-2">
        <Button onClick={() => runGeminiAgent()} disabled={isRunning || !goalText.trim()} className="gap-2">
          <Play size={14} />
          {isRunning ? "Thinking…" : "Execute plan"}
        </Button>
        <span className="text-[12.5px] text-slate">
          Powered by Gemini — the model decides every tool call.
        </span>
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-[8px] border border-red/30 bg-red-soft px-3.5 py-3 text-[13px] text-red">
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="mt-8 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-[13px] font-medium text-ink">
          <Sparkles size={14} className="text-signal" />
          Steps taken
        </h2>
        {progressLabel && <span className="font-mono text-[11.5px] text-slate">{progressLabel}</span>}
      </div>
      <p className="mt-1 text-[12px] text-slate">
        Not a fixed script — this list fills in live as the model decides what to call next.
      </p>
      <div className="mt-3 border-t border-line">
        <AgentPlan plan={plan} />
      </div>

      {budgetAlert && (
        <div className="mt-4">
          <BudgetAlertCard
            flightLabel={budgetAlert.flightLabel}
            price={budgetAlert.price}
            exceedBy={budgetAlert.exceedBy}
          />
        </div>
      )}

      {finalMessage && (
        <div className="mt-4 rounded-[8px] border border-line bg-canvas-sunken p-4">
          <div className="flex items-center gap-2 text-[13px] font-medium text-ink">
            <MessageSquare size={14} className="text-signal" />
            Agent response
          </div>
          <p className="mt-2 whitespace-pre-wrap text-[13.5px] leading-relaxed text-ink-soft">
            {finalMessage}
          </p>
        </div>
      )}
    </div>
  );
}
