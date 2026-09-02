import { Eye, PenLine, ShieldCheck } from "lucide-react";

const LEVELS = [
  {
    icon: Eye,
    name: "Read",
    tone: "text-green",
    bg: "bg-green-soft",
    desc: "Safe to run automatically — search flights, check the budget, read the calendar.",
  },
  {
    icon: PenLine,
    name: "Prepare",
    tone: "text-signal",
    bg: "bg-signal-soft",
    desc: "The agent can act, but always shows the result — draft an itinerary, hold a budget line.",
  },
  {
    icon: ShieldCheck,
    name: "Commit",
    tone: "text-amber",
    bg: "bg-amber-soft",
    desc: "Irreversible or financial — purchasing, deleting, sending. Always waits for you.",
  },
];

export function PermissionLevels() {
  return (
    <section className="border-b border-line px-5 py-16 md:px-10">
      <div className="mx-auto max-w-5xl">
        <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-slate">Human + agent collaboration</p>
        <h2 className="mt-3 max-w-xl text-[26px] font-medium leading-tight text-ink md:text-[32px]">
          The agent doesn&apos;t blindly execute everything.
        </h2>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {LEVELS.map((level) => (
            <div key={level.name} className="rounded-[8px] border border-line p-5">
              <span className={`inline-flex h-8 w-8 items-center justify-center rounded-[6px] ${level.bg}`}>
                <level.icon size={16} className={level.tone} />
              </span>
              <p className="mt-3 text-[15px] font-medium text-ink">{level.name}</p>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-soft">{level.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
