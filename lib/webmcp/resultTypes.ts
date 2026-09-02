// Concrete result-data shapes returned by each tool's execute(), shared
// between the tool definitions (as their TResult generic) and any call
// site (like the agent plan engine) that needs to read a result's data
// without resorting to `any`.
import type { Flight, BudgetItem, CalendarEvent, Note, ChecklistItem, Task } from "@/lib/data/types";
import type { AffordabilityCheck } from "@/lib/agent/reasoning";

export interface SearchFlightsResult {
  count: number;
  flights: Flight[];
}

export interface CompareFlightsResult {
  sortedBy: string;
  flights: (Flight & AffordabilityCheck)[];
}

export interface PrepareBookingResult {
  flight: Flight;
  remainingAfter: number;
}

export interface ConfirmPurchaseResult {
  flight: Flight;
  bookingStatus: string;
}

export type FindFreeTimeResult =
  | { day: string; free: boolean; conflicts: CalendarEvent[] }
  | { day: string; events: CalendarEvent[] };

export interface CalendarEventResult {
  event: CalendarEvent;
}

export interface GetBudgetResult {
  allocated: number;
  items: BudgetItem[];
  spent: number;
  remaining: number;
}

export interface BudgetItemResult {
  item: BudgetItem;
}

export interface NoteResult {
  note: Note;
}

export interface ChecklistItemResult {
  item: ChecklistItem;
}

export interface TaskResult {
  task: Task;
}
