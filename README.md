<div align="center">

# 🧭 LifeOps

### The web where humans and agents work together.

**An agent-native personal command center — built for the WebMCP Challenge.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?logo=typescript)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Gemini API](https://img.shields.io/badge/Agent-Gemini%20API-4285F4?logo=googlegemini&logoColor=white)](https://aistudio.google.com)
[![WebMCP](https://img.shields.io/badge/Protocol-WebMCP-6E56CF)](#why-webmcp)

</div>

---

> **"Prepare my Delhi trip for Friday. Keep everything under ₹10,000."**
>
> Give LifeOps a goal in plain language. A real Gemini-backed agent discovers
> structured tools across five mini-apps — Travel, Calendar, Budget, Notes,
> Tasks — calls them in sequence, live, and **stops to ask before doing
> anything irreversible.**

LifeOps isn't an AI that clicks around a website pretending to be human.
It's a web application built from the ground up so that **humans and AI
agents share the same tools, the same state, and the same source of truth.**

---

## 📖 Table of contents

- [What LifeOps is](#-what-lifeops-is)
- [Why WebMCP](#-why-webmcp)
- [Human + agent collaboration](#-human--agent-collaboration)
- [The agent: real tool-calling with Gemini](#-the-agent-real-tool-calling-with-gemini)
- [Architecture](#-architecture)
- [WebMCP tools](#-webmcp-tools)
- [Running locally](#-running-locally)
- [Testing WebMCP](#-testing-webmcp)
- [Running the demo](#-running-the-demo)
- [Deployment](#-deployment)
- [Project structure](#-project-structure)

---

## 🧩 What LifeOps is

Modern websites are increasingly becoming tools for AI agents — but today's
interfaces are built for humans clicking buttons. LifeOps explores the
alternative: an application that exposes its **real capabilities directly to
agents** through structured, typed tools, while a human stays firmly in
control of anything that matters.

LifeOps is five interconnected mini-apps, plus three surfaces that all read
and write the same live application state:

| Surface | What it gives you |
|---|---|
| 🧳 **Travel · Calendar · Budget · Notes · Tasks** | Five real mini-apps with genuine domain logic |
| 🤖 **Agent workspace** | Give a Gemini-backed agent a goal and watch it decide, live, which tools to call and in what order |
| 📡 **Activity panel** | A live, expandable log of every tool call, with full input/output visibility |
| 🔍 **WebMCP inspector** | Every tool actually registered by the app, with live schemas you can test by hand |

A tool call from the agent, a manual click in the Trips tab, and a manual
test from the WebMCP inspector all produce **identical, real effects** —
because they all run through the same code path.

## 🔌 Why WebMCP

A traditional browser agent has to operate a website the way a human does:
understand the UI, find a button, click it, read the resulting page, guess
whether it worked, retry when it didn't. It's slow and brittle.

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

This happens in [`lib/webmcp/registry.ts`](./lib/webmcp/registry.ts). WebMCP
is an emerging, experimental API — `document.modelContext` isn't present in
most browsers today. When it's absent, tools stay fully callable: LifeOps'
own agent calls them through the exact same `invokeTool` dispatcher, just
from the browser instead of from `document.modelContext`.

The browser's imperative execution API takes the registered tool and a JSON
string of arguments. For a tool with no inputs, use:

```js
const tool = (await document.modelContext.getTools()).find(t => t.name === "get_budget");
await document.modelContext.executeTool(tool, "{}");
```

> ⚠️ Passing `{}` directly (not as a string) causes the browser to fail while
> parsing the input arguments. `executeTool` also requires the
> `RegisteredTool` object returned by `getTools()`, not just the tool name.

## 🤝 Human + agent collaboration

The agent does not blindly execute everything. Every tool declares one of
three permission levels:

| Level | Meaning | Examples |
|---|---|---|
| 🟢 **Read** | Safe to run automatically | `search_flights`, `get_budget`, `find_free_time` |
| 🟡 **Prepare** | The agent can act, but always shows the result | `prepare_flight_booking`, `create_calendar_event` |
| 🔴 **Commit** | Irreversible or financial — always waits for a human | `confirm_flight_purchase`, `record_expense` |

Every `commit`-level call is intercepted by the central tool dispatcher
(`invokeTool` in `lib/webmcp/registry.ts`), which opens a real approval
request and **awaits the human's decision** before the underlying logic ever
runs. This is the one moment in LifeOps where the agent must stop:

> **"I can do this, but I need your approval."**

## 🌐 The agent: real tool-calling with Gemini

The agent in LifeOps is not a script — `lib/agent/geminiAgent.ts` runs an
actual model-driven loop:

1. The browser sends your goal to a server route, `app/api/agent/route.ts`.
2. That route calls the **Gemini API** (`@google/genai`, Interactions API)
   with your goal and the full set of tool schemas. Gemini genuinely decides
   which tool to call first — nothing about the order is hardcoded.
3. The browser executes that tool call through `invokeTool` — the exact same
   permission-gated dispatcher used everywhere else in the app. If it's a
   `commit`-level tool, this is where the approval dialog opens and the loop
   really does wait for you.
4. The result goes back to the server, which sends it to Gemini as a
   `function_result`. Gemini decides what to do next based on what actually
   happened — including if you rejected an approval.
5. This repeats until Gemini stops calling tools and returns a plain-text
   summary, or a safety cap (**20 turns**) is hit.

The API key never reaches the browser — `GEMINI_API_KEY` is read only in the
server route. The browser only ever sees goals, tool calls, and results.

Two runs with the same goal can genuinely play out differently, and a
rejected approval can genuinely change what the agent does next — because a
real model is making those decisions, not a fixed sequence.

## 🏗 Architecture

| Layer | Choice | Notes |
|---|---|---|
| **Framework** | Next.js 16 (App Router) + TypeScript + React 19 | |
| **Agent** | Google's Gemini API (`@google/genai`, Interactions API) | Called from `app/api/agent` — see [above](#-the-agent-real-tool-calling-with-gemini) |
| **Styling** | Tailwind CSS v4 (CSS-first theme, no config file) | Hand-rolled, shadcn-style layer (`components/ui`) built directly on Radix primitives, not the shadcn CLI |
| **Motion** | Framer Motion available | Shipped UI mostly uses lightweight CSS transitions + icon-swap for performance |
| **State** | Zustand, in two stores | `appStore.ts` — domain data, persisted to `localStorage`. `agentStore.ts` — ephemeral agent/session state, intentionally *not* persisted |
| **Fonts** | Self-hosted via `@fontsource` (IBM Plex Sans/Mono + Fraunces) | Zero runtime dependency on Google's font CDN |

### The tool registry pattern

Every tool is defined once, in `lib/webmcp/tools/*.ts`, as a plain object:

```ts
{ name, description, domain, permission, inputSchema, execute, summarize }
```

`lib/webmcp/registry.ts` combines them into `allTools` and exposes a single
dispatcher, **`invokeTool(name, input)`**, that:

1. validates the input against the tool's declared JSON schema,
2. logs a new entry to the activity feed,
3. if the tool is `commit`-level, opens an approval ticket and **awaits**
   the human's decision,
4. runs the tool's real `execute()` against the shared Zustand store,
5. records the result (success or structured error) back onto the activity
   entry.

Three very different call sites all funnel through this same function: the
real `document.modelContext.registerTool` bridge, the real Gemini-driven
agent loop (`lib/agent/geminiAgent.ts`), and the **Try tool** form on the
`/webmcp` inspector page. `lib/webmcp/geminiTools.ts` adapts the same
`allTools` list into Gemini's function-declaration format — so the model,
the browser's real WebMCP surface, and the inspector are all reading from
one source of truth that can never drift out of sync.

## 🛠 WebMCP tools

**15 tools across 5 domains.** Full live schemas are on the `/webmcp` page.

| Tool | Domain | Permission | Description |
|---|---|:---:|---|
| `search_flights` | Travel | 🟢 read | Search flights by destination, date, max price |
| `compare_flights` | Travel | 🟢 read | Compare searched flights by price or duration |
| `prepare_flight_booking` | Travel | 🟡 prepare | Prepare a booking for review; no charge yet |
| `confirm_flight_purchase` | Travel | 🔴 **commit** | Purchase the prepared flight — irreversible |
| `find_free_time` | Calendar | 🟢 read | Check availability for a day / time window |
| `create_calendar_event` | Calendar | 🟡 prepare | Create a calendar event |
| `move_calendar_event` | Calendar | 🟡 prepare | Move an event to resolve a conflict |
| `get_budget` | Budget | 🟢 read | Read allocation, items and remaining balance |
| `check_affordability` | Budget | 🟢 read | Check if an amount fits the remaining budget |
| `reserve_budget` | Budget | 🟡 prepare | Place a soft, reversible hold |
| `record_expense` | Budget | 🔴 **commit** | Permanently record a finalized expense |
| `create_note` | Notes | 🟡 prepare | Create a note (e.g. an itinerary summary) |
| `add_checklist_item` | Notes | 🟡 prepare | Add an item to the packing checklist |
| `create_task` | Tasks | 🟡 prepare | Create a trip-prep task |
| `complete_task` | Tasks | 🟡 prepare | Mark a task complete |

## 🚀 Running locally

Requires **Node.js 20+** and a [Gemini API key](https://aistudio.google.com/apikey) (free tier is enough to try this).

```bash
git clone <this-repo>
cd lifeops
npm install
cp .env.example .env.local
# then edit .env.local and set GEMINI_API_KEY=your-key-here
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app itself — all
five mini-apps, the WebMCP inspector, manual tool testing — works with **no
key at all**. You only need `GEMINI_API_KEY` to run the live agent on the
`/agent` page or via **Run agent** on the Overview page. Without it, those
buttons surface a clear error instead of silently pretending to work.

```bash
npm run lint    # ESLint — should report zero errors/warnings
npm run build   # Production build + full TypeScript check
npm run start   # Serve the production build
```

## 🔬 Testing WebMCP

LifeOps calls the real, proposed browser API:

```js
document.modelContext.registerTool(/* ... */)
```

Most browsers don't ship this yet, so by default LifeOps runs its internal
agent against the same tool functions and shows **"Running locally"** in the
top bar. If you're testing in a browser build that implements
`document.modelContext` (e.g. an experimental Chromium build with WebMCP
enabled, or an in-app browser that provides it), LifeOps detects it
automatically on load and the indicator switches to **"Connected"** — at
that point, an external agent client can discover and call every tool
listed on `/webmcp` directly.

To inspect or exercise every tool by hand, with no agent involved:

1. Open `/webmcp`.
2. Expand any tool to see its full JSON schema (fields, types, which are required).
3. Fill in the form and click **Try tool** — this calls the exact same
   `invokeTool` path a real agent would, including the approval flow for
   `commit`-level tools.

## 🎬 Running the demo

1. Make sure `GEMINI_API_KEY` is set (see above).
2. Open the app and click **Run agent** (Overview page), or go to `/agent`
   and click **Execute plan** with the default goal —
   *"Prepare my Delhi trip for Friday. Keep everything under ₹10,000."*
3. Watch **Steps taken** fill in live as Gemini decides what to call: it
   typically searches flights, checks the budget and calendar, and works out
   that the fastest option is priced above the remaining budget
   (`lib/data/seed.ts` is seeded so that's genuinely true — it's not a
   scripted number), before picking a flight that actually fits.
4. When it's ready to purchase, it calls `confirm_flight_purchase` — a
   `commit`-level tool — and a real approval dialog opens automatically.
   **Nothing proceeds until you click Approve or Reject.**
5. If you reject it, watch the agent adapt: it sees the rejection and decides
   what to do next itself, rather than failing or retrying blindly. If you
   approve, the purchase completes, the budget updates, and it typically
   wraps up the remaining trip-prep tasks.
6. Read the **Agent response** card at the end — that's Gemini's own
   plain-language summary of what it did, not a canned string.

Because a real model is choosing every step, the exact path can vary between
runs — that's the point. What's fixed is the underlying data
(`lib/data/seed.ts`) and the guarantee that a `commit`-level tool always
stops for your approval, regardless of what the model decides.

Use **Reset demo data** in the sidebar to restore the seed state and run it
again.

## ☁️ Deployment

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

## 📁 Project structure

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

---

<div align="center">

**LifeOps** — built for the WebMCP Challenge.
*A web where humans click, and agents call the same tools — together.*

</div>