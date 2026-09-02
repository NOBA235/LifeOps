import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  SEED_BUDGET_ITEMS,
  SEED_CALENDAR,
  SEED_CHECKLIST,
  SEED_FLIGHTS,
  SEED_NOTES,
  SEED_TASKS,
  TRIP,
} from "@/lib/data/seed";
import type {
  BudgetItem,
  CalendarEvent,
  ChecklistItem,
  Flight,
  Note,
  Task,
} from "@/lib/data/types";
import { makeId } from "@/lib/utils";

// SSR-safe storage: on the server this is a harmless no-op, on the client
// it's real localStorage. Combined with `skipHydration` below, this keeps
// the server-rendered HTML and the pre-hydration client render identical.
const safeStorage = {
  getItem: (name: string) =>
    typeof window === "undefined" ? null : window.localStorage.getItem(name),
  setItem: (name: string, value: string) => {
    if (typeof window !== "undefined") window.localStorage.setItem(name, value);
  },
  removeItem: (name: string) => {
    if (typeof window !== "undefined") window.localStorage.removeItem(name);
  },
};

export type BookingStatus = "none" | "reserved" | "prepared" | "booked";

interface AppState {
  trip: typeof TRIP;
  flights: Flight[];
  selectedFlightId: string | null;
  bookingStatus: BookingStatus;
  budgetItems: BudgetItem[];
  calendarEvents: CalendarEvent[];
  checklist: ChecklistItem[];
  notes: Note[];
  tasks: Task[];

  selectFlight: (id: string | null) => void;
  setBookingStatus: (status: BookingStatus) => void;
  addBudgetItem: (item: Omit<BudgetItem, "id">) => BudgetItem;
  removeBudgetItem: (id: string) => void;
  addCalendarEvent: (event: Omit<CalendarEvent, "id">) => CalendarEvent;
  moveCalendarEvent: (id: string, time: string, endTime?: string) => CalendarEvent | null;
  toggleChecklistItem: (id: string) => void;
  addChecklistItem: (label: string) => ChecklistItem;
  addNote: (note: Omit<Note, "id" | "createdAt">) => Note;
  addTask: (label: string) => Task;
  completeTask: (id: string) => Task | null;
  resetDemo: () => void;
}

function seedState() {
  return {
    trip: TRIP,
    flights: SEED_FLIGHTS,
    selectedFlightId: null,
    bookingStatus: "none" as BookingStatus,
    budgetItems: SEED_BUDGET_ITEMS,
    calendarEvents: SEED_CALENDAR,
    checklist: SEED_CHECKLIST,
    notes: SEED_NOTES,
    tasks: SEED_TASKS,
  };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...seedState(),

      selectFlight: (id) => set({ selectedFlightId: id }),

      setBookingStatus: (status) => set({ bookingStatus: status }),

      addBudgetItem: (item) => {
        const created: BudgetItem = { ...item, id: makeId("bi") };
        set({ budgetItems: [...get().budgetItems, created] });
        return created;
      },

      removeBudgetItem: (id) =>
        set({ budgetItems: get().budgetItems.filter((b) => b.id !== id) }),

      addCalendarEvent: (event) => {
        const created: CalendarEvent = { ...event, id: makeId("ev") };
        set({ calendarEvents: [...get().calendarEvents, created] });
        return created;
      },

      moveCalendarEvent: (id, time, endTime) => {
        let moved: CalendarEvent | null = null;
        set({
          calendarEvents: get().calendarEvents.map((e) => {
            if (e.id === id) {
              moved = { ...e, time, endTime: endTime ?? e.endTime };
              return moved;
            }
            return e;
          }),
        });
        return moved;
      },

      toggleChecklistItem: (id) =>
        set({
          checklist: get().checklist.map((c) =>
            c.id === id ? { ...c, checked: !c.checked } : c
          ),
        }),

      addChecklistItem: (label) => {
        const created: ChecklistItem = { id: makeId("ck"), label, checked: false };
        set({ checklist: [...get().checklist, created] });
        return created;
      },

      addNote: (note) => {
        const created: Note = { ...note, id: makeId("note"), createdAt: Date.now() };
        set({ notes: [...get().notes, created] });
        return created;
      },

      addTask: (label) => {
        const created: Task = { id: makeId("tk"), label, done: false, createdAt: Date.now() };
        set({ tasks: [...get().tasks, created] });
        return created;
      },

      completeTask: (id) => {
        let updated: Task | null = null;
        set({
          tasks: get().tasks.map((t) => {
            if (t.id === id) {
              updated = { ...t, done: true };
              return updated;
            }
            return t;
          }),
        });
        return updated;
      },

      resetDemo: () => set({ ...seedState() }),
    }),
    {
      name: "lifeops-app-store",
      storage: createJSONStorage(() => safeStorage),
      skipHydration: true,
    }
  )
);
