// ─── App-wide constants ────────────────────────────────────────────────────────
// Change values here to affect the entire application.

// ── LocalStorage keys ─────────────────────────────────────────────────────────
export const STORAGE_KEYS = {
  BOOKING:    "groomly-booking",       // Zustand persisted store key
  SAVED_USER: "groomly-saved-user",    // Pre-filled user details for repeat bookings
  BOOKING_IDS:"groomly-booking-ids",   // IDs of bookings created in this session
} as const;

// ── Regional defaults ─────────────────────────────────────────────────────────
export const DEFAULT_COUNTRY_CODE = "IN";   // ISO 3166-1 alpha-2  (e.g. "AU", "IN", "US")
export const DEFAULT_CURRENCY     = "aud";  // Stripe currency code (lowercase)
export const APPLE_PAY_COUNTRY    = "AU";   // Stripe paymentRequest country (ISO 3166-1)

// ── UPI polling ───────────────────────────────────────────────────────────────
export const UPI_POLL_INTERVAL_MS = 3000;   // How often to check UPI status (ms)
export const UPI_POLL_MAX_ATTEMPTS = 40;    // Max retries before giving up

// ── UI delays ─────────────────────────────────────────────────────────────────
export const COUNTRY_SEARCH_FOCUS_DELAY_MS = 50; // Delay before focusing country search input

// ── Booking PIN fallback ──────────────────────────────────────────────────────
export const PIN_MIN = 1000;  // Fallback PIN random range (inclusive)
export const PIN_MAX = 9999;
