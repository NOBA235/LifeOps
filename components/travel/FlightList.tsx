"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppStore } from "@/lib/store/appStore";
import { FlightCard } from "./FlightCard";

export function FlightList() {
  const flights = useAppStore((s) => s.flights);
  const trip = useAppStore((s) => s.trip);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Flights · {trip.origin} → {trip.destination}
        </CardTitle>
        <span className="text-[12px] text-slate">{flights.length} options</span>
      </CardHeader>
      <div>
        {flights.map((f) => (
          <FlightCard key={f.id} flight={f} />
        ))}
      </div>
    </Card>
  );
}
