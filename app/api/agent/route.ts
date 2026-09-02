import { NextResponse } from "next/server";
import { GoogleGenAI, type Interactions } from "@google/genai";
import { getGeminiToolDeclarations, buildSystemInstruction } from "@/lib/webmcp/geminiTools";

// This route is the ONLY place LifeOps talks to Gemini, and the only place
// that ever sees the API key. It never touches application state directly —
// it just decides, via a real model, which tool should be called next. The
// browser executes that tool call (through the exact same permission-gated
// `invokeTool` used everywhere else) and reports the result back here.
export const runtime = "nodejs";

const MODEL = process.env.GEMINI_MODEL || "gemini-3.7-flash";
const MAX_OUTPUT_STEPS = 20;

interface FunctionResultInput {
  name: string;
  callId: string;
  result: unknown;
  isError?: boolean;
}

interface StartBody {
  action: "start";
  goal: string;
}

interface ContinueBody {
  action: "continue";
  interactionId: string;
  functionResults: FunctionResultInput[];
}

type AgentRequestBody = StartBody | ContinueBody;

export interface AgentApiResponse {
  interactionId: string;
  outputText: string;
  functionCalls: { id: string; name: string; arguments: Record<string, unknown> }[];
  done: boolean;
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "GEMINI_API_KEY is not set on the server. Add it to .env.local (see .env.example) and restart the dev server.",
      },
      { status: 500 }
    );
  }

  let body: AgentRequestBody;
  try {
    body = (await request.json()) as AgentRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const ai = new GoogleGenAI({ apiKey });
  const tools = getGeminiToolDeclarations();

  try {
    const interaction =
      body.action === "start"
        ? await ai.interactions.create({
            model: MODEL,
            system_instruction: buildSystemInstruction(),
            input: body.goal,
            tools,
          })
        : await ai.interactions.create({
            model: MODEL,
            previous_interaction_id: body.interactionId,
            tools,
            input: body.functionResults.map(
              (r): Interactions.FunctionResultStep => ({
                type: "function_result",
                name: r.name,
                call_id: r.callId,
                is_error: r.isError,
                result: [{ type: "text", text: JSON.stringify(r.result) }],
              })
            ),
          });

    const functionCalls = interaction.steps
      .filter((step): step is Interactions.FunctionCallStep => step.type === "function_call")
      .map((step) => ({ id: step.id, name: step.name, arguments: step.arguments }));

    const response: AgentApiResponse = {
      interactionId: interaction.id,
      outputText: interaction.output_text ?? "",
      functionCalls,
      done: functionCalls.length === 0,
    };

    return NextResponse.json(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error calling Gemini.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export function GET() {
  return NextResponse.json(
    {
      ok: true,
      model: MODEL,
      maxSteps: MAX_OUTPUT_STEPS,
      configured: Boolean(process.env.GEMINI_API_KEY),
    },
    { status: 200 }
  );
}
