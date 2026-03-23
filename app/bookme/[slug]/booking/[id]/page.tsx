"use client";

import { Suspense, use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Clock, CreditCard, Timer } from "lucide-react";
import styles from "./page.module.css";

type BookingStatus = "upcoming" | "cancelled";

interface Booking {
  id: number;
  service: string;
  provider: string;
  businessId: string;
  date: string;
  dateGroup: string;
  time: string;
  duration: string;
  paymentMethod: string;
  price: string;
  bookingType: string;
  verificationCode: string;
  status: BookingStatus;
  bookedFor?: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): { short: string; full: string } {
  const d = new Date(dateStr + "T00:00:00");
  const short = d.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
  const full  = d.toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  return { short, full };
}

function formatTime(timeSlot: string): string {
  const start = timeSlot.split("-")[0];
  const [h, m] = start.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12  = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

function formatPaymentMode(mode: string | null): string {
  if (!mode) return "—";
  const map: Record<string, string> = {
    cash: "Cash", card: "Card", apple_pay: "Apple Pay", upi: "UPI",
  };
  return map[mode] ?? mode;
}

function mapApiStatus(status: string): BookingStatus {
  return status === "cancelled" || status === "cancel" ? "cancelled" : "upcoming";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapApiBooking(data: any): Booking {
  const { short, full } = formatDate(data.booking_date ?? "");
  const svc = data.services?.[0];
  return {
    id:               data.id,
    service:          svc?.business_services?.service_name ?? "—",
    provider:         data.business?.business_display_name ?? "—",
    businessId:       String(data.business?.id ?? ""),
    date:             short,
    dateGroup:        full,
    time:             formatTime(data.time_slot ?? "00:00-00:00"),
    duration:         svc?.business_services?.time ? `${svc.business_services.time} min` : "—",
    paymentMethod:    formatPaymentMode(data.payment_mode),
    price:            `$${parseFloat(data.total_amount ?? "0").toFixed(2).replace(/\.00$/, "")}`,
    bookingType:      data.payment_mode && data.payment_mode !== "cash" ? "Appointment" : "Pay Onsite",
    verificationCode: data.booking_otp ?? "—",
    status:           mapApiStatus(data.status ?? ""),
    bookedFor:        data.members?.[0]?.member_name ?? undefined,
  };
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function BookingDetailPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  return (
    <Suspense fallback={<div />}>
      <BookingDetailInner params={params} />
    </Suspense>
  );
}

function BookingDetailInner({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { id, slug } = use(params);
  const router = useRouter();

  const [booking,      setBooking]      = useState<Booking | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [cancelError,  setCancelError]  = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!id) { setLoading(false); return; }
      try {
        
        const res  = await fetch(`/api/booking/details/${id}`);
        const json = await res.json();
        if (json.status && json.data) {
          setBooking(mapApiBooking(json.data));
        }
      } catch { /* ignore */ } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleConfirmCancel() {
    if (!booking) return;
    setCancellingId(booking.id);
    setConfirmingId(null);
    setCancelError(null);
    try {
      const res  = await fetch(`/api/booking/cancel/${id}`);
      const json = await res.json();
      if (!json.status) throw new Error(json.message ?? "Cancel failed");
      setBooking(prev => prev ? { ...prev, status: "cancelled" as BookingStatus } : prev);
    } catch (err) {
      setCancelError((err as Error).message ?? "Could not cancel booking. Please try again.");
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <div className={styles.pageShell}>
      <div className={styles.scrollArea}>
        {/* Header */}
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={() => router.push(`/bookme/${slug}`)} aria-label="Back">
            <ArrowLeft size={18} />
          </button>
          <h1 className={styles.title}>My Booking</h1>
        </div>

        <div className={styles.content}>
          {loading && (
            <div className={styles.empty}>
              <div className={styles.spinner} />
            </div>
          )}

          {!loading && !booking && (
            <div className={styles.empty}>
              <p className={styles.emptyText}>Booking not found.</p>
            </div>
          )}

          {cancelError && (
            <p className={styles.cancelError}>{cancelError}</p>
          )}

          {booking && (
            <>
              <p className={styles.dateGroup}>{booking.dateGroup}</p>
              <BookingCard
                booking={booking}
                cancelling={cancellingId === booking.id}
                confirming={confirmingId === booking.id}
                onRequestCancel={() => { setConfirmingId(booking.id); setCancelError(null); }}
                onKeep={() => setConfirmingId(null)}
                onConfirmCancel={() => handleConfirmCancel()}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── BookingCard ─────────────────────────────────────────────────────────────

function BookingCard({
  booking,
  cancelling,
  confirming,
  onRequestCancel,
  onKeep,
  onConfirmCancel,
}: {
  booking: Booking & { bookedFor?: string };
  cancelling?: boolean;
  confirming?: boolean;
  onRequestCancel?: () => void;
  onKeep?: () => void;
  onConfirmCancel?: () => void;
}) {
  const isUpcoming  = booking.status === "upcoming";
  const isCancelled = booking.status === "cancelled";

  return (
    <div className={`${styles.card} ${isCancelled ? styles.cardCancelled : ""}`}>
      {/* Service + provider */}
      <div className={styles.cardHeader}>
        <div>
          <p className={styles.cardService}>{booking.service}</p>
          <p className={styles.cardProvider}>{booking.provider}</p>
        </div>
      </div>

      {/* Meta grid: 2 columns */}
      <div className={styles.metaGrid}>
        <div className={styles.metaCol}>
          <div className={styles.metaRow}>
            <Calendar size={14} className={styles.metaIcon} />
            <span>{booking.date}</span>
          </div>
          <div className={styles.metaRow}>
            <CreditCard size={14} className={styles.metaIcon} />
            <span>{booking.paymentMethod}</span>
          </div>
        </div>
        <div className={styles.metaCol}>
          <div className={styles.metaRow}>
            <Clock size={14} className={styles.metaIcon} />
            <span>{booking.time}</span>
          </div>
          <div className={styles.metaRow}>
            <Timer size={14} className={styles.metaIcon} />
            <span>{booking.duration}</span>
          </div>
        </div>
      </div>

      {/* Type badge + price */}
      <div className={styles.cardFooterRow}>
        <span className={styles.typeBadge}>{booking.bookingType}</span>
        <span className={styles.price}>{booking.price}</span>
      </div>

      {/* Booked for (member) */}
      {/* {booking.bookedFor && (
        <div className={styles.verificationRow}>
          <span className={styles.verificationLabel}>Booked for</span>
          <span className={styles.verificationCode}>{booking.bookedFor}</span>
        </div>
      )} */}

      {/* Verification code */}
      <div className={styles.verificationRow}>
        <span className={styles.verificationLabel}>Verification Code</span>
        <span className={styles.verificationCode}>{booking.verificationCode}</span>
      </div>

      {/* Cancel button / inline confirm */}
      {isUpcoming && !confirming && (
        <button className={styles.cancelBtn} onClick={onRequestCancel} disabled={cancelling}>
          {cancelling ? "Cancelling…" : "Cancel Booking"}
        </button>
      )}

      {isUpcoming && confirming && (
        <div className={styles.cancelConfirm}>
          <p className={styles.cancelConfirmTitle}>Cancel this booking?</p>
          <p className={styles.cancelConfirmSub}>50% fee applies within 12 hrs of appointment.</p>
          <div className={styles.cancelConfirmBtns}>
            <button className={styles.keepBtn} onClick={onKeep}>Keep</button>
            <button className={styles.confirmCancelBtn} onClick={onConfirmCancel}>Confirm Cancel</button>
          </div>
        </div>
      )}

      {isCancelled && (
        <div className={styles.cancelledBtn}>Cancelled</div>
      )}
    </div>
  );
}
