"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppStore } from "@/lib/store/appStore";
import { Plane, MapPin, BedDouble, Users, Clock, Circle } from "lucide-react";
import type { CalendarEvent } from "@/lib/data/types";

const KIND_ICON: Record<CalendarEvent["kind"], typeof Plane> = {
  flight: Plane,
  arrival: MapPin,
  hotel: BedDouble,
  meeting: Users,
  free: Clock,
  other: Circle,
};

function toMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function DayTimeline({ day }: { day: string }) {
  const events = useAppStore((s) => s.calendarEvents)
    .filter((e) => e.day === day)
    .sort((a, b) => toMinutes(a.time) - toMinutes(b.time));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{day}</CardTitle>
        <span className="text-[12px] text-slate">{events.length} event{events.length === 1 ? "" : "s"}</span>
      </CardHeader>
      <div>
        {events.length === 0 ? (
          <p className="px-4 py-6 text-center text-[13px] text-slate">Nothing scheduled.</p>
        ) : (
          events.map((e) => {
            const Icon = KIND_ICON[e.kind];
            return (
              <div key={e.id} className="flex items-center gap-3 border-b border-line px-4 py-3 last:border-b-0">
                <span className="w-12 shrink-0 font-mono text-[13px] text-ink-soft">{e.time}</span>
                <Icon size={15} className="shrink-0 text-signal" />
                <span className="text-[13.5px] text-ink">{e.title}</span>
                {e.endTime && <span className="ml-auto shrink-0 text-[12px] text-slate">until {e.endTime}</span>}
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
