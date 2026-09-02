"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { invokeTool } from "@/lib/webmcp/registry";
import type { AnyToolDefinition, ToolExecutionResult } from "@/lib/webmcp/types";
import { ChevronDown, FlaskConical, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

function permissionVariant(p: AnyToolDefinition["permission"]) {
  if (p === "read") return "read" as const;
  if (p === "prepare") return "prepare" as const;
  return "commit" as const;
}

export function ToolCard({ tool }: { tool: AnyToolDefinition }) {
  const [open, setOpen] = React.useState(false);
  const [values, setValues] = React.useState<Record<string, string>>({});
  const [running, setRunning] = React.useState(false);
  const [result, setResult] = React.useState<ToolExecutionResult | null>(null);

  const properties = Object.entries(tool.inputSchema.properties);
  const required = new Set(tool.inputSchema.required ?? []);

  async function handleTry(e: React.FormEvent) {
    e.preventDefault();
    setRunning(true);
    setResult(null);
    const input: Record<string, unknown> = {};
    for (const [key, schema] of properties) {
      const raw = values[key];
      if (raw === undefined || raw === "") continue;
      input[key] = schema.type === "number" || schema.type === "integer" ? Number(raw) : raw;
    }
    const res = await invokeTool(tool.name, input);
    setResult(res);
    setRunning(false);
  }

  return (
    <div className="border-b border-line last:border-b-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="focus-ring flex w-full items-start justify-between gap-3 px-4 py-3.5 text-left hover:bg-canvas-sunken"
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[13.5px] text-ink">{tool.name}</span>
            <Badge variant={permissionVariant(tool.permission)}>{tool.permission}</Badge>
          </div>
          <p className="mt-1 text-[13px] text-ink-soft">{tool.description}</p>
        </div>
        <ChevronDown size={15} className={cn("mt-1 shrink-0 text-slate transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="space-y-3 border-t border-line bg-canvas-sunken px-4 py-4">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1 font-mono text-[12px]">
            <span className="text-slate">field</span>
            <span className="text-slate">type</span>
            {properties.length === 0 && <span className="col-span-2 text-slate">— no input required —</span>}
            {properties.map(([key, schema]) => (
              <React.Fragment key={key}>
                <span className="text-ink-soft">
                  {key}
                  {required.has(key) && <span className="text-red">*</span>}
                </span>
                <span className="text-ink-soft">{schema.type}</span>
              </React.Fragment>
            ))}
          </div>

          <form onSubmit={handleTry} className="space-y-2">
            {properties.map(([key, schema]) => (
              <div key={key} className="flex items-center gap-2">
                <label className="w-28 shrink-0 truncate font-mono text-[11.5px] text-ink-soft">
                  {key}
                  {required.has(key) && <span className="text-red">*</span>}
                </label>
                {schema.enum ? (
                  <select
                    value={values[key] ?? ""}
                    onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                    className="focus-ring h-8 flex-1 rounded-[5px] border border-line-strong bg-canvas-raised px-2 text-[12.5px] text-ink"
                  >
                    <option value="">—</option>
                    {schema.enum.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={schema.type === "number" || schema.type === "integer" ? "number" : "text"}
                    value={values[key] ?? ""}
                    onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                    placeholder={schema.description}
                    className="focus-ring h-8 flex-1 rounded-[5px] border border-line-strong bg-canvas-raised px-2 text-[12.5px] text-ink"
                  />
                )}
              </div>
            ))}
            <Button type="submit" size="sm" variant="outline" disabled={running} className="gap-1.5">
              {running ? <Loader2 size={13} className="animate-spin" /> : <FlaskConical size={13} />}
              Try tool
            </Button>
          </form>

          {result && (
            <div>
              <div className="mb-1 font-mono text-[11px] text-slate">result</div>
              <pre className="overflow-x-auto whitespace-pre-wrap break-all rounded-[5px] border border-line bg-canvas-raised p-2.5 font-mono text-[11.5px] text-ink-soft">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
