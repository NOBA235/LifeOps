import { useAgentStore, type PlanStep } from "@/lib/store/agentStore";
import { invokeTool } from "@/lib/webmcp/registry";
import { makeId } from "@/lib/utils";
import type { AgentApiResponse } from "@/app/api/agent/route";

// Safety cap on how many model↔tool round trips a single run can take.
// This is a runaway-loop guard, not a script — the model decides every
// call within this budget.
const MAX_TURNS = 20;

interface FunctionResultForApi {
  name: string;
  callId: string;
  result: unknown;
  isError?: boolean;
}

async function callAgentApi(
  body:
    | { action: "start"; goal: string }
    | { action: "continue"; interactionId: string; functionResults: FunctionResultForApi[] }
): Promise<AgentApiResponse> {
  const res = await fetch("/api/agent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      typeof data?.error === "string" ? data.error : `Agent request failed (${res.status})`
    );
  }
  return data as AgentApiResponse;
}

/**
 * Runs a real, model-driven agent loop:
 *
 *   1. Send the goal + tool schemas to Gemini.
 *   2. Gemini decides which tool(s) to call and with what arguments.
 *   3. The browser executes each call through `invokeTool` — the same
 *      permission-gated dispatcher used everywhere else in LifeOps, so
 *      `commit`-level calls still open a real approval dialog and can be
 *      rejected.
 *   4. The result goes back to Gemini, which decides the next step.
 *   5. Repeat until Gemini stops calling tools (or the safety cap hits).
 *
 * Nothing about the sequence of steps is scripted — a different goal, or
 * a rejected approval, can genuinely change what happens next.
 */
export async function runGeminiAgent() {
  const agent = useAgentStore.getState();
  const goal = agent.goalText.trim();
  if (!goal || agent.isRunning) return;

  agent.resetAgent();
  agent.setRunning(true);

  let order = 0;

  try {
    let response = await callAgentApi({ action: "start", goal });
    let turns = 0;

    while (!response.done && turns < MAX_TURNS) {
      turns++;
      const functionResults: FunctionResultForApi[] = [];

      for (const call of response.functionCalls) {
        order += 1;
        const stepId = makeId("step");
        const step: PlanStep = {
          id: stepId,
          order,
          label: call.name,
          toolNames: [call.name],
          status: "active",
        };
        useAgentStore.getState().setPlan([...useAgentStore.getState().plan, step]);

        const result = await invokeTool(call.name, call.arguments);

        useAgentStore.getState().updateStep(stepId, {
          status: result.success ? "done" : "error",
          detail: result.success ? undefined : result.error.message,
        });

        functionResults.push({
          name: call.name,
          callId: call.id,
          result,
          isError: !result.success,
        });
      }

      response = await callAgentApi({
        action: "continue",
        interactionId: response.interactionId,
        functionResults,
      });
    }

    useAgentStore.getState().setFinalMessage(response.outputText || null);
  } catch (err) {
    const message = err instanceof Error ? err.message : "The agent hit an unexpected error.";
    useAgentStore.getState().setError(message);
  } finally {
    useAgentStore.getState().setRunning(false);
  }
}
