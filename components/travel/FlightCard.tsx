"use client";

import * as React from "react";
import { Plane, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store/appStore";
import { invokeTool } from "@/lib/webmcp/registry";
import { checkAffordability, formatDuration } from "@/lib/agent/reasoning";
import { formatINR } from "@/lib/utils";
import type { Flight } from "@/lib/data/types";

export function FlightCard({ flight }: { flight: Flight }) {
  const [pending, setPending] = React.useState<"prepare" | "purchase" | null>(null);
  const trip = useAppStore((s) => s.trip);
  const budgetItems = useAppStore((s) => s.budgetItems);
  const selectedFlightId = useAppStore((s) => s.selectedFlightId);
  const bookingStatus = useAppStore((s) => s.bookingStatus);

  const isSelected = selectedFlightId === flight.id;
  const affordability = checkAffordability(flight.price, trip.budgetCap, budgetItems);

  async function handlePrepare() {
    setPending("prepare");
    await invokeTool("prepare_flight_booking", { flightId: flight.id });
    setPending(null);
  }

  async function handlePurchase() {
    setPending("purchase");
    await invokeTool("confirm_flight_purchase", { flightId: flight.id });
    setPending(null);
  }

  return (
    <div className="flex flex-col gap-3 border-b border-line px-4 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <div className="text-center">
          <p className="font-mono text-[15px] font-medium text-ink">{flight.departTime}</p>
          <p className="text-[12px] text-slate">{flight.from}</p>
        </div>
        <div className="flex flex-col items-center px-1 text-slate">
          <Plane size={14} className="rotate-90" />
          <span className="mt-1 text-[11px]">{formatDuration(flight.durationMinutes)}</span>
        </div>
        <div className="text-center">
          <p className="font-mono text-[15px] font-medium text-ink">{flight.arriveTime}</p>
          <p className="text-[12px] text-slate">{flight.to}</p>
        </div>
        <div className="ml-2 border-l border-line pl-4">
          <p className="text-[13.5px] font-medium text-ink">{flight.airline}</p>
          <p className="text-[13px] text-ink-soft">
            {formatINR(flight.price)} · {flight.stops === 0 ? "Nonstop" : `${flight.stops} stop`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:flex-col sm:items-end">
        {!affordability.affordable && (
          <Badge variant="error">Over budget</Badge>
        )}
        {isSelected && bookingStatus === "booked" ? (
          <Badge variant="read">Booked</Badge>
        ) : isSelected && (bookingStatus === "prepared" || bookingStatus === "reserved") ? (
          <Button size="sm" variant="signal" onClick={handlePurchase} disabled={pending !== null}>
            {pending === "purchase" ? <Loader2 size={13} className="animate-spin" /> : null}
            Purchase
          </Button>
        ) : (
          <Button size="sm" variant="outline" onClick={handlePrepare} disabled={pending !== null}>
            {pending === "prepare" ? <Loader2 size={13} className="animate-spin" /> : null}
            Select
          </Button>
        )}
      </div>
    </div>
  );
}
