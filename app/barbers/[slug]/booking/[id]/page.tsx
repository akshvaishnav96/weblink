"use client";

import { Suspense, use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Clock, CreditCard, Timer } from "lucide-react";
import styles from "./page.module.css";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { formatBookingDate, formatApiTime } from "@/lib/utils";

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
  const { short, full } = formatBookingDate(data.booking_date ?? "");
  const svc = data.services?.[0];
  return {
    id:               data.id,
    service:          svc?.business_services?.service_name ?? "—",
    provider:         data.business?.business_display_name ?? "—",
    businessId:       String(data.business?.id ?? ""),
    date:             short,
    dateGroup:        full,
    time:             formatApiTime((data.time_slot ?? "00:00-00:00").split("-")[0]),
    duration:         svc?.business_services?.time ? `${svc.business_services.time} min` : "—",
    paymentMethod:    formatPaymentMode(data.payment_mode),
    price:            `$${parseFloat(data.total_amount ?? "0").toFixed(2).replace(/\.00$/, "")}`,
    bookingType:      data.payment_mode && data.payment_mode !== "cash" ? "Appointment" : "Pay On Arrival",
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
        const res  = await fetch(API_ENDPOINTS.BOOKING_DETAILS(id));
        const json = await res.json();
        if (json.status && json.data) {
          setBooking(mapApiBooking(json.data));
        }
      } catch (err) {
        console.warn("[BookingDetails] Failed to load booking:", err);
      } finally {
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
      const res  = await fetch(API_ENDPOINTS.BOOKING_CANCEL(id));
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
    <div className="flex flex-col min-h-[100dvh]">
      <div className="flex-1 overflow-y-auto [-webkit-overflow-scrolling:touch]">
        {/* Header */}
        <div className="flex items-center gap-[12px] py-[16px] px-[16px] pb-[14px] bg-white border-b border-[#EEEBE5] sticky top-0 z-[10] md:py-[20px] md:px-[24px] md:pb-[16px]">
          <button className={styles.backBtn} onClick={() => router.push(`/barbers/${slug}`)} aria-label="Back">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-[18px] font-bold text-[#1a1a1a] m-0 md:text-[20px]">My Booking</h1>
        </div>

        <div className="pt-[20px] px-[16px] pb-[32px] md:p-[24px] md:pb-[40px] lg:pt-[28px] lg:px-[32px] lg:pb-[48px]">
          {loading && (
            <div className="flex items-center justify-center py-[80px] px-[16px]">
              <div className={styles.spinner} />
            </div>
          )}

          {!loading && !booking && (
            <div className="flex items-center justify-center py-[80px] px-[16px]">
              <p className="text-[14px] text-[#9a9080]">Booking not found.</p>
            </div>
          )}

          {cancelError && (
            <p className="text-[13px] text-[#c0392b] bg-[#fdf2f2] border border-[#f5c6cb] rounded-[8px] py-[10px] px-[14px] mx-[16px] mb-[8px] text-center">
              {cancelError}
            </p>
          )}

          {booking && (
            <>
              <p className="text-[13px] font-semibold text-[#5a5a5a] text-center m-0 mb-[10px]" style={{fontWeight:"bold"}}>{booking.dateGroup}</p>
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
    <div className={isCancelled
      ? "bg-[#FFF8F8] border border-[#FDDEDE] rounded-[14px] p-[16px] mb-[12px] md:p-[20px] md:rounded-[16px]"
      : "bg-white border border-[#EEEBE5] rounded-[14px] p-[16px] mb-[12px] md:p-[20px] md:rounded-[16px]"
    }>
      {/* Service + provider */}
      <div className="mb-[14px]">
        <div>
          <p style={{fontWeight:"bold"}} className="text-[15px] font-bold text-[#1a1a1a] m-0 mb-[3px] leading-[1.3] md:text-[16px]">
            {booking.service}
          </p>
          <p className="text-[13px] text-[#7a7060] m-0">{booking.provider}</p>
        </div>
      </div>

      {/* Meta grid: 2 columns */}
      <div className="grid grid-cols-2 gap-x-[12px] gap-y-[8px] mb-[14px]">
        <div className="flex flex-col gap-[7px]">
          <div className="flex items-center gap-[7px] text-[13px] text-[#5a5a5a] md:text-[14px]">
            <Calendar size={14} className="text-[#B8860B] flex-shrink-0" />
            <span>{booking.date}</span>
          </div>
          <div className="flex items-center gap-[7px] text-[13px] text-[#5a5a5a] md:text-[14px]">
            <CreditCard size={14} className="text-[#B8860B] flex-shrink-0" />
            <span>{booking.paymentMethod}</span>
          </div>
        </div>
        <div className="flex flex-col gap-[7px]">
          <div className="flex items-center gap-[7px] text-[13px] text-[#5a5a5a] md:text-[14px]">
            <Clock size={14} className="text-[#B8860B] flex-shrink-0" />
            <span>{booking.time}</span>
          </div>
          <div className="flex items-center gap-[7px] text-[13px] text-[#5a5a5a] md:text-[14px]">
            <Timer size={14} className="text-[#B8860B] flex-shrink-0" />
            <span>{booking.duration}</span>
          </div>
        </div>
      </div>

      {/* Type badge + price */}
      <div className="flex items-center justify-between mb-[12px]">
        <span className="inline-flex items-center py-[3px] px-[11px] rounded-[20px] border-[1.5px] border-[#D1C9B8] bg-transparent text-[12px] font-medium text-[#5a5050]">
          {booking.bookingType}
        </span>
        <span className="text-[17px] font-bold text-[#B8860B] md:text-[18px]">{booking.price}</span>
      </div>

      {/* Verification code */}
      <div className="flex items-center justify-between py-[10px] px-[12px] bg-[#F7F5F1] rounded-[8px] mb-[12px]">
        <span className="text-[13px] text-[#7a7060]">Verification Code</span>
        <span className="text-[13px] font-semibold text-[#1a1a1a] tracking-[0.04em]" style={{fontWeight:"bold"}}>
          {booking.verificationCode}
        </span>
      </div>

      {/* Cancel button / inline confirm */}
      {isUpcoming && !confirming && (
        <button className={styles.cancelBtn} onClick={onRequestCancel} disabled={cancelling}>
          {cancelling ? "Cancelling…" : "Cancel Booking"}
        </button>
      )}

      {isUpcoming && confirming && (
        <div className="bg-[#FFF5F5] border border-[#FDDEDE] rounded-[10px] p-[14px] pb-[12px]">
          <p className="text-[14px] font-semibold text-[#1a1a1a] m-0 mb-[4px]">Cancel this booking?</p>
          {booking.paymentMethod !== "Cash" && (
            <p className="text-[12.5px] text-[#7a6060] m-0 mb-[12px]">50% fee applies within 12 hrs of appointment.</p>
          )}
          <div className="flex gap-[10px]">
            <button className={styles.keepBtn} onClick={onKeep}>Keep</button>
            <button className={styles.confirmCancelBtn} onClick={onConfirmCancel}>Confirm Cancel</button>
          </div>
        </div>
      )}

      {isCancelled && (
        <div className="flex items-center justify-center w-full py-[13px] px-[16px] rounded-[10px] bg-[#FDDEDE] text-[#C0392B] text-[14px] font-medium min-h-[44px]">
          Cancelled
        </div>
      )}
    </div>
  );
}
