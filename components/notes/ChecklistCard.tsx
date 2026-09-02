"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store/appStore";
import { invokeTool } from "@/lib/webmcp/registry";
import { Plus } from "lucide-react";

export function ChecklistCard() {
  const checklist = useAppStore((s) => s.checklist);
  const toggle = useAppStore((s) => s.toggleChecklistItem);
  const [label, setLabel] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim()) return;
    setSubmitting(true);
    await invokeTool("add_checklist_item", { label: label.trim() });
    setSubmitting(false);
    setLabel("");
  }

  const checkedCount = checklist.filter((c) => c.checked).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Packing checklist</CardTitle>
        <span className="font-mono text-[12px] text-slate">{checkedCount}/{checklist.length}</span>
      </CardHeader>
      <ul>
        {checklist.map((item) => (
          <li key={item.id} className="border-b border-line last:border-b-0">
            <button
              onClick={() => toggle(item.id)}
              className="focus-ring flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-canvas-sunken"
            >
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border ${
                  item.checked ? "border-signal bg-signal" : "border-line-strong"
                }`}
              >
                {item.checked && <span className="h-1.5 w-1.5 rounded-[1px] bg-white" />}
              </span>
              <span className={`text-[13.5px] ${item.checked ? "text-slate line-through" : "text-ink"}`}>
                {item.label}
              </span>
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={handleAdd} className="flex items-center gap-2 p-3">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Add item…"
          className="focus-ring h-8 flex-1 rounded-[6px] border border-line-strong bg-canvas-raised px-2.5 text-[13px] text-ink"
        />
        <Button type="submit" size="sm" variant="outline" disabled={submitting || !label.trim()}>
          <Plus size={13} />
        </Button>
      </form>
    </Card>
  );
}
