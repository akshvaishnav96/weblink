import { logEvent } from "firebase/analytics";
import { getFirebaseAnalytics } from "./firebase";

// ─── Session-based deduplication ─────────────────────────────────────────────

function hasTracked(key: string): boolean {
  try {
    return sessionStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function markTracked(key: string): void {
  try {
    sessionStorage.setItem(key, "1");
  } catch {
    // sessionStorage unavailable (SSR, private mode) — silently skip
  }
}

// ─── Core fire-once helper ────────────────────────────────────────────────────

function trackOnce(
  dedupKey: string,
  eventName: string,
  params: Record<string, string | number | boolean>,
): void {
  if (hasTracked(dedupKey)) return;

  const analytics = getFirebaseAnalytics();
  if (analytics) {
    try {
      logEvent(analytics, eventName, params);
    } catch (err) {
      console.warn("[Analytics] logEvent failed:", err);
    }
  }

  markTracked(dedupKey);
  console.log(`[Analytics] ${eventName}`, params);
}

// ─── Public event helpers ─────────────────────────────────────────────────────

/**
 * Fires once per session per business slug.
 * Call on the profile page mount.
 */
export function trackPageVisit(slug: string, businessName: string): void {
  trackOnce(`page_visit__${slug}`, "page_visit", {
    business_slug:  slug,
    business_name:  businessName,
  });
}

/**
 * Fires once per session per unique service ID.
 * Call when a user expands / selects a service.
 */
export function trackServiceSelected(
  serviceId: string,
  serviceName: string,
  slug: string,
): void {
  trackOnce(`service_selected__${slug}__${serviceId}`, "service_selected", {
    service_id:    serviceId,
    service_name:  serviceName,
    business_slug: slug,
  });
}

/**
 * Fires once per session per unique staff ID.
 * Call when a user picks a specific staff member.
 */
export function trackStaffSelected(
  staffId: string,
  staffName: string,
  slug: string,
): void {
  if (!staffId || staffId === "anyone" || staffId === "0") return;
  trackOnce(`staff_selected__${slug}__${staffId}`, "staff_selected", {
    staff_id:      staffId,
    staff_name:    staffName,
    business_slug: slug,
  });
}
