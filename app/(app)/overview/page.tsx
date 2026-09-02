import { ActiveGoalCard } from "@/components/overview/ActiveGoalCard";
import { RecentActivity } from "@/components/overview/RecentActivity";
import { PendingApprovalCard } from "@/components/overview/PendingApprovalCard";
import { RunAgentButton } from "@/components/agent/RunAgentButton";

export default function OverviewPage() {
  return (
    <div className="px-5 py-6 md:px-8 md:py-8">
      <div className="max-w-2xl">
        <h1 className="font-display text-[30px] italic leading-tight text-ink md:text-[36px]">
          Your goals. Your agent. Your control.
        </h1>
        <p className="mt-3 text-[14.5px] leading-relaxed text-ink-soft">
          A real Gemini-powered agent operates your travel, calendar, budget, notes and tasks
          through structured tools — while every irreversible step still waits for you.
        </p>
        <div className="mt-4">
          <RunAgentButton variant="signal" />
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <ActiveGoalCard />
        <RecentActivity />
      </div>

      <div className="mt-4 max-w-2xl">
        <PendingApprovalCard />
      </div>
    </div>
  );
}
