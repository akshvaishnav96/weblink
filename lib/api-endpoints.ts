const API_BASE =
  process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE) {
  throw new Error(
    "[Config] API_BASE_URL or NEXT_PUBLIC_API_BASE_URL must be set in your environment variables."
  );
}

export const API_ENDPOINTS = {
  // ── Backend (server-to-server) endpoints ───────────────────────────────────
  BUSINESS_PROFILE: (slug: string) => `${API_BASE}/bookme/${slug}?search=`,
  STAFF_AVAILABILITY: `${API_BASE}/check-staff-availability`,
  BOOKING_CREATE_PAYMENT: `${API_BASE}/create-booking-payment`,
  CREATE_PAYMENT_INTENT: `${API_BASE}/create-payment-intent`,
  QUEUE_PAYMENT_INTENT_BACKEND: `${API_BASE}/queue/create-payment-intent`,
  QUEUE_CREATE_BACKEND:         `${API_BASE}/queue/create-booking-payment`,
  QUEUE_ACTION_BACKEND:  (orderId: string) => `${API_BASE}/queue/${orderId}/action`,
  QUEUE_DETAILS_BACKEND: (orderId: string) => `${API_BASE}/queue/details/${orderId}`,
  QUEUE_RATING_BACKEND:  `${API_BASE}/queue/rating-review`,
  BOOKING_DETAILS_BACKEND: (id: string | number) => `${API_BASE}/booking-details/${id}`,
  BOOKING_CANCEL_BACKEND: (id: string | number) => `${API_BASE}/booking-cancel/${id}`,
  ADD_TO_CALENDAR: `${API_BASE}/add-to-calendar`,
  SITEMAP_BUSINESSES: `${API_BASE}/marketplace-preview?search=`,

  // ── Next.js API routes (client-to-server) endpoints ───────────────────────
  BOOKING_CREATE: "/barbers/api/booking/create",
  BOOKING_PAYMENT_INTENT: "/barbers/api/booking/payment-intent",
  QUEUE_PAYMENT_INTENT: "/barbers/api/queue/payment-intent",
  QUEUE_CREATE:         "/barbers/api/queue/create",
  QUEUE_ACTION:  (orderId: string) => `/barbers/api/queue/${orderId}/action`,
  QUEUE_DETAILS: (orderId: string) => `/barbers/api/queue/${orderId}/details`,
  QUEUE_RATING:  "/barbers/api/queue/rating",
  BOOKING_DETAILS: (id: number | string) => `/barbers/api/booking/details/${id}`,
  BOOKING_CANCEL: (id: number | string) => `/barbers/api/booking/cancel/${id}`,
  LOG_PAYMENT_FAILURE: "/barbers/api/log/payment-failure",
} as const;
