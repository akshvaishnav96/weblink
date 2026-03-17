"use client";

import { useState, use, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MapPin, User } from "lucide-react";
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

  const [profile, setProfile] = useState<ApiBusinessProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [selectedExpert, setSelectedExpert] = useState("anyone");
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [meetUpAddress, setMeetUpAddress] = useState("");

  const [slots, setSlots] = useState<string[]>([]);
  const [rawSlotsMap, setRawSlotsMap] = useState<Record<string, string>>({});
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [, setSlotsError] = useState<string | null>(null);

  useEffect(() => {
    fetchBusinessProfile(barberId)
      .then((data) => { setProfile(data); setProfileLoading(false); })
      .catch((err: Error) => { setProfileError(err.message ?? "Failed to load profile"); setProfileLoading(false); });
  }, [barberId]);

  const fetchSlots = useCallback(async () => {
    if (!selectedDate || !serviceId) return;
    setSlotsLoading(true);
    setSlotsError(null);
    setSelectedTime(null);
    try {
      const result = await checkStaffAvailability({
        business_id: barberId,
        type: selectedExpert === "anyone" ? "anyone" : "specific",
        ...(selectedExpert !== "anyone" ? { staff_id: selectedExpert } : {}),
        date: toISODate(selectedDate),
        business_service_id: serviceId,
      });
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

  useEffect(() => { fetchSlots(); }, [fetchSlots]);

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

  const canBook = !!(selectedDate && selectedTime);

  const selectedExpertName =
    selectedExpert === "anyone"
      ? "Anyone"
      : experts.find((e) => e.id === selectedExpert)?.name ?? "Anyone";

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
          <button onClick={() => router.back()} className={styles.backBtn}>Go back</button>
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
        onSelect={(id) => { setSelectedExpert(id); setSelectedTime(null); }}
      />

      {/* Progress line + selected expert chip */}
      <div className={`${styles.progressLine}${slotsLoading ? ` ${styles.progressLineLoading}` : ""}`} />
      <div className={styles.selectedExpertRow}>
        <div className={styles.selectedExpertChip}>
          <User size={12} />
          <span>{selectedExpertName}</span>
        </div>
      </div>

      {/* Calendar */}
      <BookingCalendar
        selectedDate={selectedDate}
        onDateSelect={(d) => { setSelectedDate(d); setSelectedTime(null); }}
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
          <p className={styles.noSlots}>No availability for this date — try another day</p>
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

      {/* Meet Up Address */}
      <div className={styles.formSection}>
        <label className={styles.formLabel}>Meet Up Address</label>
        <div className={styles.addressWrapper}>
          <input
            className={styles.addressInput}
            placeholder="Enter your address..."
            value={meetUpAddress}
            onChange={(e) => setMeetUpAddress(e.target.value)}
          />
          <MapPin size={16} className={styles.addressIcon} />
        </div>
      </div>

      {/* Book button */}
      <div className={styles.ctaSection}>
        <button
          onClick={() => {
            if (!canBook) return;
            const expertObj = experts.find((e) => e.id === selectedExpert);
            const staffName      = expertObj?.name     ?? "Anyone";
            const staffInitials  = expertObj?.initials ?? "??";
            const staffId        = expertObj?.id       ?? "anyone";
            const staffPicture   = expertObj?.picture  ?? "";
            const dateStr = selectedDate
              ? selectedDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })
              : "";
            const rawTimeSlot = selectedTime ? (rawSlotsMap[selectedTime] ?? "") : "";
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
              notes:          notes || undefined,
              meetUpAddress:  meetUpAddress || undefined,
            });
            router.push(`/payment/${barberId}`);
          }}
          className={`${styles.ctaBtn}${!canBook ? ` ${styles.ctaBtnDisabled}` : ""}`}
        >
          Book Appointment
        </button>
      </div>

      <p className={styles.poweredBy}>Powered by Valet Vault</p>
    </div>
  );
}
