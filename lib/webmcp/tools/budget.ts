import type { ToolDefinition } from "@/lib/webmcp/types";
import type { GetBudgetResult, BudgetItemResult } from "@/lib/webmcp/resultTypes";
import { useAppStore } from "@/lib/store/appStore";
import { checkAffordability, type AffordabilityCheck } from "@/lib/agent/reasoning";
import { formatINR } from "@/lib/utils";
import type { BudgetItem } from "@/lib/data/types";

interface CheckAffordabilityInput {
  amount: number;
}

interface ReserveBudgetInput {
  category: BudgetItem["category"];
  amount: number;
  label?: string;
}

export const getBudget: ToolDefinition<Record<string, never>, GetBudgetResult> = {
  name: "get_budget",
  description: "Read the current trip budget: allocation, committed items and remaining balance.",
  domain: "budget",
  permission: "read",
  inputSchema: { type: "object", properties: {} },
  execute: async () => {
    const { trip, budgetItems } = useAppStore.getState();
    const spent = budgetItems.reduce((s, i) => s + i.amount, 0);
    return {
      success: true,
      data: { allocated: trip.budgetCap, items: budgetItems, spent, remaining: trip.budgetCap - spent },
    };
  },
  summarize: (_input, result) =>
    result.success ? `Budget: ${formatINR(result.data.remaining)} remaining` : "Could not read budget",
};

export const checkAffordabilityTool: ToolDefinition<CheckAffordabilityInput, AffordabilityCheck> = {
  name: "check_affordability",
  description: "Check whether a given amount fits within the remaining travel budget before committing to it.",
  domain: "budget",
  permission: "read",
  inputSchema: {
    type: "object",
    properties: {
      amount: { type: "number", description: "Amount in INR to check" },
    },
    required: ["amount"],
  },
  execute: async (input) => {
    const { trip, budgetItems } = useAppStore.getState();
    const result = checkAffordability(input.amount, trip.budgetCap, budgetItems);
    return { success: true, data: result };
  },
  summarize: (input, result) =>
    result.success
      ? result.data.affordable
        ? `${formatINR(input.amount)} fits the remaining budget`
        : `${formatINR(input.amount)} exceeds budget by ${formatINR(result.data.exceedBy)}`
      : "Could not check affordability",
};

export const reserveBudget: ToolDefinition<ReserveBudgetInput, BudgetItemResult> = {
  name: "reserve_budget",
  description: "Place a soft, reversible hold on part of the budget before preparing a booking.",
  domain: "budget",
  permission: "prepare",
  inputSchema: {
    type: "object",
    properties: {
      category: { type: "string", enum: ["Flights", "Hotel", "Transport", "Food", "Other"] },
      amount: { type: "number" },
      label: { type: "string" },
    },
    required: ["category", "amount"],
  },
  execute: async (input) => {
    const created = useAppStore.getState().addBudgetItem({
      category: input.category,
      label: input.label ?? `${input.category} hold`,
      amount: input.amount,
      committed: false,
    });
    return { success: true, data: { item: created } };
  },
  summarize: (input) => `Reserved ${formatINR(input.amount)} for ${input.category}`,
};

export const recordExpense: ToolDefinition<ReserveBudgetInput, BudgetItemResult> = {
  name: "record_expense",
  description: "Record a finalized expense against the budget. This permanently commits the spend.",
  domain: "budget",
  permission: "commit",
  inputSchema: {
    type: "object",
    properties: {
      category: { type: "string", enum: ["Flights", "Hotel", "Transport", "Food", "Other"] },
      amount: { type: "number" },
      label: { type: "string" },
    },
    required: ["category", "amount"],
  },
  execute: async (input) => {
    const created = useAppStore.getState().addBudgetItem({
      category: input.category,
      label: input.label ?? `${input.category} expense`,
      amount: input.amount,
      committed: true,
    });
    return { success: true, data: { item: created } };
  },
  summarize: (input) => `Recorded ${formatINR(input.amount)} expense · ${input.category}`,
};

export const budgetTools = [getBudget, checkAffordabilityTool, reserveBudget, recordExpense];
