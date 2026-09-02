// Core WebMCP contract used across the app. This is the single vocabulary
// shared by: the tools themselves, the WebMCP registration bridge
// (document.modelContext.registerTool), the agent plan engine, and the
// /webmcp inspector page — so the inspector can never drift from what is
// actually registered.

export type PermissionLevel = "read" | "prepare" | "commit";

export type JSONSchemaType = "string" | "number" | "boolean" | "integer";

export interface JSONSchemaProperty {
  type: JSONSchemaType;
  description?: string;
  enum?: string[];
}

export interface ToolInputSchema {
  type: "object";
  properties: Record<string, JSONSchemaProperty>;
  required?: string[];
}

export interface ToolError {
  code: string;
  message: string;
}

export type ToolExecutionResult<TResult = unknown> =
  | { success: true; data: TResult }
  | { success: false; error: ToolError };

export interface ToolDefinition<TInput = unknown, TResult = unknown> {
  name: string;
  description: string;
  domain: "travel" | "calendar" | "budget" | "notes" | "tasks";
  permission: PermissionLevel;
  inputSchema: ToolInputSchema;
  /** Human-readable one-liner used by the agent plan/activity feed. */
  summarize?: (input: TInput, result: ToolExecutionResult<TResult>) => string;
  execute: (input: TInput) => Promise<ToolExecutionResult<TResult>> | ToolExecutionResult<TResult>;
}

/**
 * The registry stores tools with many different, mutually-incompatible
 * input/result shapes side by side. This alias is the single, deliberate
 * type-erasure boundary that makes that possible — every other file works
 * with fully-typed ToolDefinition<Input, Result> generics.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyToolDefinition = ToolDefinition<any, any>;

export type ActivityStatus =
  | "running"
  | "success"
  | "error"
  | "awaiting_approval"
  | "rejected";

export interface ActivityEntry {
  id: string;
  toolName: string;
  domain: ToolDefinition["domain"];
  permission: PermissionLevel;
  input: unknown;
  result?: ToolExecutionResult;
  status: ActivityStatus;
  summary: string;
  startedAt: number;
  finishedAt?: number;
}

export interface ApprovalTicket {
  id: string;
  toolName: string;
  input: unknown;
  title: string;
  description: string;
  financialImpact?: number;
  createdAt: number;
  status: "pending" | "approved" | "rejected";
}
