import type { ToolDefinition } from "@/lib/webmcp/types";
import type { FindFreeTimeResult, CalendarEventResult } from "@/lib/webmcp/resultTypes";
import { useAppStore } from "@/lib/store/appStore";
import { SEED_CALENDAR } from "@/lib/data/seed";
import type { CalendarEvent } from "@/lib/data/types";

const movableEventIdEnum = SEED_CALENDAR.filter((e) => e.movable).map((e) => e.id);

function toMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

interface FindFreeTimeInput {
  day: string;
  windowStart?: string;
  windowEnd?: string;
}

interface CreateEventInput {
  day: string;
  time: string;
  endTime?: string;
  title: string;
  kind?: CalendarEvent["kind"];
}

interface MoveEventInput {
  eventId: string;
  time: string;
  endTime?: string;
}

export const findFreeTime: ToolDefinition<FindFreeTimeInput, FindFreeTimeResult> = {
  name: "find_free_time",
  description:
    "Check calendar availability for a day, optionally against a specific time window, to avoid scheduling conflicts.",
  domain: "calendar",
  permission: "read",
  inputSchema: {
    type: "object",
    properties: {
      day: { type: "string", description: "e.g. Friday, Sep 4" },
      windowStart: { type: "string", description: "e.g. 09:20" },
      windowEnd: { type: "string", description: "e.g. 12:10" },
    },
    required: ["day"],
  },
  execute: async (input) => {
    const events = useAppStore.getState().calendarEvents.filter((e) => e.day === input.day);
    if (input.windowStart && input.windowEnd) {
      const ws = toMinutes(input.windowStart);
      const we = toMinutes(input.windowEnd);
      const conflicts = events.filter((e) => {
        const es = toMinutes(e.time);
        const ee = e.endTime ? toMinutes(e.endTime) : es + 30;
        return e.kind !== "free" && es < we && ee > ws;
      });
      return { success: true, data: { day: input.day, free: conflicts.length === 0, conflicts } };
    }
    return { success: true, data: { day: input.day, events } };
  },
  summarize: (input, result) => {
    if (!result.success) return "Could not read calendar";
    const data = result.data;
    if ("free" in data) {
      return data.free
        ? `${input.day} is free for the requested window`
        : `${data.conflicts.length} conflict(s) found on ${input.day}`;
    }
    return `Checked ${input.day} — ${data.events.length} event(s)`;
  },
};

export const createCalendarEvent: ToolDefinition<CreateEventInput, CalendarEventResult> = {
  name: "create_calendar_event",
  description: "Create a new calendar event, such as an arrival or hotel check-in block.",
  domain: "calendar",
  permission: "prepare",
  inputSchema: {
    type: "object",
    properties: {
      day: { type: "string" },
      time: { type: "string" },
      endTime: { type: "string" },
      title: { type: "string" },
      kind: {
        type: "string",
        enum: ["flight", "arrival", "hotel", "meeting", "free", "other"],
      },
    },
    required: ["day", "time", "title"],
  },
  execute: async (input) => {
    const created = useAppStore.getState().addCalendarEvent({
      day: input.day,
      time: input.time,
      endTime: input.endTime,
      title: input.title,
      kind: (input.kind as CalendarEvent["kind"]) ?? "other",
      movable: true,
    });
    return { success: true, data: { event: created } };
  },
  summarize: (input) => `Added "${input.title}" to ${input.day} at ${input.time}`,
};

export const moveCalendarEvent: ToolDefinition<MoveEventInput, CalendarEventResult> = {
  name: "move_calendar_event",
  description: "Move an existing calendar event to a new time to resolve a scheduling conflict.",
  domain: "calendar",
  permission: "prepare",
  inputSchema: {
    type: "object",
    properties: {
      eventId: { type: "string", enum: movableEventIdEnum },
      time: { type: "string" },
      endTime: { type: "string" },
    },
    required: ["eventId", "time"],
  },
  execute: async (input) => {
    const moved = useAppStore.getState().moveCalendarEvent(input.eventId, input.time, input.endTime);
    if (!moved) {
      return { success: false, error: { code: "EVENT_NOT_FOUND", message: "That event does not exist." } };
    }
    return { success: true, data: { event: moved } };
  },
  summarize: (input, result) =>
    result.success ? `Moved "${result.data.event.title}" to ${input.time}` : "Could not move that event",
};

export const calendarTools = [findFreeTime, createCalendarEvent, moveCalendarEvent];
