import type {
  Flight,
  BudgetItem,
  CalendarEvent,
  ChecklistItem,
  Note,
  Task,
} from "./types";

export const TRIP = {
  destination: "Delhi",
  origin: "Dimapur",
  startDate: "2026-09-04",
  endDate: "2026-09-07",
  displayRange: "September 4–7",
  budgetCap: 10000,
};

// Six real-looking options on the Dimapur → Delhi route. Prices are chosen
// deliberately so the affordability math produces genuine, non-scripted
// constraint moments (see lib/agent/reasoning.ts).
export const SEED_FLIGHTS: Flight[] = [
  {
    id: "fl_ai_101",
    airline: "Air India",
    from: "Dimapur",
    to: "Delhi",
    departTime: "09:20",
    arriveTime: "12:10",
    durationMinutes: 170,
    price: 6420,
    stops: 0,
  },
  {
    id: "fl_ig_204",
    airline: "IndiGo",
    from: "Dimapur",
    to: "Delhi",
    departTime: "07:05",
    arriveTime: "09:35",
    durationMinutes: 150,
    price: 7840,
    stops: 0,
  },
  {
    id: "fl_sj_318",
    airline: "SpiceJet",
    from: "Dimapur",
    to: "Delhi",
    departTime: "11:45",
    arriveTime: "17:05",
    durationMinutes: 320,
    price: 5980,
    stops: 1,
  },
  {
    id: "fl_vt_552",
    airline: "Vistara",
    from: "Dimapur",
    to: "Delhi",
    departTime: "06:15",
    arriveTime: "08:35",
    durationMinutes: 155,
    price: 8150,
    stops: 0,
  },
  {
    id: "fl_ak_119",
    airline: "Akasa Air",
    from: "Dimapur",
    to: "Delhi",
    departTime: "13:30",
    arriveTime: "16:10",
    durationMinutes: 160,
    price: 6900,
    stops: 0,
  },
  {
    id: "fl_ai_140",
    airline: "Air India",
    from: "Dimapur",
    to: "Delhi",
    departTime: "18:50",
    arriveTime: "23:40",
    durationMinutes: 290,
    price: 5620,
    stops: 1,
  },
];

export const SEED_BUDGET_ITEMS: BudgetItem[] = [
  { id: "bi_hotel", category: "Hotel", label: "Hotel · 3 nights", amount: 2500, committed: true },
  { id: "bi_transport", category: "Transport", label: "Airport transfers", amount: 500, committed: true },
  { id: "bi_food", category: "Food", label: "Meals", amount: 400, committed: true },
];

export const SEED_CALENDAR: CalendarEvent[] = [
  {
    id: "ev_sync",
    day: "Friday, Sep 4",
    time: "10:00",
    endTime: "10:45",
    title: "Client sync",
    kind: "meeting",
    movable: true,
  },
  {
    id: "ev_free_evening",
    day: "Friday, Sep 4",
    time: "18:00",
    title: "Free",
    kind: "free",
    movable: false,
  },
];

export const SEED_CHECKLIST: ChecklistItem[] = [
  { id: "ck_id", label: "ID", checked: false },
  { id: "ck_charger", label: "Charger", checked: false },
  { id: "ck_clothes", label: "Clothes", checked: false },
  { id: "ck_laptop", label: "Laptop", checked: false },
  { id: "ck_earphones", label: "Earphones", checked: false },
];

export const SEED_NOTES: Note[] = [
  {
    id: "note_travel",
    title: "Travel notes",
    body: "Flight arrives at 12:10. Hotel check-in starts at 15:00.",
    createdAt: Date.now(),
  },
];

export const SEED_TASKS: Task[] = [
  { id: "tk_flight", label: "Book flight", done: false, createdAt: Date.now() },
  { id: "tk_hotel", label: "Reserve hotel", done: false, createdAt: Date.now() },
  { id: "tk_pack", label: "Pack documents", done: false, createdAt: Date.now() },
  { id: "tk_tickets", label: "Download tickets", done: false, createdAt: Date.now() },
  { id: "tk_weather", label: "Check weather", done: false, createdAt: Date.now() },
];
