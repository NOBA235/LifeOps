export interface Flight {
  id: string;
  airline: string;
  from: string;
  to: string;
  departTime: string; // "09:20"
  arriveTime: string; // "12:10"
  durationMinutes: number;
  price: number;
  stops: number;
}

export interface BudgetItem {
  id: string;
  category: "Flights" | "Hotel" | "Transport" | "Food" | "Other";
  label: string;
  amount: number;
  committed: boolean;
}

export interface CalendarEvent {
  id: string;
  day: string; // "Friday, Sep 4"
  time: string; // "09:20"
  endTime?: string;
  title: string;
  kind: "flight" | "arrival" | "hotel" | "meeting" | "free" | "other";
  movable: boolean;
}

export interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

export interface Note {
  id: string;
  title: string;
  body: string;
  createdAt: number;
}

export interface Task {
  id: string;
  label: string;
  done: boolean;
  createdAt: number;
}
