import type { LucideIcon } from "lucide-react";
import {
  LayoutGrid,
  Sparkles,
  Plane,
  CalendarDays,
  Wallet,
  StickyNote,
  ListChecks,
  Plug,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/overview", label: "Overview", icon: LayoutGrid },
  { href: "/agent", label: "Agent", icon: Sparkles },
  { href: "/trips", label: "Trips", icon: Plane },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/budget", label: "Budget", icon: Wallet },
  { href: "/notes", label: "Notes", icon: StickyNote },
  { href: "/tasks", label: "Tasks", icon: ListChecks },
  { href: "/webmcp", label: "WebMCP", icon: Plug },
];
