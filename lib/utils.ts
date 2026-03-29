export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

export function formatPrice(amount: number): string {
  return `$${amount}`;
}

export function getPaymentLabel(type: string): string {
  switch (type) {
    case "PAY_ONLINE": return "PAY ONLINE";
    case "PAY_ONSITE": return "PAY ONSITE";
    case "WALK_IN_ONLY": return "WALK-IN ONLY";
    case "PAY_ONLINE_OR_ONSITE": return "PAY ONLINE · PAY ONSITE";
    default: return type;
  }
}

export function getPaymentColor(type: string): string {
  switch (type) {
    case "PAY_ONLINE": return "text-amber-700";
    case "PAY_ONSITE": return "text-amber-700";
    case "WALK_IN_ONLY": return "text-gray-500";
    case "PAY_ONLINE_OR_ONSITE": return "text-amber-700";
    default: return "text-gray-500";
  }
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

// ─── Device / UA utilities ────────────────────────────────────────────────

/** Returns true when running on iOS (iPhone / iPad / iPod). */
export function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/** Returns true when running on Android. */
export function isAndroid(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android/i.test(navigator.userAgent);
}

/**
 * Returns the wallet label to show on the payment button:
 * iOS / Mac Safari → "Apple Pay"
 * Android         → "Google Pay"
 * everything else → "Apple Pay / Google Pay"
 */
export function detectWalletLabel(): string {
  if (typeof navigator === "undefined") return "Apple Pay / Google Pay";
  const ua = navigator.userAgent;
  const onApple = /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/i.test(ua) && /Safari/i.test(ua) && !/Chrome/i.test(ua));
  if (onApple) return "Apple Pay";
  if (/Android/i.test(ua)) return "Google Pay";
  return "Apple Pay / Google Pay";
}

// ─── Date / Time utilities ─────────────────────────────────────────────────

/**
 * Converts a Date object to "YYYY-MM-DD" string (local time, no UTC shift).
 */
export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Formats a date string ("YYYY-MM-DD") into short and long display formats.
 * short: "28 Mar 2026"   full: "Friday, 28 March 2026"
 */
export function formatBookingDate(dateStr: string): { short: string; full: string } {
  const d = new Date(dateStr + "T00:00:00");
  const short = d.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
  const full  = d.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  return { short, full };
}

/**
 * Converts "HH:MM:SS" or "HH:MM" to "H:MM AM/PM".
 * Example: "09:00:00" → "9:00 AM", "16:30" → "4:30 PM"
 */
export function formatApiTime(time: string): string {
  const [hStr, mStr] = time.split(":");
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12  = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

/**
 * Extracts start time from a "HH:MM-HH:MM" slot string and formats it.
 * Example: "16:00-16:30" → "4:00 PM"
 */
export function formatSlotStart(slot: string): string {
  return formatApiTime(slot.split("-")[0]);
}
