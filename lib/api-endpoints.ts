const API_BASE =
  process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL;

export const API_ENDPOINTS = {
  // ── Backend (server-to-server) endpoints ───────────────────────────────────
  BUSINESS_PROFILE: (slug: string) => `${API_BASE}/bookme/${slug}?search=`,
  STAFF_AVAILABILITY: `${API_BASE}/check-staff-availability`,
  BOOKING_CREATE_PAYMENT: `${API_BASE}/create-booking-payment`,
  CREATE_PAYMENT_INTENT: `${API_BASE}/create-payment-intent`,
  BOOKING_DETAILS_BACKEND: (id: string | number) => `${API_BASE}/booking-details/${id}`,
  BOOKING_CANCEL_BACKEND: (id: string | number) => `${API_BASE}/booking-cancel/${id}`,
  ADD_TO_CALENDAR: `${API_BASE}/add-to-calendar`,
  SITEMAP_BUSINESSES: `${API_BASE}/marketplace-preview?search=`,

  // ── Next.js API routes (client-to-server) endpoints ───────────────────────
  BOOKING_CREATE: "/bookme/api/booking/create",
  BOOKING_PAYMENT_INTENT: "/bookme/api/booking/payment-intent",
  BOOKING_DETAILS: (id: number | string) => `/bookme/api/booking/details/${id}`,
  BOOKING_CANCEL: (id: number | string) => `/bookme/api/booking/cancel/${id}`,
} as const;
