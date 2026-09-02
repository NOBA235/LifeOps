import { PageHeader } from "@/components/layout/PageHeader";
import { DayTimeline } from "@/components/calendar/DayTimeline";

export default function CalendarPage() {
  return (
    <div>
      <PageHeader
        title="Calendar"
        description="The agent reads this before booking anything, so it never creates a scheduling conflict."
      />
      <div className="px-5 py-5 md:px-8">
        <DayTimeline day="Friday, Sep 4" />
      </div>
    </div>
  );
}
