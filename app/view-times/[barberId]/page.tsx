"use client";

import { useState, use, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BackHeader from "@/components/layout/BackHeader";
import ExpertSelector from "@/components/booking/ExpertSelector";
import BookingCalendar from "@/components/booking/BookingCalendar";
import TimeSlotButton from "@/components/ui/TimeSlotButton";
import {
  fetchBusinessProfile,
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
  // "YYYY-MM-DD" in local time (avoids UTC offset shifting the day)
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
  return minutes === "00" ? `${h12} ${ampm}` : `${h12}:${minutes} ${ampm}`;
}


/** Collect staff attached to a specific service ID from the profile */
function getStaffForService(
  profile: ApiBusinessProfile,
  serviceId: string
): ApiStaff[] {
  const svc = profile.services.find((s) => s.id.toString() === serviceId);
  return svc?.staff ?? [];
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ViewTimesPage({
  params,
}: {
  params: Promise<{ barberId: string }>;
}) {
  const { barberId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const setSelection = useBookingStore((s) => s.setSelection);
  const serviceId       = searchParams.get("service")         ?? "";
  const businessName    = searchParams.get("businessName")    ?? "";
  const businessAddress = searchParams.get("businessAddress") ?? "";

  // ── Profile (for service name/price + staff list) ────────────────────────
  const [profile, setProfile] = useState<ApiBusinessProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  // ── Selection state ──────────────────────────────────────────────────────
  const [selectedExpert, setSelectedExpert] = useState("anyone");
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [comment, setComment] = useState("");

  // ── Availability slots from API ──────────────────────────────────────────
  const [slots, setSlots] = useState<string[]>([]);
  const [rawSlotsMap, setRawSlotsMap] = useState<Record<string, string>>({});
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [, setSlotsError] = useState<string | null>(null);

  // ── Fetch business profile ────────────────────────────────────────────────
  useEffect(() => {
    fetchBusinessProfile(barberId)
      .then((data) => {
        setProfile(data);
        setProfileLoading(false);
      })
      .catch((err: Error) => {
        setProfileError(err.message ?? "Failed to load profile");
        setProfileLoading(false);
      });
  }, [barberId]);

  // ── Fetch available slots whenever date / expert / service changes ────────
  const fetchSlots = useCallback(async () => {
    if (!selectedDate || !serviceId) return;
    setSlotsLoading(true);
    setSlotsError(null);
    setSelectedTime(null);
    try {
      const result = await checkStaffAvailability({
        business_id: barberId,
        type: selectedExpert === "anyone" ? "anyone" : "specific",
        ...(selectedExpert !== "anyone"
          ? { staff_id: selectedExpert }
          : {}),
        date: toISODate(selectedDate),
        business_service_id: serviceId,
      });
        console.log("result",result.slots);
        
      // data is a single ApiStaffAvailability object — slots live directly on it
      const rawSlots: string[] = result.slots ?? [];
      const sorted = [...new Set(rawSlots)].sort();
      const displaySlotsList = sorted.map(formatSlotStart);
      const map: Record<string, string> = {};
      sorted.forEach((raw, i) => { map[displaySlotsList[i]] = raw; });
      setSlots(displaySlotsList);
      setRawSlotsMap(map);
    } catch (err) {
      setSlotsError((err as Error).message ?? "Could not load time slots");
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  }, [barberId, selectedDate, selectedExpert, serviceId]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const staffForService = profile ? getStaffForService(profile, serviceId) : [];
  const experts = staffForService.map((s) => ({
    id: s.id.toString(),
    initials: getInitials(s.name),
    name: s.name,
    picture: s.picture ?? undefined,
  }));

  const service = profile?.services.find((s) => s.id.toString() === serviceId);
  const servicePrice =
    parseFloat(service?.walk_price ?? service?.mobile_price ?? "0") || 0;

  const displaySlots = slots;
  const activeRawMap = rawSlotsMap;

  const canBook = !!(selectedDate && selectedTime);

  // ── Render ────────────────────────────────────────────────────────────────
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

      {/* Expert selector — built from real staff data */}
      <ExpertSelector
        experts={experts}
        selectedId={selectedExpert}
        onSelect={(id) => {
          setSelectedExpert(id);
          setSelectedTime(null);
        }}
      />

      {/* Date picker */}
      <BookingCalendar
        selectedDate={selectedDate}
        onDateSelect={(d) => {
          setSelectedDate(d);
          setSelectedTime(null);
        }}
      />

      {/* Time slots */}
      <div className={styles.timeSlotsSection}>
        {slotsLoading ? (
          <div className={styles.slotsLoading}>
            <div className={styles.spinner} />
            <span className={styles.msgText}>Checking availability…</span>
          </div>
        ) : displaySlots.length > 0 ? (
          <div className={styles.timeSlotsGrid}>
            {displaySlots.map((slot) => (
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

      {/* Comment */}
      <div className={styles.commentSection}>
        <label className={styles.commentLabel}>Comment</label>
        <textarea
          className={styles.commentTextarea}
          placeholder="Type here…"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
        />
      </div>

      {/* CTA */}
      <div className={styles.ctaSection}>
        <button
          onClick={() => {
            if (!canBook) return;
            const expertObj = experts.find((e) => e.id === selectedExpert);
            const staffName = expertObj?.name ?? "Anyone";
            const staffInitials = expertObj?.initials ?? "??";
            const staffId = expertObj?.id ?? "anyone";
            const staffPicture = expertObj?.picture ?? "";
            const dateStr = selectedDate
              ? selectedDate.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "";
            const rawTimeSlot = selectedTime ? (activeRawMap[selectedTime] ?? "") : "";
            const bookingDate  = selectedDate ? toISODate(selectedDate) : "";
            setSelection({
              barberId,
              serviceName:    service?.service_name ?? serviceId,
              serviceId,
              staffName,
              staffId,
              staffInitials,
              staffPicture,
              displayTime:    `${dateStr}, ${selectedTime}`,
              duration:       String(service?.time ?? ""),
              price:          String(servicePrice),
              businessName,
              businessAddress,
              rawTimeSlot,
              bookingDate,
              serviceType:    service?.service_type ?? "walkin",
            });
            router.push(`/payment/${barberId}`);
          }}
          className={`${styles.ctaBtn}${!canBook ? ` ${styles.ctaBtnDisabled}` : ""}`}
        >
          Book Appointment
        </button>
      </div>
    </div>
  );
}
