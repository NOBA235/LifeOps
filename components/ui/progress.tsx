import { cn } from "@/lib/utils";

export function Progress({ value, className, tone = "signal" }: { value: number; className?: string; tone?: "signal" | "green" | "amber" | "red" }) {
  const toneClass = {
    signal: "bg-signal",
    green: "bg-green",
    amber: "bg-amber",
    red: "bg-red",
  }[tone];
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-canvas-sunken", className)}>
      <div
        className={cn("h-full rounded-full transition-[width] duration-500 ease-out", toneClass)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
