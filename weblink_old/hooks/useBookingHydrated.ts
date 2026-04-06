"use client";

import { useEffect, useState } from "react";
import { useBookingStore } from "@/store/bookingStore";

/**
 * Returns true once the Zustand booking store has finished loading
 * its persisted state from sessionStorage.
 *
 * Use this to avoid premature redirects caused by reading an empty
 * store before it has hydrated (e.g. on page refresh).
 */
export function useBookingHydrated(): boolean {
  // sessionStorage reads are synchronous, so hasHydrated() is usually
  // true immediately after the first render — but we still gate on
  // useEffect to avoid SSR/client hydration mismatches.
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // If Zustand already finished hydration before this effect ran, mark done.
    if (useBookingStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    // Otherwise wait for the hydration callback.
    const unsub = useBookingStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
    return unsub;
  }, []);

  return hydrated;
}
