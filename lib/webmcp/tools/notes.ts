import type { ToolDefinition } from "@/lib/webmcp/types";
import type { NoteResult, ChecklistItemResult } from "@/lib/webmcp/resultTypes";
import { useAppStore } from "@/lib/store/appStore";

interface CreateNoteInput {
  title: string;
  body: string;
}

interface AddChecklistItemInput {
  label: string;
}

export const createNote: ToolDefinition<CreateNoteInput, NoteResult> = {
  name: "create_note",
  description: "Create a new note, such as a trip itinerary summary.",
  domain: "notes",
  permission: "prepare",
  inputSchema: {
    type: "object",
    properties: {
      title: { type: "string" },
      body: { type: "string" },
    },
    required: ["title", "body"],
  },
  execute: async (input) => {
    const created = useAppStore.getState().addNote(input);
    return { success: true, data: { note: created } };
  },
  summarize: (input) => `Created note "${input.title}"`,
};

export const addChecklistItem: ToolDefinition<AddChecklistItemInput, ChecklistItemResult> = {
  name: "add_checklist_item",
  description: "Add an item to the packing checklist.",
  domain: "notes",
  permission: "prepare",
  inputSchema: {
    type: "object",
    properties: {
      label: { type: "string" },
    },
    required: ["label"],
  },
  execute: async (input) => {
    const created = useAppStore.getState().addChecklistItem(input.label);
    return { success: true, data: { item: created } };
  },
  summarize: (input) => `Added "${input.label}" to packing checklist`,
};

export const notesTools = [createNote, addChecklistItem];
