import type { AnyToolDefinition, ToolExecutionResult, ActivityEntry, ApprovalTicket } from "@/lib/webmcp/types";
import { travelTools } from "@/lib/webmcp/tools/travel";
import { calendarTools } from "@/lib/webmcp/tools/calendar";
import { budgetTools } from "@/lib/webmcp/tools/budget";
import { notesTools } from "@/lib/webmcp/tools/notes";
import { taskTools } from "@/lib/webmcp/tools/tasks";
import { useAppStore } from "@/lib/store/appStore";
import { useAgentStore } from "@/lib/store/agentStore";
import { makeId, formatINR } from "@/lib/utils";

export const allTools: AnyToolDefinition[] = [
  ...travelTools,
  ...calendarTools,
  ...budgetTools,
  ...notesTools,
  ...taskTools,
];

export function getTool(name: string): AnyToolDefinition | undefined {
  return allTools.find((t) => t.name === name);
}

/** Minimal structural validation against a tool's declared JSON schema. */
function validateInput(tool: AnyToolDefinition, input: unknown): string | null {
  const obj = (input ?? {}) as Record<string, unknown>;
  for (const key of tool.inputSchema.required ?? []) {
    if (obj[key] === undefined || obj[key] === null || obj[key] === "") {
      return `Missing required field "${key}"`;
    }
  }
  for (const [key, schema] of Object.entries(tool.inputSchema.properties)) {
    const value = obj[key];
    if (value === undefined) continue;
    if (schema.type === "number" || schema.type === "integer") {
      if (typeof value !== "number" || Number.isNaN(value)) {
        return `Field "${key}" must be a number`;
      }
    }
    if (schema.type === "string" && typeof value !== "string") {
      return `Field "${key}" must be a string`;
    }
    if (schema.enum && typeof value === "string" && !schema.enum.includes(value)) {
      return `Field "${key}" must be one of: ${schema.enum.join(", ")}`;
    }
  }
  return null;
}

interface ApprovalRelevantInput {
  flightId?: string;
  category?: string;
  amount?: number;
  label?: string;
}

function buildApprovalContent(tool: AnyToolDefinition, input: ApprovalRelevantInput) {
  if (tool.name === "confirm_flight_purchase") {
    const flight = useAppStore.getState().flights.find((f) => f.id === input.flightId);
    return {
      title: flight ? `${flight.airline} · ${flight.from} → ${flight.to}` : "Confirm flight purchase",
      description: flight
        ? `This will commit ${formatINR(flight.price)} from your travel budget and cannot be undone.`
        : "This will commit funds from your travel budget and cannot be undone.",
      financialImpact: flight?.price,
    };
  }
  if (tool.name === "record_expense") {
    return {
      title: `Record ${input.category ?? ""} expense`,
      description: `This will permanently commit ${formatINR(input.amount ?? 0)} from your budget.`,
      financialImpact: input.amount,
    };
  }
  return {
    title: tool.name,
    description: tool.description,
    financialImpact: undefined,
  };
}

const approvalResolvers = new Map<string, (approved: boolean) => void>();

/**
 * The single execution path for every tool call, regardless of whether it
 * came from a real WebMCP agent client via document.modelContext, the
 * internal demo/agent runtime, or a manual "Try tool" call from the
 * inspector. This is what keeps permission-gating, activity logging and
 * application state changes consistent everywhere.
 */
export async function invokeTool<TResult = unknown>(
  name: string,
  input: unknown
): Promise<ToolExecutionResult<TResult>> {
  const tool = getTool(name);
  const agent = useAgentStore.getState();

  if (!tool) {
    return { success: false, error: { code: "UNKNOWN_TOOL", message: `No tool named "${name}" is registered.` } };
  }

  const validationError = validateInput(tool, input);
  if (validationError) {
    return { success: false, error: { code: "INVALID_INPUT", message: validationError } };
  }

  const entryId = makeId("act");
  const startedAt = Date.now();
  const entry: ActivityEntry = {
    id: entryId,
    toolName: tool.name,
    domain: tool.domain,
    permission: tool.permission,
    input,
    status: tool.permission === "commit" ? "awaiting_approval" : "running",
    summary: tool.permission === "commit" ? "Waiting for your approval" : "Running…",
    startedAt,
  };
  agent.pushActivity(entry);

  if (tool.permission === "commit") {
    const content = buildApprovalContent(tool, input as ApprovalRelevantInput);
    const ticket: ApprovalTicket = {
      id: makeId("appr"),
      toolName: tool.name,
      input,
      title: content.title,
      description: content.description,
      financialImpact: content.financialImpact,
      createdAt: Date.now(),
      status: "pending",
    };
    agent.addApproval(ticket);

    const approved = await new Promise<boolean>((resolve) => {
      approvalResolvers.set(ticket.id, resolve);
    });

    if (!approved) {
      useAgentStore.getState().updateActivity(entryId, {
        status: "rejected",
        summary: "Rejected by you",
        finishedAt: Date.now(),
      });
      return { success: false, error: { code: "APPROVAL_REJECTED", message: "You declined this action." } };
    }
  }

  try {
    const result = await tool.execute(input);
    const summary = tool.summarize ? tool.summarize(input, result) : tool.name;
    useAgentStore.getState().updateActivity(entryId, {
      status: result.success ? "success" : "error",
      summary,
      result,
      finishedAt: Date.now(),
    });
    return result;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    useAgentStore.getState().updateActivity(entryId, {
      status: "error",
      summary: message,
      finishedAt: Date.now(),
    });
    return { success: false, error: { code: "TOOL_EXCEPTION", message } };
  }
}

/** Called by the approval modal when the human makes a decision. */
export function resolveApprovalTicket(ticketId: string, approved: boolean) {
  useAgentStore.getState().resolveApproval(ticketId, approved ? "approved" : "rejected");
  const resolver = approvalResolvers.get(ticketId);
  if (resolver) {
    resolver(approved);
    approvalResolvers.delete(ticketId);
  }
}

declare global {
  interface Document {
    modelContext?: {
      getTools: () => Promise<unknown[]>;
      executeTool: (tool: unknown, inputArguments: string) => Promise<unknown>;
      registerTool: (def: {
        name: string;
        description: string;
        inputSchema: unknown;
        execute: (input: unknown) => Promise<unknown>;
      }) => void;
    };
  }
}

/**
 * Registers every LifeOps tool with the browser's real WebMCP surface via
 * document.modelContext.registerTool, when that API is present. All calls
 * are routed through invokeTool so an external agent gets the exact same
 * permission gating and activity logging as the built-in demo agent.
 */
export function registerWebMCPTools(): boolean {
  if (typeof document === "undefined" || !document.modelContext) {
    useAgentStore.getState().setWebmcpConnected(false);
    return false;
  }
  for (const tool of allTools) {
    document.modelContext.registerTool({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
      execute: (input: unknown) => invokeTool(tool.name, input),
    });
  }
  useAgentStore.getState().setWebmcpConnected(true);
  return true;
}
