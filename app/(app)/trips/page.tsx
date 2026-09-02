import { PageHeader } from "@/components/layout/PageHeader";
import { TripHeader } from "@/components/travel/TripHeader";
import { FlightList } from "@/components/travel/FlightList";

export default function TripsPage() {
  return (
    <div>
      <PageHeader
        title="Trips"
        description="Search, compare and book flights. Selecting an option calls the same WebMCP tools the agent uses."
      />
      <TripHeader />
      <div className="px-5 py-5 md:px-8">
        <FlightList />
      </div>
    </div>
  );
}
