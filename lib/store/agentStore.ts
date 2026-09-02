import { create } from "zustand";
import type { ActivityEntry, ApprovalTicket } from "@/lib/webmcp/types";
import { makeId } from "@/lib/utils";

export type PlanStepStatus = "pending" | "active" | "done" | "blocked" | "error";

export interface PlanStep {
  id: string;
  order: number;
  label: string;
  toolNames: string[];
  status: PlanStepStatus;
  detail?: string;
}

interface AgentState {
  goalText: string;
  isRunning: boolean;
  plan: PlanStep[];
  activity: ActivityEntry[];
  approvals: ApprovalTicket[];
  finalMessage: string | null;
  error: string | null;
  budgetAlert: { flightLabel: string; price: number; exceedBy: number } | null;
  webmcpConnected: boolean;
  runCount: number;

  setGoalText: (t: string) => void;
  setRunning: (v: boolean) => void;
  setPlan: (plan: PlanStep[]) => void;
  updateStep: (id: string, patch: Partial<PlanStep>) => void;
  pushActivity: (entry: ActivityEntry) => void;
  updateActivity: (id: string, patch: Partial<ActivityEntry>) => void;
  addApproval: (ticket: ApprovalTicket) => void;
  resolveApproval: (id: string, status: "approved" | "rejected") => void;
  setFinalMessage: (message: string | null) => void;
  setError: (message: string | null) => void;
  setBudgetAlert: (alert: AgentState["budgetAlert"]) => void;
  setWebmcpConnected: (v: boolean) => void;
  resetAgent: () => void;
}

export const useAgentStore = create<AgentState>()((set, get) => ({
  goalText: "Prepare my Delhi trip for Friday. Keep everything under ₹10,000.",
  isRunning: false,
  plan: [],
  activity: [],
  approvals: [],
  finalMessage: null,
  error: null,
  budgetAlert: null,
  webmcpConnected: false,
  runCount: 0,

  setGoalText: (t) => set({ goalText: t }),
  setRunning: (v) => set({ isRunning: v }),
  setPlan: (plan) => set({ plan }),
  updateStep: (id, patch) =>
    set({ plan: get().plan.map((s) => (s.id === id ? { ...s, ...patch } : s)) }),

  pushActivity: (entry) => set({ activity: [entry, ...get().activity] }),
  updateActivity: (id, patch) =>
    set({
      activity: get().activity.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    }),

  addApproval: (ticket) => set({ approvals: [ticket, ...get().approvals] }),
  resolveApproval: (id, status) =>
    set({
      approvals: get().approvals.map((a) => (a.id === id ? { ...a, status } : a)),
    }),

  setFinalMessage: (message) => set({ finalMessage: message }),
  setError: (message) => set({ error: message }),
  setBudgetAlert: (alert) => set({ budgetAlert: alert }),
  setWebmcpConnected: (v) => set({ webmcpConnected: v }),

  resetAgent: () =>
    set({
      isRunning: false,
      plan: [],
      activity: [],
      approvals: [],
      finalMessage: null,
      error: null,
      budgetAlert: null,
      runCount: get().runCount + 1,
    }),
}));

export function newActivityId() {
  return makeId("act");
}
