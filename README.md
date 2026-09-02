# LifeOps

**The web where humans and agents work together.**

LifeOps is an agent-native personal command center built for the WebMCP
Challenge. Give it a goal in plain language —

> "Prepare my Delhi trip for Friday. Keep everything under ₹10,000."

— and an agent discovers structured tools across five mini-apps (Travel,
Calendar, Budget, Notes, Tasks), calls them in sequence, and stops to ask
before doing anything irreversible.

LifeOps isn't an AI that uses websites. It's a web application designed
from the beginning for humans and AI agents to work together.

---

## Table of contents

1. [What LifeOps is](#what-lifeops-is)
2. [Why WebMCP](#why-webmcp)
3. [Human + agent collaboration](#human--agent-collaboration)
4. [Architecture](#architecture)
5. [WebMCP tools](#webmcp-tools)
6. [Running locally](#running-locally)
7. [Testing WebMCP](#testing-webmcp)
8. [Running the demo](#running-the-demo)
9. [Deployment](#deployment)
10. [Project structure](#project-structure)

---

## What LifeOps is

Modern websites are increasingly becoming tools for AI agents, but today's
interfaces are built for humans clicking buttons. LifeOps explores the
alternative: a web application that exposes its real capabilities directly
to agents through structured, typed tools — while a human stays in control
of anything that matters.

LifeOps contains five interconnected mini-apps — **Travel**, **Calendar**,
**Budget**, **Notes**, and **Tasks** — plus:

- an **Agent workspace**, where you give a real Gemini-backed agent a goal
  and watch it decide, live, which tools to call and in what order;
- an **Activity panel**, a live, expandable log of every tool call the agent
  makes, with full input/output visibility;
- a **WebMCP inspector**, listing every tool actually registered by the app,
  with live schemas you can test by hand.

Every one of these surfaces reads from the same application state, so a
tool call from the agent, a manual click in the Trips tab, and a manual
test from the WebMCP inspector all produce identical, real effects.

## Why WebMCP

A traditional browser agent has to operate a website the way a human does:
understand the UI, find a button, click it, read the resulting page, guess
whether it worked, and retry when it didn't. It's slow and brittle.

**WebMCP** lets an application expose its capabilities directly:

```
Traditional agent                  WebMCP
──────────────────                 ──────────────────────────
Understand UI                      Discover structured tool
Find button                        Validate input
Click                              Execute action
Read page                          Receive structured result
Guess
Retry
```

LifeOps registers every tool with the browser's real WebMCP surface via:

```js
document.modelContext.registerTool({
  name: "search_flights",
  description: "...",
  inputSchema: { /* JSON schema */ },
  execute: async (input) => { /* real application logic */ },
});
```

This happens in [`lib/webmcp/registry.ts`](./lib/webmcp/registry.ts). If
`document.modelContext` isn't present in the current browser (true for most
browsers today — WebMCP is an emerging, experimental API), tools are still
fully callable — LifeOps' own agent (see below) calls them through the exact
same `invokeTool` dispatcher, just from the browser instead of from
`document.modelContext`.

The browser's imperative execution API takes the registered tool and a JSON
string of arguments. For a tool with no inputs, use:

```js
const tool = (await document.modelContext.getTools()).find((t) => t.name === "get_budget");
await document.modelContext.executeTool(tool, "{}");
```

Passing `{}` directly causes the browser to fail while parsing the input
arguments. `executeTool` also requires the `RegisteredTool` object returned by
`getTools()`, not the tool name.

## Human + agent collaboration

The agent does not blindly execute everything. Every tool declares one of
three permission levels:

| Level | Meaning | Examples |
|---|---|---|
| **Read** | Safe to run automatically | `search_flights`, `get_budget`, `find_free_time` |
| **Prepare** | The agent can act, but always shows the result | `prepare_flight_booking`, `create_calendar_event` |
| **Commit** | Irreversible or financial — always waits for a human | `confirm_flight_purchase`, `record_expense` |

Every `commit`-level call is intercepted by the central tool dispatcher
(`invokeTool` in `lib/webmcp/registry.ts`), which opens a real approval
request and **awaits the human's decision** before the underlying logic
ever runs. This is the one moment in LifeOps where the agent must stop:

> "I can do this, but I need your approval."

## The agent: real tool-calling with Gemini

The agent in LifeOps is not a script. `lib/agent/geminiAgent.ts` runs an
actual model-driven loop:

1. The browser sends your goal to a server route, `app/api/agent/route.ts`.
2. That route calls the **Gemini API** (`@google/genai`, using the
   Interactions API) with your goal and the full set of tool schemas.
   Gemini decides which tool to call first, genuinely — nothing about the
   order is hardcoded.
3. The browser executes that tool call through `invokeTool` — the exact
   same permission-gated dispatcher used everywhere else in the app. If
   it's a `commit`-level tool, this is where the approval dialog opens and
   the loop really does wait for you.
4. The result goes back to the server, which sends it to Gemini as a
   `function_result`. Gemini decides what to do next based on what
   actually happened — including if you rejected an approval.
5. This repeats until Gemini stops calling tools and returns a plain-text
   summary, or a safety cap (20 turns) is hit.

The API key never reaches the browser — `GEMINI_API_KEY` is read only in
the server route. The browser only ever sees goals, tool calls, and
results.

This means two runs with the same goal can genuinely play out differently,
and a rejected approval can genuinely change what the agent does next —
because a real model is making those decisions, not a fixed sequence.

## Architecture

- **Framework:** Next.js 16 (App Router) + TypeScript + React 19
- **Agent:** Google's Gemini API (`@google/genai`, Interactions API) called
  from a server route (`app/api/agent`); see [The agent](#the-agent-real-tool-calling-with-gemini) above
- **Styling:** Tailwind CSS v4 (CSS-first theme, no config file) with a
  hand-rolled, shadcn-style component layer (`components/ui`) — built
  directly on Radix primitives rather than the shadcn CLI, since the CLI's
  registry isn't reachable from every build environment
- **Motion:** Framer Motion is available; most state-change animation in
  the shipped UI uses lightweight CSS transitions plus icon-swap for
  performance, with Framer Motion ready for richer transitions
- **State:** Zustand, split into two stores:
  - `lib/store/appStore.ts` — the actual domain data (trip, flights,
    budget, calendar, notes, tasks). Persisted to `localStorage` so the
    app survives a refresh.
  - `lib/store/agentStore.ts` — ephemeral agent/session state (the current
    run's steps, the activity log, pending approvals). Intentionally
    **not** persisted, so every session starts clean.
- **Fonts:** self-hosted via `@fontsource` (IBM Plex Sans/Mono + Fraunces)
  rather than `next/font/google`, so the app builds and renders with zero
  runtime dependency on Google's font CDN.

### The tool registry pattern

Every tool is defined once, in `lib/webmcp/tools/*.ts`, as a plain object:
`{ name, description, domain, permission, inputSchema, execute, summarize }`.
`lib/webmcp/registry.ts` combines them into `allTools` and exposes a single
dispatcher, `invokeTool(name, input)`, that:

1. validates the input against the tool's declared JSON schema,
2. logs a new entry to the activity feed,
3. if the tool is `commit`-level, opens an approval ticket and **awaits**
   the human's decision,
4. runs the tool's real `execute()` against the shared Zustand store,
5. records the result (success or structured error) back onto the activity
   entry.

Three very different call sites all funnel through this same function: the
real `document.modelContext.registerTool` bridge, the real Gemini-driven
agent loop (`lib/agent/geminiAgent.ts`), and the "Try tool" form on the
`/webmcp` inspector page. `lib/webmcp/geminiTools.ts` adapts the same
`allTools` list into Gemini's function-declaration format, so the model,
the browser's real WebMCP surface, and the inspector are all reading from
one source of truth that can never drift out of sync.

## WebMCP tools

15 tools across 5 domains. Full live schemas are on the `/webmcp` page.

| Tool | Domain | Permission | Description |
|---|---|---|---|
| `search_flights` | Travel | read | Search flights by destination, date, max price |
| `compare_flights` | Travel | read | Compare searched flights by price or duration |
| `prepare_flight_booking` | Travel | prepare | Prepare a booking for review; no charge yet |
| `confirm_flight_purchase` | Travel | **commit** | Purchase the prepared flight — irreversible |
| `find_free_time` | Calendar | read | Check availability for a day / time window |
| `create_calendar_event` | Calendar | prepare | Create a calendar event |
| `move_calendar_event` | Calendar | prepare | Move an event to resolve a conflict |
| `get_budget` | Budget | read | Read allocation, items and remaining balance |
| `check_affordability` | Budget | read | Check if an amount fits the remaining budget |
| `reserve_budget` | Budget | prepare | Place a soft, reversible hold |
| `record_expense` | Budget | **commit** | Permanently record a finalized expense |
| `create_note` | Notes | prepare | Create a note (e.g. an itinerary summary) |
| `add_checklist_item` | Notes | prepare | Add an item to the packing checklist |
| `create_task` | Tasks | prepare | Create a trip-prep task |
| `complete_task` | Tasks | prepare | Mark a task complete |

## Running locally

Requires Node.js 20+ and a [Gemini API key](https://aistudio.google.com/apikey)
(free tier is enough to try this).

```bash
git clone <this-repo>
cd lifeops
npm install
cp .env.example .env.local
# then edit .env.local and set GEMINI_API_KEY=your-key-here
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app itself (all
five mini-apps, the WebMCP inspector, manual tool testing) works with no
key at all — you only need `GEMINI_API_KEY` to run the live agent on the
`/agent` page or via **Run agent** on the Overview page. Without it, those
buttons will surface a clear error instead of silently pretending to work.

Other useful scripts:

```bash
npm run lint    # ESLint — should report zero errors/warnings
npm run build   # Production build + full TypeScript check
npm run start   # Serve the production build
```

## Testing WebMCP

LifeOps calls the real, proposed browser API:

```js
document.modelContext.registerTool(/* ... */)
```

Most browsers don't ship this yet, so by default LifeOps runs its
internal agent against the same tool functions and shows **"Running
locally"** in the top bar. If you're testing in a browser or browser
build that implements `document.modelContext` (for example an
experimental Chromium build with WebMCP enabled, or an in-app browser
that provides it), LifeOps will detect it automatically on load and the
indicator switches to **"Connected"** — at that point, an external agent
client can discover and call every tool listed on `/webmcp` directly.

To inspect or manually exercise every tool without any agent at all:

1. Open `/webmcp`.
2. Expand any tool to see its full JSON schema (fields, types, which are
   required).
3. Fill in the form and click **Try tool** — this calls the exact same
   `invokeTool` path a real agent would, including the approval flow for
   `commit`-level tools.

## Running the demo

1. Make sure `GEMINI_API_KEY` is set (see above).
2. Open the app and click **Run agent** (on the Overview page) or go to
   `/agent` and click **Execute plan** with the default goal —
   *"Prepare my Delhi trip for Friday. Keep everything under ₹10,000."*
3. Watch **Steps taken** fill in live as Gemini decides what to call: it
   typically searches flights, checks the budget and calendar, and works
   out that the fastest option is priced above the remaining budget
   (`lib/data/seed.ts` is seeded so that's genuinely true — it's not a
   scripted number), before picking a flight that actually fits.
4. When it's ready to purchase, it calls `confirm_flight_purchase` — a
   `commit`-level tool — and a real approval dialog opens automatically.
   **Nothing proceeds until you click Approve or Reject.**
5. If you reject it, watch the agent adapt: it sees the rejection and
   decides what to do next itself, rather than failing or retrying blindly.
   If you approve, the purchase completes, the budget updates, and it
   typically wraps up the remaining trip-prep tasks.
6. Read the **Agent response** card at the end — that's Gemini's own
   plain-language summary of what it did, not a canned string.

Because a real model is choosing every step, the exact path can vary
between runs — that's the point. What's fixed is the underlying data
(`lib/data/seed.ts`) and the guarantee that a `commit`-level tool always
stops for your approval, regardless of what the model decides.

Use **Reset demo data** in the sidebar to restore the seed state and run
it again.

## Deployment

LifeOps deploys anywhere Next.js does. The one thing you must configure on
your host is `GEMINI_API_KEY` (server-side only — never exposed to the
browser):

```bash
npm run build
npm run start
```

**Vercel:** push this repo to GitHub, import it at
[vercel.com/new](https://vercel.com/new), and add `GEMINI_API_KEY` (and
optionally `GEMINI_MODEL`) under Project Settings → Environment Variables.
**Any other host:** run `npm run build` and serve with `npm run start`,
making sure `GEMINI_API_KEY` is set in that environment.

## Project structure

```
app/
  page.tsx                 marketing landing page
  api/agent/route.ts       server route that talks to Gemini (holds the API key)
  (app)/                   the actual product, behind a shared shell
    layout.tsx
    overview/  agent/  trips/  calendar/  budget/  notes/  tasks/  webmcp/
components/
  ui/                      hand-rolled shadcn-style primitives
  layout/                  app shell, sidebar, top bar, page header
  agent/                   agent workspace, steps-taken list, activity, approval modal
  travel/ calendar/ budget/ notes/ tasks/   per-domain UI
  webmcp/                  tool registry inspector
  marketing/               landing page sections
lib/
  webmcp/                  tool definitions, shared types, the registry, the Gemini tool adapter
  agent/                   the real Gemini tool-calling loop + reasoning helpers
  store/                   Zustand stores (persisted app data + ephemeral agent state)
  data/                    seed data and domain types
```
