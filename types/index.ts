// ─── Core Domain Types ───────────────────────────────────────────────────────

export interface Barber {
  id: string;
  initials: string;
  name: string;
  title: string;
  address: string;
  rating: number;
  reviewCount: number;
  distance: string;
  priceFrom: number;
  website?: string;
  instagram?: string;
  bio?: string;
  services: Service[];
}

export interface Service {
  id: string;
  name: string;
  duration: number; // minutes
  price: number;
  originalPrice?: number;
  paymentType: "PAY_ONLINE" | "PAY_ONSITE" | "WALK_IN_ONLY" | "PAY_ONLINE_OR_ONSITE";
  isMostPopular?: boolean;
  nextAvailable?: string; // e.g. "Today, 5:00 PM"
  description?: string;
  serviceType?: string;  // "walkin" | "mobile" | "both"
  staffAvailability?: StaffAvailability[];
}

export interface StaffAvailability {
  staffId: string;
  staffInitials: string;
  staffName: string;
  isMostBooked?: boolean;
  slots: string[]; // e.g. ["3:00 PM", "4:30 PM"]
  hours?: string; // e.g. "12:00 PM - 8:00 PM" (for walk-in services)
}

export interface Package {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: number; // minutes
  rating: number;
  imageUrl: string;
}

export interface BookingDetails {
  service: string;
  with: string;
  location: string;
  time: string;
  duration: number;
  total: number;
  barberId: string;
  barberName: string;
  barberInitials: string;
}

export type PaymentMethod = "pay_on_site" | "apple_google_pay" | "card";

export type NavTab = "home" | "explore" | "bookings" | "rewards" | "profile";

// ─── Bookings ─────────────────────────────────────────────────────────────────

export type BookingStatus = "confirmed" | "completed" | "cancelled";

export interface Booking {
  id: string;
  barberId: string;
  barberName: string;
  barberInitials: string;
  service: string;
  date: string;
  time: string;
  duration: number; // minutes
  price: number;
  status: BookingStatus;
  address: string;
}

// ─── Rewards ──────────────────────────────────────────────────────────────────

export type RewardTier = "Bronze" | "Silver" | "Gold" | "Platinum";

export interface RewardItem {
  id: string;
  title: string;
  description: string;
  points: number;
  icon: string;
}

export interface PointActivity {
  id: string;
  description: string;
  points: number; // positive = earned, negative = redeemed
  date: string;
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  initials: string;
  memberSince: string;
}
