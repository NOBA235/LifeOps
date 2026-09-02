// Adapts LifeOps' WebMCP tool registry into Gemini function declarations.
// Our inputSchema is already plain JSON Schema, so this is a thin, direct
// mapping — the same tool definitions power document.modelContext,
// the WebMCP inspector, and the real Gemini agent, with nothing redefined
// three times.
import type { Interactions } from "@google/genai";
import { allTools } from "@/lib/webmcp/registry";
import type { PermissionLevel } from "@/lib/webmcp/types";

export function getGeminiToolDeclarations(): Interactions.Function[] {
  return allTools.map((tool) => ({
    type: "function",
    name: tool.name,
    description: tool.description,
    parameters: tool.inputSchema,
  }));
}

/**
 * A system instruction built directly from the live tool registry, so the
 * policy text can never fall out of sync with which tools actually exist
 * or what permission level they carry.
 */
export function buildSystemInstruction(): string {
  const byPermission: Record<PermissionLevel, string[]> = { read: [], prepare: [], commit: [] };
  for (const tool of allTools) byPermission[tool.permission].push(tool.name);

  return [
    "You are the LifeOps agent. You help a person accomplish a real goal — right now, preparing a trip — by calling the tools made available to you. You are a genuine reasoning agent: decide which tool to call next yourself, based on the results of previous calls. Nothing about the plan is scripted for you.",
    "",
    "Every tool has one of three permission levels:",
    `- read (safe, call freely to gather information): ${byPermission.read.join(", ")}`,
    `- prepare (you may call these directly; they stage or show a result but do not finalize anything): ${byPermission.prepare.join(", ")}`,
    `- commit (irreversible or financial): ${byPermission.commit.join(", ")}. Calling one of these pauses the app and asks a real human to approve or reject it before it runs. The human may reject it.`,
    "",
    "Guidelines:",
    "- Gather the information you need with read tools before deciding anything.",
    "- Use prepare tools to stage actions and check their results.",
    "- Only call a commit tool when you are genuinely ready to finalize that specific action, since it will interrupt the person and ask them to approve it.",
    "- If a commit tool comes back rejected, do not simply retry the same call — adapt your plan (for example, look for a cheaper option, or stop and explain the situation).",
    "- Ground every tool argument in real data you were actually given — never invent flight IDs, prices, event IDs, or times that weren't returned by an earlier tool call.",
    "- When the goal is accomplished, or you hit a limitation you can't resolve, stop calling tools and reply with a short, plain-language summary of what happened and why.",
  ].join("\n");
}
