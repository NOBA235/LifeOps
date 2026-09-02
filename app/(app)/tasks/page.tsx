import { PageHeader } from "@/components/layout/PageHeader";
import { TaskList } from "@/components/tasks/TaskList";

export default function TasksPage() {
  return (
    <div>
      <PageHeader
        title="Tasks"
        description="Lightweight trip-prep tasks. The agent completes these as it finishes each step."
      />
      <div className="px-5 py-5 md:px-8">
        <div className="max-w-lg">
          <TaskList />
        </div>
      </div>
    </div>
  );
}
