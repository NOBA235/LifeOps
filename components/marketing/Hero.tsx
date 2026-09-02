import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="border-b border-line px-5 pb-14 pt-16 md:px-10 md:pb-20 md:pt-24">
      <div className="mx-auto max-w-5xl">
        <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-slate">
          Built for the WebMCP challenge
        </p>
        <h1 className="mt-4 max-w-3xl font-display text-[42px] italic leading-[1.08] text-ink md:text-[64px]">
          Your goals.
          <br />
          Your agent.
          <br />
          Your control.
        </h1>
        <p className="mt-6 max-w-[52ch] text-[16px] leading-relaxed text-ink-soft md:text-[17px]">
          LifeOps is an agent-native workspace where an AI agent discovers structured tools for
          your travel, calendar, budget, notes and tasks — and stops to ask before anything
          irreversible happens.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/overview"
            className="focus-ring inline-flex h-11 items-center gap-2 rounded-[6px] bg-ink px-5 text-[14.5px] font-medium text-canvas hover:bg-ink-soft"
          >
            Open LifeOps
            <ArrowRight size={15} />
          </Link>
          <Link
            href="/webmcp"
            className="focus-ring inline-flex h-11 items-center gap-2 rounded-[6px] border border-line-strong px-5 text-[14.5px] font-medium text-ink hover:bg-canvas-sunken"
          >
            Explore WebMCP
          </Link>
        </div>
      </div>
    </section>
  );
}
