// ─── Base ──────────────────────────────────────────────────────────────────────
const API_BASE = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ;

interface ApiResponse<T> {
  message: string;
  status: boolean;
  code: number;
  data: T;
}

// ─── Business Profile Types ────────────────────────────────────────────────────
export interface ApiStaffAvailability {
  id: number;
  staff_id: number;
  business_id: number;
  slots: string[]; // e.g. ["16:00-16:30", "16:30-17:00"]
  availability_date: string;
  day: string;
  date_from: string;
  date_to: string;
  open_time: string;
  close_time: string;
  reason: string | null;
  is_available: number;
  created_at: string;
  updated_at: string;
}

export interface ApiStaff {
  id: number;
  parent_id: number;
  business_id: number;
  business_service_id: string;
  picture: string | null;
  name: string;
  phone_number: string | null;
  email: string | null;
  gender: string;
  bio: string | null;
  experience: string;
  staff_availability: ApiStaffAvailability[];
}

export interface ApiService {
  id: number;
  parent_id: number | null;
  service_name: string;
  service_type: "walkin" | "mobile" | "both";
  time: number; // minutes
  mobile_price: string;
  walk_price: string;
  is_mobile_discount: number;
  is_walk_discount: number;
  mobile_discount_percentage: string;
  walk_discount_percentage: string;
  service_description: string | null;
  status: number;
  staff: ApiStaff[];
}

export interface ApiPortfolioItem {
  id: number;
  parent_id: number | null;
  business_id: number;
  portfolio_id: number;
  type: "image" | "video";
  portfolio_url: string;
  status: number;
  is_deleted: null;
  created_at: string;
  updated_at: string;
}

export interface ApiPortfolio {
  id: number;
  description: string;
  images: ApiPortfolioItem[];
  videos: ApiPortfolioItem[];
}

export interface ApiOpenHour {
  id: number;
  parent_id: number | null;
  business_id: number;
  day: string;
  open_time: string | null;
  close_time: string | null;
  is_closed: number;
  created_at: string;
  updated_at: string;
}

export interface ApiStaffSummary {
  name: string;
  picture: string;
  bio: string | null;
}

export interface ApiBusinessProfile {
  id: number;
  business_name: string;
  business_type: string;
  business_display_name: string;
  business_banner: string;
  business_address: string;
  business_phone?: string | null;
  latitude: string;
  longitude: string;
  total_reviews: number;
  average_rating: number;
  google_url: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  website_url: string | null;
  services: ApiService[];
  portfolio: ApiPortfolio;
  who_we_are: string;
  open_hours: ApiOpenHour[];
  staff: ApiStaffSummary[];
}

// ─── Staff Availability Types ──────────────────────────────────────────────────
export interface StaffAvailabilityParams {
  business_id: string | number;
  type: "anyone" | "specific";
  staff_id?: string | number;
  date: string; // "YYYY-MM-DD"
  business_service_id: string;
}

// check-staff-availability returns a single availability record
export type AvailabilityResult = ApiStaffAvailability;

// ─── API Functions ─────────────────────────────────────────────────────────────
export async function fetchBusinessProfileBySlug(slug: string, signal?: AbortSignal): Promise<ApiBusinessProfile> {
  const url = `${API_BASE}/bookme/${slug}?search=`;
  const res = await fetch(url, { headers: { Accept: "application/json" }, cache: "no-store", signal });
  if (!res.ok) throw new Error(`Failed to fetch business profile (${res.status})`);
  const json: ApiResponse<ApiBusinessProfile> = await res.json();
  console.log("[API] Business profile fetched by slug:", json);
  if (!json.status) throw new Error(json.message);
  return json.data;
}

export async function checkStaffAvailability(
  params: StaffAvailabilityParams
): Promise<AvailabilityResult> {
  const body: Record<string, unknown> = {
    business_id: params.business_id,
    type: params.type,
    date: params.date,
    business_service_id: params.business_service_id,
  };
  if (params.staff_id !== undefined) {
    body.staff_id = params.staff_id;
  }

  const res = await fetch(`${API_BASE}/check-staff-availability`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    credentials: "omit", // prevent browser cookies from triggering Laravel CSRF check
  });
  if (!res.ok) {
    throw new Error(`Failed to check availability (${res.status})`);
  }
  const json = await res.json();
  if (!json.status) throw new Error(json.message ?? "Availability check failed");
  return json.data as AvailabilityResult;
}

// ─── Booking API ───────────────────────────────────────────────────────────────
const BOOKING_TOKEN = process.env.BOOKING_API_TOKEN ?? "";

export interface BookingPayload {
  business_id: string | number;
  staff_id: string | number;
  time_slot: string;           // "09:30-10:00"
  booking_date: string;        // "YYYY-MM-DD"
  total_amount: number;
  is_secure: boolean;
  service_type: string;        // "walkin" | "mobile" | "both"
  services: { service_id: number; price: number }[];
  customer_name: string;
  is_booking_someone: boolean;
  guest_name: string;
  customer_country_code: string;
  customer_phone_number: string;
  customer_email: string;
  payment_mode: string;        // "cash" | "card" | "apple_pay"
  comment?: string;
}

export interface BookingResult {
  id?: number;
  booking_reference?: string;
  [key: string]: unknown;
}

/** Used for onsite (cash) and Apple/Google Pay — creates the booking immediately */
export async function createBookingPayment(payload: BookingPayload): Promise<BookingResult> {
  const res = await fetch(`${API_BASE}/create-booking-payment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${BOOKING_TOKEN}`,
    },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!json.status) throw new Error(json.message ?? "Booking failed");
  return (json.data ?? {}) as BookingResult;
}

export interface PaymentIntentPayload extends BookingPayload {
  payment_intent_id: string;
}

export interface PaymentIntentResult {
  client_secret?: string;
  payment_intent_id?: string;
  [key: string]: unknown;
}

/** Used for card payments — creates a payment intent so the card can be charged securely */
export async function createPaymentIntent(payload: PaymentIntentPayload): Promise<PaymentIntentResult> {
  const res = await fetch(`${API_BASE}/create-payment-intent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!json.status) throw new Error(json.message ?? "Payment intent creation failed");
  return (json.data ?? {}) as PaymentIntentResult;
}

