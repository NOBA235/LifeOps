"use client";

import { useAppStore } from "@/lib/store/appStore";
import { formatINR } from "@/lib/utils";

export function TripHeader() {
  const trip = useAppStore((s) => s.trip);
  const budgetItems = useAppStore((s) => s.budgetItems);
  const spent = budgetItems.reduce((s, i) => s + i.amount, 0);

  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line px-5 py-4 md:px-8">
      <div>
        <h2 className="text-[16px] font-medium text-ink">
          {trip.destination} trip
        </h2>
        <p className="text-[13px] text-slate">{trip.displayRange}</p>
      </div>
      <p className="font-mono text-[13px] text-ink-soft">
        {formatINR(spent)} / {formatINR(trip.budgetCap)}
      </p>
    </div>
  );
}
