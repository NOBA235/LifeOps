import { PageHeader } from "@/components/layout/PageHeader";
import { ChecklistCard } from "@/components/notes/ChecklistCard";
import { NotesCard } from "@/components/notes/NotesCard";

export default function NotesPage() {
  return (
    <div>
      <PageHeader
        title="Notes"
        description="Packing checklist and itinerary notes — the agent adds to these as it prepares your trip."
      />
      <div className="grid gap-4 px-5 py-5 md:grid-cols-2 md:px-8">
        <ChecklistCard />
        <NotesCard />
      </div>
    </div>
  );
}
