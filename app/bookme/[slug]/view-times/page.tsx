"use client";

import { useState, use, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { User } from "lucide-react";
import BackHeader from "@/components/layout/BackHeader";
import ExpertSelector from "@/components/booking/ExpertSelector";
import BookingCalendar from "@/components/booking/BookingCalendar";
import TimeSlotButton from "@/components/ui/TimeSlotButton";
import {
  fetchBusinessProfileBySlug,
  checkStaffAvailability,
  type ApiBusinessProfile,
  type ApiStaff,
  type ApiStaffSummary,
} from "@/lib/api";
import { useBookingStore } from "@/store/bookingStore";
import { DISCOUNTS_ENABLED } from "../_utils";
import { toISODate, formatSlotStart, nowInTZ } from "@/lib/utils";
import { trackStaffSelected } from "@/lib/analytics";
import styles from "./page.module.css";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}


// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ViewTimesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const setSelection = useBookingStore((s) => s.setSelection);
  const serviceId = searchParams.get("service") ?? "";
  const businessName = searchParams.get("businessName") ?? "";
  const businessAddress = searchParams.get("businessAddress") ?? "";
  const mode = (searchParams.get("mode") ?? "onsite") as "onsite" | "mobile";
  const userId = searchParams.get("user_id");
  const isMobileMode = mode === "mobile";

  const [profile, setProfile] = useState<ApiBusinessProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [selectedExpert, setSelectedExpert] = useState("anyone");
  const [randomStaffId, setRandomStaffId] = useState<string | null>(null);
  // staff_id returned by checkStaffAvailability — used for booking when no real IDs
  const [resolvedStaffId, setResolvedStaffId] = useState<string | null>(null);
  // Initialise to today in the app timezone (Australia/Sydney) so the calendar
  // opens on the correct date regardless of the user's browser timezone.
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => {
    const [datePart] = nowInTZ().split("T");
    const [y, m, d] = datePart.split("-").map(Number);
    return new Date(y, m - 1, d);
  });
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [meetUpAddress] = useState("");

  const [slots, setSlots] = useState<string[]>([]);
  const [rawSlotsMap, setRawSlotsMap] = useState<Record<string, string>>({});
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const lastStaffRef = useRef<string | null>(null);
  // Staff returned by the availability API — updates when date changes
  const [availableStaff, setAvailableStaff] = useState<ApiStaffSummary[] | null>(null);

  // Staff from services — have real numeric IDs usable for specific availability checks
  const serviceStaff = useMemo((): ApiStaff[] => {
    if (!profile) return [];
    return Object.values(
      profile.services
        .flatMap((svc) => svc.staff)
        .reduce<Record<number, ApiStaff>>((acc, s) => {
          if (!acc[s.id]) acc[s.id] = s;
          return acc;
        }, {}),
    );
  }, [profile]);

  // Whether we have real staff IDs for specific availability lookups
  const hasRealIds = serviceStaff.length > 0;

  // Build expert cards solely from the availability API response.
  // Returns [] until the first API call completes — prevents flash of all profile staff.
  const experts = useMemo(() => {
    if (availableStaff === null) return []; // wait for API — show nothing until date availability loads
    return availableStaff.map((s) => ({
      id: s.id.toString(),
      initials: getInitials(s.name),
      name: s.name,
      picture: s.picture ?? undefined,
    }));
  }, [availableStaff]);

  useEffect(() => {
    fetchBusinessProfileBySlug(slug)
      .then((data) => {
        setProfile(data);
        setProfileLoading(false);
      })
      .catch((err: Error) => {
        setProfileError(err.message ?? "Failed to load profile");
        setProfileLoading(false);
      });
  }, [slug]);

  // Pick a random staff for "anyone" selection (only when real IDs are available)
  useEffect(() => {
    if (!profile || !hasRealIds) return;
    if (selectedExpert === "anyone" && serviceStaff.length > 0) {
      const random = serviceStaff[Math.floor(Math.random() * serviceStaff.length)];
      setRandomStaffId(random.id.toString());
    }
  }, [profile, selectedExpert, hasRealIds, serviceStaff]);

  const fetchSlots = useCallback(async () => {
    if (!selectedDate || !serviceId || !profile) return;

    let callType: "anyone" | "specific";
    let staffIdParam: string | undefined;

    if (hasRealIds) {
      const effectiveStaffId =
        selectedExpert === "anyone" ? randomStaffId : selectedExpert;
      if (!effectiveStaffId) return; // waiting for random staff to be picked
      callType = selectedExpert === "anyone" ? "anyone" : "specific";
      staffIdParam = effectiveStaffId;
    } else {
      callType = selectedExpert !== "anyone" ? "specific" : "anyone";
      staffIdParam = selectedExpert !== "anyone" ? selectedExpert : undefined;
    }

    setSlotsLoading(true);
    setSlotsError(null);
    setSelectedTime(null);
    try {
      const result = await checkStaffAvailability({
        business_id: profile.id,
        type: callType,
        staff_id: staffIdParam,
        date: toISODate(selectedDate),
        business_service_id: serviceId,
      });
      // Only update the staff list on "anyone" calls (date-driven).
      // When a specific staff is selected we only want to refresh slots, not the list.
      if (callType === "anyone") {
        const newStaff = result.staff ?? [];
        setAvailableStaff(newStaff);
        // Auto-select the single staff so it's sent correctly on booking
        if (newStaff.length === 1) {
          setSelectedExpert(newStaff[0].id.toString());
        }
      }
      // Store the staff_id from response for booking when no real IDs
      if (result.staff_id) {
        setResolvedStaffId(result.staff_id.toString());
      }
      const rawSlots: string[] = result.slots ?? [];
      const sorted = [...new Set(rawSlots)].sort();
      const displaySlotsList = sorted.map(formatSlotStart);
      const map: Record<string, string> = {};
      sorted.forEach((raw, i) => {
        map[displaySlotsList[i]] = raw;
      });
      setSlots(displaySlotsList);
      setRawSlotsMap(map);
    } catch (err) {
      setSlotsError((err as Error).message ?? "Could not load time slots");
      setSlots([]);
      // Only clear the staff list if this was a date-driven call — never on specific-staff errors
      if (callType === "anyone") setAvailableStaff([]);
    } finally {
      setSlotsLoading(false);
    }
  }, [profile, selectedDate, selectedExpert, randomStaffId, serviceId, hasRealIds]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const service = profile?.services.find((s) => s.id.toString() === serviceId);
  const servicePrice = (() => {
    if (!service) return 0;
    // Keep applyDiscount intact — re-enable via DISCOUNTS_ENABLED in _utils.ts
    const applyDiscount = (base: number, isDiscount: number, pct: string) => {
      if (!DISCOUNTS_ENABLED) return base;
      const discountPct = parseFloat(pct) || 0;
      if (isDiscount && discountPct > 0)
        return Math.round(base * (1 - discountPct / 100) * 100) / 100;
      return base;
    };
    if (
      service.service_type === "mobile" ||
      (service.service_type === "both" && isMobileMode)
    ) {
      return applyDiscount(
        parseFloat(service.mobile_price) || 0,
        service.is_mobile_discount,
        service.mobile_discount_percentage,
      );
    }
    return applyDiscount(
      parseFloat(service.walk_price) || 0,
      service.is_walk_discount,
      service.walk_discount_percentage,
    );
  })();

  const canBook = !!(selectedDate && selectedTime);

  const selectedExpertName =
    selectedExpert === "anyone"
      ? "Anyone"
      : (experts.find((e) => e.id === selectedExpert)?.name ?? "Anyone");

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-white">
        <BackHeader title="Select Your Expert" />
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-[16px]">
          {/* spinner: @keyframes — kept in CSS module */}
          <div className={styles.spinner} />
          <p className="text-[13px] text-[#999]">Loading…</p>
        </div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="min-h-screen bg-white">
        <BackHeader title="Select Your Expert" />
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-[16px]">
          <p className="text-[13px] text-[#999] text-center px-[16px]">{profileError}</p>
          <button
            onClick={() => router.back()}
            className="py-[10px] px-[24px] rounded-[999px] bg-[#B8860B] text-white text-[13px] font-semibold cursor-pointer border-none"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <BackHeader title="Select Your Expert" />

      {/* Expert selector */}
      {availableStaff !== null && experts.length === 0 ? (
        <div className="flex items-center gap-[8px] px-[16px] py-[14px] text-[13px] text-[#999] italic">
          <User size={14} strokeWidth={1.5} className="shrink-0 text-[#ccc]" />
          No staff available for this date
        </div>
      ) : (
        <ExpertSelector
          experts={experts}
          selectedId={selectedExpert}
          onSelect={(id) => {
            setSelectedExpert(id);
            setSelectedTime(null);
              const expert = experts.find((e) => e.id === id);
              trackStaffSelected(lastStaffRef, id, expert?.name ?? id, slug);
          }}
        />
      )}

      {/* Progress line + selected expert chip */}
      {/* progressLineLoading: @keyframes + gradient — kept in CSS module */}
      <div className={`h-[2px] w-full m-0 ${slotsLoading ? styles.progressLineLoading : "bg-[#B8860B]"}`} />
      <div className="flex justify-center py-[14px] px-[16px] pb-[4px]">
        {/* selectedExpertChip: svg child selector — kept in CSS module */}
        <div className={styles.selectedExpertChip}>
          <User size={12} />
          <span>{selectedExpertName}</span>
        </div>
      </div>

      {/* Calendar */}
      <BookingCalendar
        selectedDate={selectedDate}
        onDateSelect={(d) => {
          setSelectedDate(d);
          setSelectedExpert("anyone");
          setSelectedTime(null);
        }}
      />

      {/* Time slots */}
      {/* sectionTitle: font-family: var(--font-heading) — kept in CSS module */}
      <div className="py-[24px] px-[16px] pb-[20px] border-b border-[#F0EFED] md:py-[28px] md:px-[32px] md:pb-[24px] lg:py-[32px] lg:px-[40px] lg:pb-[28px]">
        <p className={styles.sectionTitle}>Choose Time</p>
        {slotsLoading ? (
          <div className="flex items-center gap-[12px] py-[16px]">
            <div className={styles.spinner} />
            <span className="text-[13px] text-[#999]">Checking availability…</span>
          </div>
        ) : slotsError ? (
          <p className="text-[13px] text-[#c0392b] text-center py-[20px] italic">
            {slotsError}
          </p>
        ) : slots.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-3 gap-[10px] md:gap-[12px]">
            {slots.map((slot) => (
              <TimeSlotButton
                key={slot}
                time={slot}
                selected={selectedTime === slot}
                onClick={() => setSelectedTime(slot)}
              />
            ))}
          </div>
        ) : (
          <p className="text-[13px] text-[#999] text-center py-[20px] italic">
            No availability for this date — try another day
          </p>
        )}
      </div>

      {/* Additional Notes */}
      {/* formLabel: custom font — kept in CSS module; formTextarea: ::placeholder + :focus — kept in CSS module */}
      <div className="py-[16px] px-[16px] pb-[4px] md:px-[32px] lg:px-[40px]">
        <label className={styles.formLabel}>Additional Notes (Optional)</label>
        <textarea
          className={styles.formTextarea}
          placeholder="Any special requests or notes..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>

      {/* Book button */}
      {/* ctaBtn: :hover — kept in CSS module */}
      <div className="py-[20px] px-[16px] pb-[12px] md:py-[24px] md:px-[32px] md:pb-[16px] lg:py-[24px] lg:px-[40px] lg:pb-[20px]">
        <button
          onClick={() => {
            if (!canBook) return;

            // Determine staff ID and display info for the booking payload
            let bookingStaffId: string;
            let expertObj: (typeof experts)[0] | undefined;

            if (hasRealIds) {
              const effectiveId =
                selectedExpert === "anyone"
                  ? (randomStaffId ?? "0")
                  : selectedExpert;
              expertObj = experts.find((e) => e.id === effectiveId);
              bookingStaffId = effectiveId;
            } else {
              expertObj =
                selectedExpert !== "anyone"
                  ? experts.find((e) => e.id === selectedExpert)
                  : undefined;
              bookingStaffId =
                selectedExpert !== "anyone"
                  ? selectedExpert
                  : (resolvedStaffId ?? "0");
            }

            const staffName = expertObj?.name ?? "Anyone";
            const staffInitials = expertObj?.initials ?? "AN";
            const staffPicture = expertObj?.picture ?? "";
            const dateStr = selectedDate
              ? selectedDate.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "";
            const rawTimeSlot = selectedTime
              ? (rawSlotsMap[selectedTime] ?? "")
              : "";
            const bookingDate = selectedDate ? toISODate(selectedDate) : "";
            const selectionPayload = {
              barberId: String(profile?.id ?? ""),
              barberSlug: slug,
              serviceName: service?.service_name ?? serviceId,
              serviceId,
              staffName,
              staffId: bookingStaffId,
              staffInitials,
              staffPicture,
              displayTime: `${dateStr}, ${selectedTime}`,
              duration: String(service?.time ?? ""),
              price: String(servicePrice),
              businessName,
              businessAddress,
              rawTimeSlot,
              bookingDate,
              serviceType:
                service?.service_type === "both"
                  ? isMobileMode
                    ? "mobile"
                    : "walkin"
                  : (service?.service_type ?? "walkin"),
              notes: notes || undefined,
              meetUpAddress: meetUpAddress || undefined,
              userId: userId ?? null,
            };
            setSelection(selectionPayload);
            router.push(`/bookme/${slug}/confirm-booking`);
          }}
          className={`${styles.ctaBtn}${!canBook ? ` ${styles.ctaBtnDisabled}` : ""}`}
        >
          Book Appointment
        </button>
      </div>
    </div>
  );
}
