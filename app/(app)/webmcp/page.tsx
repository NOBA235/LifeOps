import { PageHeader } from "@/components/layout/PageHeader";
import { ToolRegistryList } from "@/components/webmcp/ToolRegistryList";

export default function WebMCPPage() {
  return (
    <div>
      <PageHeader
        title="WebMCP"
        description="Every tool LifeOps exposes to agents via document.modelContext.registerTool — with real schemas you can test."
      />
      <div className="px-5 py-5 md:px-8">
        <ToolRegistryList />
      </div>
    </div>
  );
}
