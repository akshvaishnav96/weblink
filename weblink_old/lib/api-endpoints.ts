const API_BASE = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://valetvaultdev.24livehost.com/api/v2/weblink";

export const API_ENDPOINTS = {
  BUSINESS_PROFILE: (slug: string) => `${API_BASE}/bookme/${slug}?search=`,
STAFF_AVAILABILITY: `${API_BASE}/check-staff-availability`,
  BOOKING_CREATE: "/api/booking/create",
  BOOKING_PAYMENT_INTENT: "/api/booking/payment-intent",
  BOOKING_DETAILS: (id: number) => `/api/booking/details/${id}`,
  BOOKING_CANCEL: (id: number) => `/api/booking/cancel/${id}`,
  SITEMAP_BUSINESSES: `${API_BASE}/marketplace-preview?search=`,
} as const;
