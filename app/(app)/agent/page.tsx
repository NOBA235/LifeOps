import { PageHeader } from "@/components/layout/PageHeader";
import { AgentWorkspace } from "@/components/agent/AgentWorkspace";

export default function AgentPage() {
  return (
    <div>
      <PageHeader
        title="Agent workspace"
        description="Give the agent a goal in plain language. It builds a plan, calls real WebMCP tools, and stops before anything irreversible."
      />
      <AgentWorkspace />
    </div>
  );
}
