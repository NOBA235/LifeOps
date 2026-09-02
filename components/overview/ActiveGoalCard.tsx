"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAppStore } from "@/lib/store/appStore";
import { useAgentStore } from "@/lib/store/agentStore";
import { formatINR } from "@/lib/utils";

export function ActiveGoalCard() {
  const trip = useAppStore((s) => s.trip);
  const bookingStatus = useAppStore((s) => s.bookingStatus);
  const plan = useAgentStore((s) => s.plan);

  const done = plan.filter((s) => s.status === "done").length;
  const pct = plan.length > 0 ? Math.round((done / plan.length) * 100) : bookingStatus === "booked" ? 100 : 0;

  const statusLabel =
    bookingStatus === "booked"
      ? "Booked"
      : bookingStatus === "prepared" || bookingStatus === "reserved"
      ? "Booking prepared"
      : "Not started";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active goal</CardTitle>
        <span className="text-[12px] text-slate">{statusLabel}</span>
      </CardHeader>
      <CardContent>
        <p className="text-[15px] font-medium text-ink">Prepare {trip.destination} trip</p>
        <p className="mt-1 text-[13px] text-ink-soft">
          {formatINR(trip.budgetCap)} budget · {trip.displayRange}
        </p>
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-[12px] text-slate">
            <span>Progress</span>
            <span className="font-mono">{pct}%</span>
          </div>
          <Progress value={pct} tone={pct === 100 ? "green" : "signal"} />
        </div>
      </CardContent>
    </Card>
  );
}
