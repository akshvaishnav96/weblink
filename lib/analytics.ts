import type React from "react";
import { logEvent } from "firebase/analytics";
import { getFirebaseAnalytics } from "./firebase";
import { ANALYTICS_EVENTS } from "./constants";

// ─── Core logger ──────────────────────────────────────────────────────────────

function fire(
  eventName: string,
  params: Record<string, string | number | boolean>,
): void {
  const analytics = getFirebaseAnalytics();
  if (analytics) {
    try {
      logEvent(analytics, eventName, params);
    } catch (err) {
      console.warn("[Analytics] logEvent failed:", err);
    }
  }
  if (process.env.NEXT_PUBLIC_ENABLE_LOGS === "1") {
    console.log(`[Analytics] ${eventName}`, params);
  }
}

// ─── page_visit — sessionStorage (once per tab session per slug) ──────────────

/**
 * Fires once per browser tab session per business slug.
 * Uses sessionStorage because the user can navigate away and come back —
 * we don't want to re-fire on every mount within the same tab.
 */
export function trackPageVisit(slug: string, businessName: string, businessId: string): void {
  const key = `pv__${slug}`;
  try {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
  } catch {
    // sessionStorage unavailable — fire anyway, no dedup
  }
  fire(ANALYTICS_EVENTS.PAGE_VISIT, { business_slug: slug, business_name: businessName, business_id: businessId });
}

// ─── service_selected — useRef dedup (last-fired value) ──────────────────────

/**
 * Call this with a ref that tracks the last-fired service ID.
 * Only fires when the service actually changes from the previously tracked one.
 * Resets naturally when the component unmounts (page navigation).
 *
 * Usage in component:
 *   const lastServiceRef = useRef<string | null>(null);
 *   trackServiceSelected(lastServiceRef, id, name, slug, businessId);
 */
export function trackServiceSelected(
  lastRef: React.RefObject<string | null>,
  serviceId: string,
  serviceName: string,
  slug: string,
  businessId: string,
): void {
  if (lastRef.current === serviceId) return;
  lastRef.current = serviceId;
  fire(ANALYTICS_EVENTS.SERVICE_SELECTED, {
    service_id:    serviceId,
    service_name:  serviceName,
    business_slug: slug,
    business_id:   businessId,
  });
}

// ─── social_click — fires on every social link tap ───────────────────────────

/**
 * Always fires `social_click`.
 * Also fires `{platform}_click` only when NEXT_PUBLIC_SOCIAL_SINGLE_URL_CLICK === "1".
 *
 * @param platform  "facebook" | "instagram" | "tiktok" | "website"
 */
export function trackSocialClick(
  platform: "facebook" | "instagram" | "tiktok" | "website",
  slug: string,
  businessId: string | number,
): void {
  const params = { platform, business_slug: slug, business_id: String(businessId) };

  // Always fire the grouped event
  fire(ANALYTICS_EVENTS.SOCIAL_CLICK, params);

  // Fire the per-platform event only when the env flag is enabled
  if (process.env.NEXT_PUBLIC_SOCIAL_SINGLE_URL_CLICK === "1") {
    const perPlatform = ANALYTICS_EVENTS[`${platform.toUpperCase()}_CLICK` as keyof typeof ANALYTICS_EVENTS];
    fire(perPlatform, params);
  }
}

// ─── staff_selected — useRef dedup (last-fired value) ────────────────────────

/**
 * Call this with a ref that tracks the last-fired staff ID.
 * Only fires when a different staff member is selected from the previous one.
 * Resets naturally when the component unmounts (page navigation).
 *
 * Usage in component:
 *   const lastStaffRef = useRef<string | null>(null);
 *   trackStaffSelected(lastStaffRef, id, name, slug, serviceId, businessId);
 */
export function trackStaffSelected(
  lastRef: React.RefObject<string | null>,
  staffId: string,
  staffName: string,
  slug: string,
  serviceId: string,
  businessId: string,
  serviceName: string = "",
): void {
  if (!staffId || staffId === "anyone" || staffId === "0") return;
  if (lastRef.current === staffId) return;
  lastRef.current = staffId;
  fire(ANALYTICS_EVENTS.STAFF_SELECTED, {
    staff_id:      staffId,
    staff_name:    staffName,
    business_slug: slug,
    service_id:    serviceId,
    service_name:  serviceName,
    business_id:   businessId,
  });
}
