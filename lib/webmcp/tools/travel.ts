import type { ToolDefinition } from "@/lib/webmcp/types";
import type {
  SearchFlightsResult,
  CompareFlightsResult,
  PrepareBookingResult,
  ConfirmPurchaseResult,
} from "@/lib/webmcp/resultTypes";
import { useAppStore } from "@/lib/store/appStore";
import { useAgentStore } from "@/lib/store/agentStore";
import { SEED_FLIGHTS } from "@/lib/data/seed";
import { checkAffordability } from "@/lib/agent/reasoning";
import { formatINR } from "@/lib/utils";

const flightIdEnum = SEED_FLIGHTS.map((f) => f.id);

interface SearchFlightsInput {
  destination: string;
  date: string;
  maxPrice?: number;
}

interface CompareFlightsInput {
  sortBy?: "price" | "duration";
}

interface FlightIdInput {
  flightId: string;
}

export const searchFlights: ToolDefinition<SearchFlightsInput, SearchFlightsResult> = {
  name: "search_flights",
  description: "Search available flights using destination, date and an optional maximum price.",
  domain: "travel",
  permission: "read",
  inputSchema: {
    type: "object",
    properties: {
      destination: { type: "string", description: "Arrival city, e.g. Delhi" },
      date: { type: "string", description: "Travel date, e.g. 2026-09-04" },
      maxPrice: { type: "number", description: "Maximum price in INR" },
    },
    required: ["destination", "date"],
  },
  execute: async (input) => {
    const { flights } = useAppStore.getState();
    const results = input.maxPrice
      ? flights.filter((f) => f.price <= input.maxPrice!)
      : flights;
    return { success: true, data: { count: results.length, flights: results } };
  },
  summarize: (input, result) =>
    result.success ? `Found ${result.data.count} flights to ${input.destination}` : "Flight search failed",
};

export const compareFlights: ToolDefinition<CompareFlightsInput, CompareFlightsResult> = {
  name: "compare_flights",
  description: "Compare searched flights by price or duration to support a selection decision.",
  domain: "travel",
  permission: "read",
  inputSchema: {
    type: "object",
    properties: {
      sortBy: { type: "string", enum: ["price", "duration"], description: "Sort key" },
    },
  },
  execute: async (input) => {
    const { flights, trip, budgetItems } = useAppStore.getState();
    const key = input?.sortBy === "duration" ? "durationMinutes" : "price";
    const sorted = [...flights].sort((a, b) => a[key] - b[key]);
    const withAffordability = sorted.map((f) => ({
      ...f,
      ...checkAffordability(f.price, trip.budgetCap, budgetItems),
    }));
    return { success: true, data: { sortedBy: key, flights: withAffordability } };
  },
  summarize: (input) => `Compared flights by ${input?.sortBy ?? "price"}`,
};

export const prepareFlightBooking: ToolDefinition<FlightIdInput, PrepareBookingResult> = {
  name: "prepare_flight_booking",
  description:
    "Prepare a flight booking for review. Shows the full booking result but does not charge the budget or purchase anything.",
  domain: "travel",
  permission: "prepare",
  inputSchema: {
    type: "object",
    properties: {
      flightId: { type: "string", enum: flightIdEnum, description: "Flight to prepare for booking" },
    },
    required: ["flightId"],
  },
  execute: async (input) => {
    const { flights, trip, budgetItems } = useAppStore.getState();
    const flight = flights.find((f) => f.id === input.flightId);
    if (!flight) {
      return { success: false, error: { code: "FLIGHT_NOT_FOUND", message: "That flight no longer exists in search results." } };
    }
    const affordability = checkAffordability(flight.price, trip.budgetCap, budgetItems);
    if (!affordability.affordable) {
      useAgentStore.getState().setBudgetAlert({
        flightLabel: `${flight.airline} · ${flight.from} → ${flight.to}`,
        price: flight.price,
        exceedBy: affordability.exceedBy,
      });
      return {
        success: false,
        error: {
          code: "BUDGET_EXCEEDED",
          message: `This option would exceed your ₹${trip.budgetCap.toLocaleString("en-IN")} travel budget by ${formatINR(affordability.exceedBy)}.`,
        },
      };
    }
    useAppStore.getState().selectFlight(flight.id);
    useAppStore.getState().setBookingStatus("prepared");
    return { success: true, data: { flight, remainingAfter: affordability.remainingBeforeFlight - flight.price } };
  },
  summarize: (_input, result) =>
    result.success
      ? `Prepared booking for ${result.data.flight.airline} · ${formatINR(result.data.flight.price)}`
      : `Could not prepare booking: ${result.error.message}`,
};

export const confirmFlightPurchase: ToolDefinition<FlightIdInput, ConfirmPurchaseResult> = {
  name: "confirm_flight_purchase",
  description:
    "Purchase the prepared flight booking. This is irreversible and commits funds from the travel budget — always requires human approval.",
  domain: "travel",
  permission: "commit",
  inputSchema: {
    type: "object",
    properties: {
      flightId: { type: "string", enum: flightIdEnum, description: "Flight to purchase" },
    },
    required: ["flightId"],
  },
  execute: async (input) => {
    const store = useAppStore.getState();
    const flight = store.flights.find((f) => f.id === input.flightId);
    if (!flight) {
      return { success: false, error: { code: "FLIGHT_NOT_FOUND", message: "That flight no longer exists." } };
    }
    if (store.bookingStatus !== "prepared" && store.bookingStatus !== "reserved") {
      return {
        success: false,
        error: { code: "NOT_PREPARED", message: "Prepare the booking before confirming a purchase." },
      };
    }
    store.setBookingStatus("booked");
    store.addBudgetItem({
      category: "Flights",
      label: `${flight.airline} · ${flight.from} → ${flight.to}`,
      amount: flight.price,
      committed: true,
    });
    return { success: true, data: { flight, bookingStatus: "booked" } };
  },
  summarize: (_input, result) =>
    result.success ? `Purchased ${result.data.flight.airline} flight · ${formatINR(result.data.flight.price)}` : "Purchase could not be completed",
};

export const travelTools = [searchFlights, compareFlights, prepareFlightBooking, confirmFlightPurchase];
