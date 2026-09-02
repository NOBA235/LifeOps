import type { BudgetItem } from "@/lib/data/types";

export interface AffordabilityCheck {
  affordable: boolean;
  remainingBeforeFlight: number;
  exceedBy: number;
}

/** Sum of already-committed, non-flight budget items. */
export function committedSpend(items: BudgetItem[]): number {
  return items
    .filter((i) => i.category !== "Flights")
    .reduce((sum, i) => sum + i.amount, 0);
}

export function checkAffordability(
  price: number,
  budgetCap: number,
  items: BudgetItem[]
): AffordabilityCheck {
  const remainingBeforeFlight = budgetCap - committedSpend(items);
  const exceedBy = Math.max(0, price - remainingBeforeFlight);
  return { affordable: exceedBy === 0, remainingBeforeFlight, exceedBy };
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}
