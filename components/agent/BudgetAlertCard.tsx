"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/utils";

export function BudgetAlertCard({
  flightLabel,
  price,
  exceedBy,
}: {
  flightLabel: string;
  price: number;
  exceedBy: number;
}) {
  const [showNote, setShowNote] = React.useState(false);

  return (
    <div className="rounded-[8px] border border-amber/30 bg-amber-soft p-4">
      <div className="flex items-center gap-2 text-[13px] font-medium text-amber">
        <AlertTriangle size={14} />
        Budget constraint detected
      </div>
      <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">
        {flightLabel} ({formatINR(price)}) would exceed your travel budget by{" "}
        <span className="font-medium text-ink">{formatINR(exceedBy)}</span>.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href="/trips">Find cheaper options</Link>
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setShowNote((s) => !s)}>
          Ask to increase budget
        </Button>
      </div>
      {showNote && (
        <p className="mt-2 text-[12px] text-slate">
          Budget increases aren&apos;t available in this demo — the agent will keep looking for
          options within ₹10,000 instead.
        </p>
      )}
    </div>
  );
}
