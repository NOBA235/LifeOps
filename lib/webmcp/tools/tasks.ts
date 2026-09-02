import type { ToolDefinition } from "@/lib/webmcp/types";
import type { TaskResult } from "@/lib/webmcp/resultTypes";
import { useAppStore } from "@/lib/store/appStore";
import { SEED_TASKS } from "@/lib/data/seed";

const taskIdEnum = SEED_TASKS.map((t) => t.id);

interface CreateTaskInput {
  label: string;
}

interface CompleteTaskInput {
  taskId: string;
}

export const createTask: ToolDefinition<CreateTaskInput, TaskResult> = {
  name: "create_task",
  description: "Create a new task on the trip preparation list.",
  domain: "tasks",
  permission: "prepare",
  inputSchema: {
    type: "object",
    properties: {
      label: { type: "string" },
    },
    required: ["label"],
  },
  execute: async (input) => {
    const created = useAppStore.getState().addTask(input.label);
    return { success: true, data: { task: created } };
  },
  summarize: (input) => `Created task "${input.label}"`,
};

export const completeTask: ToolDefinition<CompleteTaskInput, TaskResult> = {
  name: "complete_task",
  description: "Mark a task as complete.",
  domain: "tasks",
  permission: "prepare",
  inputSchema: {
    type: "object",
    properties: {
      taskId: { type: "string", enum: taskIdEnum },
    },
    required: ["taskId"],
  },
  execute: async (input) => {
    const updated = useAppStore.getState().completeTask(input.taskId);
    if (!updated) {
      return { success: false, error: { code: "TASK_NOT_FOUND", message: "That task does not exist." } };
    }
    return { success: true, data: { task: updated } };
  },
  summarize: (_input, result) =>
    result.success ? `Completed task "${result.data.task.label}"` : "Could not complete task",
};

export const taskTools = [createTask, completeTask];
