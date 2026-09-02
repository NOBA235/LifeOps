"use client";

import * as React from "react";
import { useAppStore } from "@/lib/store/appStore";
import { registerWebMCPTools } from "@/lib/webmcp/registry";

/**
 * Rehydrates the persisted app store on the client and attempts real
 * WebMCP registration via document.modelContext.
 *
 * No loading gate is needed here: with `skipHydration: true`, the store's
 * in-memory state is the same seed data on both the server render and the
 * client's first render, so there is nothing to mismatch. Once this effect
 * calls `rehydrate()`, any persisted values simply flow in as a normal,
 * ordinary post-mount state update — not a hydration correction.
 */
export function StoreProvider({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    useAppStore.persist.rehydrate();
    registerWebMCPTools();
  }, []);

  return <>{children}</>;
}
