"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAppStore } from "@/lib/store/appStore";
import { formatINR } from "@/lib/utils";
import { Lock } from "lucide-react";

export function BudgetBreakdown() {
  const trip = useAppStore((s) => s.trip);
  const items = useAppStore((s) => s.budgetItems);

  const spent = items.reduce((s, i) => s + i.amount, 0);
  const remaining = trip.budgetCap - spent;
  const pct = Math.min(100, Math.round((spent / trip.budgetCap) * 100));
  const tone = remaining < 0 ? "red" : pct > 90 ? "amber" : "signal";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trip budget</CardTitle>
        <span className="font-mono text-[13px] text-ink-soft">{formatINR(trip.budgetCap)} allocated</span>
      </CardHeader>

      <div className="px-4 pt-4">
        <Progress value={pct} tone={tone} />
      </div>

      <div>
        {items.length === 0 ? (
          <p className="px-4 py-6 text-center text-[13px] text-slate">No spending recorded yet.</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex items-center justify-between border-b border-line px-4 py-3 last:border-b-0">
              <div className="flex items-center gap-2">
                {!item.committed && <Lock size={12} className="text-amber" />}
                <div>
                  <p className="text-[13.5px] text-ink">{item.category}</p>
                  <p className="text-[12px] text-slate">{item.label}</p>
                </div>
              </div>
              <span className="font-mono text-[13.5px] text-ink-soft">{formatINR(item.amount)}</span>
            </div>
          ))
        )}
      </div>

      <div className="flex items-center justify-between border-t border-line-strong px-4 py-3">
        <span className="text-[13.5px] font-medium text-ink">Remaining</span>
        <span className={`font-mono text-[14px] font-medium ${remaining < 0 ? "text-red" : "text-ink"}`}>
          {formatINR(remaining)}
        </span>
      </div>
    </Card>
  );
}
