import type { ApiService } from "@/lib/api";
import type { Service, StaffAvailability } from "@/types";

export type Tab = "services" | "portfolio" | "about";
export type ServiceMode = "onsite" | "mobile";

// ─── Feature flag ──────────────────────────────────────────────────────────────
// Set to true to re-enable discount pricing across all service cards & booking flow.
export const DISCOUNTS_ENABLED = false;

export function toAbsoluteUrl(url: string): string {
  if (!url) return url;
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function formatApiTime(time: string): string {
  const [hours, minutes] = time.split(":");
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return minutes === "00" ? `${h12} ${ampm}` : `${h12}:${minutes} ${ampm}`;
}

export function formatSlotStart(slot: string): string {
  return formatApiTime(slot.split("-")[0]);
}

function applyDiscount(
  base: number,
  isDiscount: number,
  pct: string,
): { price: number; originalPrice?: number } {
  if (!DISCOUNTS_ENABLED) return { price: base };
  const discountPct = parseFloat(pct) || 0;
  if (isDiscount && discountPct > 0) {
    return {
      price: Math.round(base * (1 - discountPct / 100) * 100) / 100,
      originalPrice: base,
    };
  }
  return { price: base };
}

function getPaymentType(
  serviceType: ApiService["service_type"],
): Service["paymentType"] {
  if (serviceType === "walkin") return "WALK_IN_ONLY";
  if (serviceType === "mobile") return "PAY_ONLINE";
  if (serviceType === "both") return "PAY_ONLINE_OR_ONSITE";
  return "PAY_ONSITE";
}

export function mapApiService(apiService: ApiService, mode: ServiceMode): Service {
  let price: number;
  let originalPrice: number | undefined;
  const paymentType = getPaymentType(apiService.service_type);

  if (apiService.service_type === "walkin") {
    const d = applyDiscount(
      parseFloat(apiService.walk_price) || 0,
      apiService.is_walk_discount,
      apiService.walk_discount_percentage,
    );
    price = d.price;
    originalPrice = d.originalPrice;
  } else if (apiService.service_type === "mobile") {
    const d = applyDiscount(
      parseFloat(apiService.mobile_price) || 0,
      apiService.is_mobile_discount,
      apiService.mobile_discount_percentage,
    );
    price = d.price;
    originalPrice = d.originalPrice;
  } else {
    const useMobile = mode === "mobile";
    const d = useMobile
      ? applyDiscount(
          parseFloat(apiService.mobile_price) || 0,
          apiService.is_mobile_discount,
          apiService.mobile_discount_percentage,
        )
      : applyDiscount(
          parseFloat(apiService.walk_price) || 0,
          apiService.is_walk_discount,
          apiService.walk_discount_percentage,
        );
    price = d.price;
    originalPrice = d.originalPrice;
  }

  const staffAvailability: StaffAvailability[] = apiService.staff
    .filter((s) => s.staff_availability.length > 0)
    .map((staff) => {
      const avail = staff.staff_availability[0];
      return {
        staffId: staff.id.toString(),
        staffInitials: getInitials(staff.name),
        staffName: staff.name,
        slots: (avail?.slots ?? []).map(formatSlotStart),
        hours:
          avail?.open_time && avail?.close_time
            ? `${formatApiTime(avail.open_time)} – ${formatApiTime(avail.close_time)}`
            : undefined,
      };
    });

  const resolvedServiceType =
    apiService.service_type === "both"
      ? mode === "mobile"
        ? "mobile"
        : "walkin"
      : apiService.service_type;

  return {
    id: apiService.id.toString(),
    name: apiService.service_name,
    duration: apiService.time,
    price,
    originalPrice,
    description: apiService.service_description ?? undefined,
    serviceType: resolvedServiceType,
    paymentType,
    staffAvailability:
      staffAvailability.length > 0 ? staffAvailability : undefined,
  };
}
