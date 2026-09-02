"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store/appStore";
import { invokeTool } from "@/lib/webmcp/registry";
import { CheckCircle2, Circle, Plus, Loader2 } from "lucide-react";

export function TaskList() {
  const tasks = useAppStore((s) => s.tasks);
  const [label, setLabel] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [completingId, setCompletingId] = React.useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim()) return;
    setSubmitting(true);
    await invokeTool("create_task", { label: label.trim() });
    setSubmitting(false);
    setLabel("");
  }

  async function handleComplete(id: string) {
    setCompletingId(id);
    await invokeTool("complete_task", { taskId: id });
    setCompletingId(null);
  }

  const doneCount = tasks.filter((t) => t.done).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trip preparation</CardTitle>
        <span className="font-mono text-[12px] text-slate">{doneCount}/{tasks.length}</span>
      </CardHeader>
      <ul>
        {tasks.map((task) => (
          <li key={task.id} className="flex items-center gap-3 border-b border-line px-4 py-2.5 last:border-b-0">
            <button
              onClick={() => !task.done && handleComplete(task.id)}
              disabled={task.done || completingId === task.id}
              className="focus-ring flex items-center gap-3 disabled:cursor-default"
            >
              {completingId === task.id ? (
                <Loader2 size={16} className="animate-spin text-signal" />
              ) : task.done ? (
                <CheckCircle2 size={16} className="text-green" />
              ) : (
                <Circle size={16} className="text-line-strong" />
              )}
            </button>
            <span className={`text-[13.5px] ${task.done ? "text-slate line-through" : "text-ink"}`}>
              {task.label}
            </span>
          </li>
        ))}
      </ul>
      <form onSubmit={handleAdd} className="flex items-center gap-2 p-3">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Add task…"
          className="focus-ring h-8 flex-1 rounded-[6px] border border-line-strong bg-canvas-raised px-2.5 text-[13px] text-ink"
        />
        <Button type="submit" size="sm" variant="outline" disabled={submitting || !label.trim()}>
          <Plus size={13} />
        </Button>
      </form>
    </Card>
  );
}
