"use client";

import { useState, use, useEffect, useCallback, useMemo } from "react";
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
} from "@/lib/api";
import { useBookingStore } from "@/store/bookingStore";
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

function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatSlotStart(slot: string): string {
  const [start] = slot.split("-");
  const [hours, minutes] = start.split(":");
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return minutes === "00" ? `${h12}:00 ${ampm}` : `${h12}:${minutes} ${ampm}`;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ViewTimesPage({
  params,
}: {
  params: Promise<{ id: string; slug: string }>;
}) {
  const { slug, id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const setSelection = useBookingStore((s) => s.setSelection);
  const serviceId = searchParams.get("service") ?? "";
  const businessName = searchParams.get("businessName") ?? "";
  const businessAddress = searchParams.get("businessAddress") ?? "";
  const mode = (searchParams.get("mode") ?? "onsite") as "onsite" | "mobile";
  const isMobileMode = mode === "mobile";

  const [profile, setProfile] = useState<ApiBusinessProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [selectedExpert, setSelectedExpert] = useState("anyone");
  const [randomStaffId, setRandomStaffId] = useState<string | null>(null);
  // staff_id returned by checkStaffAvailability — used for booking when no real IDs
  const [resolvedStaffId, setResolvedStaffId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [meetUpAddress] = useState("");

  const [slots, setSlots] = useState<string[]>([]);
  const [rawSlotsMap, setRawSlotsMap] = useState<Record<string, string>>({});
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [, setSlotsError] = useState<string | null>(null);

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

  // Build expert cards:
  //  - If services have staff with real IDs → use those (supports specific availability)
  //  - Otherwise → fall back to profile.staff summary (display only)
  const experts = useMemo(() => {
    if (!profile) return [];
    if (serviceStaff.length > 0) {
      return serviceStaff.map((s) => ({
        id: s.id.toString(),
        initials: getInitials(s.name),
        name: s.name,
        picture: s.picture ?? undefined,
      }));
    }
    // Fallback: profile.staff summary — use index as display-only ID
    return (profile.staff ?? []).map((s, i) => ({
      id: `s${i}`,
      initials: getInitials(s.name),
      name: s.name,
      picture: s.picture ?? undefined,
    }));
  }, [profile, serviceStaff]);

  useEffect(() => {
    console.log("[ViewTimes] params:", { slug, id });
    fetchBusinessProfileBySlug(slug)
      .then((data) => {
        console.log("[ViewTimes] profile loaded:", data);
        setProfile(data);
        setProfileLoading(false);
      })
      .catch((err: Error) => {
        console.error("[ViewTimes] profile error:", err.message);
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
      callType = "specific";
      staffIdParam = effectiveStaffId;
    } else {
      // No real staff IDs — use "anyone" type, API picks available staff
      callType = "anyone";
      staffIdParam = undefined;
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
      console.log("[ViewTimes] checkStaffAvailability response:", result);
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
    const applyDiscount = (base: number, isDiscount: number, pct: string) => {
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
      <div className={styles.page}>
        <BackHeader title="Select Your Expert" />
        <div className={styles.centeredMsg}>
          <div className={styles.spinner} />
          <p className={styles.msgText}>Loading…</p>
        </div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className={styles.page}>
        <BackHeader title="Select Your Expert" />
        <div className={styles.centeredMsg}>
          <p className={styles.errorText}>{profileError}</p>
          <button onClick={() => router.back()} className={styles.backBtn}>
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <BackHeader title="Select Your Expert" />

      {/* Expert selector */}
      <ExpertSelector
        experts={experts}
        selectedId={selectedExpert}
        onSelect={(id) => {
          setSelectedExpert(id);
          setSelectedTime(null);
        }}
      />

      {/* Progress line + selected expert chip */}
      <div
        className={`${styles.progressLine}${slotsLoading ? ` ${styles.progressLineLoading}` : ""}`}
      />
      <div className={styles.selectedExpertRow}>
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
          setSelectedTime(null);
        }}
      />

      {/* Time slots */}
      <div className={styles.timeSlotsSection}>
        <p className={styles.sectionTitle}>Choose Time</p>
        {slotsLoading ? (
          <div className={styles.slotsLoading}>
            <div className={styles.spinner} />
            <span className={styles.msgText}>Checking availability…</span>
          </div>
        ) : slots.length > 0 ? (
          <div className={styles.timeSlotsGrid}>
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
          <p className={styles.noSlots}>
            No availability for this date — try another day
          </p>
        )}
      </div>

      {/* Additional Notes */}
      <div className={styles.formSection}>
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
      <div className={styles.ctaSection}>
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
              bookingStaffId = resolvedStaffId ?? "0";
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
            };
            console.log("[ViewTimes] setSelection payload:", selectionPayload);
            setSelection(selectionPayload);
            router.push(`/confirm-booking`);
          }}
          className={`${styles.ctaBtn}${!canBook ? ` ${styles.ctaBtnDisabled}` : ""}`}
        >
          Book Appointment
        </button>
      </div>
    </div>
  );
}
