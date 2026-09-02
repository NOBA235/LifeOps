import { Check, Loader2, Circle, Lock } from "lucide-react";

const STEPS: { label: string; status: "done" | "active" | "pending" | "locked"; detail?: string }[] = [
  { label: "Search flights", status: "done", detail: "6 options found" },
  { label: "Check budget", status: "done", detail: "₹6,600 available for flights" },
  { label: "Check calendar", status: "done", detail: "1 conflict found on Friday morning" },
  { label: "Select flight within budget", status: "done", detail: "Air India · ₹6,420 · 170m" },
  { label: "Request purchase approval", status: "locked", detail: "Waiting for your approval…" },
];

const ACTIVITY = [
  { tool: "search_flights", tag: "read" as const },
  { tool: "get_budget", tag: "read" as const },
  { tool: "find_free_time", tag: "read" as const },
  { tool: "prepare_flight_booking", tag: "prepare" as const },
  { tool: "confirm_flight_purchase", tag: "commit" as const },
];

function StatusIcon({ status }: { status: (typeof STEPS)[number]["status"] }) {
  if (status === "done") return <Check size={13} className="text-green" />;
  if (status === "active") return <Loader2 size={13} className="animate-spin text-signal" />;
  if (status === "locked") return <Lock size={13} className="text-amber" />;
  return <Circle size={13} className="text-line-strong" />;
}

const TAG_CLASS: Record<string, string> = {
  read: "bg-green-soft text-green",
  prepare: "bg-signal-soft text-signal",
  commit: "bg-amber-soft text-amber",
};

export function ProductPreview() {
  return (
    <section className="px-5 pb-16 md:px-10">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-[10px] border border-line-strong bg-canvas-raised shadow-[0_16px_50px_-24px_rgba(20,22,26,0.25)]">
        <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
            <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
            <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
          </div>
          <span className="ml-2 font-mono text-[11.5px] text-slate">lifeops.app/agent</span>
        </div>
        <div className="grid md:grid-cols-[1fr_260px]">
          <div className="p-5 md:p-6">
            <p className="text-[12px] font-medium text-ink-soft">Agent plan</p>
            <ol className="mt-3 space-y-3">
              {STEPS.map((s) => (
                <li key={s.label} className="flex items-start gap-2.5">
                  <div className="mt-0.5"><StatusIcon status={s.status} /></div>
                  <div>
                    <p className="text-[13.5px] text-ink">{s.label}</p>
                    {s.detail && <p className="text-[12px] text-slate">{s.detail}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="border-t border-line md:border-l md:border-t-0">
            <p className="px-4 pt-4 text-[12px] font-medium text-ink-soft">Activity</p>
            <ul className="p-4 pt-2 space-y-2.5">
              {ACTIVITY.map((a) => (
                <li key={a.tool} className="flex items-center justify-between gap-2">
                  <span className="truncate font-mono text-[11.5px] text-ink">{a.tool}</span>
                  <span className={`shrink-0 rounded-[3px] px-1.5 py-0.5 font-mono text-[10px] uppercase ${TAG_CLASS[a.tag]}`}>
                    {a.tag}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
