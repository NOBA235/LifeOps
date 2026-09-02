"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store/appStore";
import { invokeTool } from "@/lib/webmcp/registry";
import { Plus } from "lucide-react";

export function NotesCard() {
  const notes = useAppStore((s) => s.notes);
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setSubmitting(true);
    await invokeTool("create_note", { title: title.trim(), body: body.trim() });
    setSubmitting(false);
    setTitle("");
    setBody("");
    setOpen(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Travel notes</CardTitle>
        <Button variant="ghost" size="sm" onClick={() => setOpen((o) => !o)} className="gap-1">
          <Plus size={13} /> New note
        </Button>
      </CardHeader>
      <div>
        {notes.length === 0 ? (
          <p className="px-4 py-6 text-center text-[13px] text-slate">No notes yet.</p>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="border-b border-line px-4 py-3 last:border-b-0">
              <p className="text-[13.5px] font-medium text-ink">{note.title}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">{note.body}</p>
            </div>
          ))
        )}
      </div>
      {open && (
        <form onSubmit={handleAdd} className="space-y-2 border-t border-line p-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="focus-ring h-8 w-full rounded-[6px] border border-line-strong bg-canvas-raised px-2.5 text-[13px] text-ink"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Note"
            rows={2}
            className="focus-ring w-full resize-none rounded-[6px] border border-line-strong bg-canvas-raised px-2.5 py-1.5 text-[13px] text-ink"
          />
          <Button type="submit" size="sm" variant="outline" disabled={submitting}>
            Save note
          </Button>
        </form>
      )}
    </Card>
  );
}
