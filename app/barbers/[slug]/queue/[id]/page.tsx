"use client";

import { Suspense, use, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Clock, CreditCard, Layers, Timer } from "lucide-react";
import styles from "./page.module.css";
import { API_ENDPOINTS } from "@/lib/api-endpoints";

type BookingStatus = "waiting" | "cancelled" | "completed" | string;

interface QueueBooking {
  id: string | number;
  service: string;
  provider: string;
  date: string;
  dateGroup: string;
  duration: string;
  paymentMethod: string;
  price: string;
  status: BookingStatus;
  queuePosition?: number;
}

function formatDate(dateStr: string): { short: string; long: string } {
  try {
    const d = new Date(dateStr + "T00:00:00");
    const short = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
    const long  = d.toLocaleDateString("en-US", { weekday: "long",  month: "long",  day: "numeric", year: "numeric" });
    return { short, long };
  } catch {
    return { short: dateStr, long: dateStr };
  }
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function QueueDetailPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  return (
    <Suspense fallback={<div />}>
      <QueueDetailInner params={params} />
    </Suspense>
  );
}

function QueueDetailInner({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { id, slug } = use(params);
  const router = useRouter();

  const [booking,    setBooking]    = useState<QueueBooking | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [leaving,    setLeaving]    = useState(false);
  const [leaveError, setLeaveError] = useState<string | null>(null);

  const fetchBooking = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(API_ENDPOINTS.QUEUE_DETAILS(id));
      const json = await res.json();
      const data = json.data ?? json;

      const serviceName = data.services?.[0]?.business_services?.service_name ?? "Queue Service";
      const provider    = data.business?.business_display_name ?? "";
      const dates       = formatDate(data.booking_date ?? "");
      const durationMin = data.duration ?? data.services?.[0]?.business_services?.time ?? "";
      const pm          = data.payment_mode ?? "";
      const price       = data.total_amount != null ? `$${Number(data.total_amount).toFixed(2)}` : "";
      const status: BookingStatus = data.status ?? "waiting";
      const queuePosition = data.queue_order != null ? Number(data.queue_order) : undefined;

      setBooking({
        id,
        service:       serviceName,
        provider,
        date:          dates.short,
        dateGroup:     dates.long,
        duration:      durationMin ? `${durationMin} min` : "",
        paymentMethod: pm ? pm.charAt(0).toUpperCase() + pm.slice(1) : "",
        price,
        status,
        queuePosition,
      });
    } catch {
      setBooking(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchBooking(); }, [fetchBooking]);

  async function handleConfirmLeave() {
    setLeaving(true);
    setConfirming(false);
    setLeaveError(null);
    try {
      const res  = await fetch(API_ENDPOINTS.QUEUE_ACTION(id), {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ action: "cancel" }),
      });
      const json = await res.json();
      if (json.status === false) {
        setLeaveError(json.message ?? "Failed to leave queue.");
        setConfirming(true);
      } else {
        setBooking(prev => prev ? { ...prev, status: "cancelled" } : prev);
      }
    } catch {
      setLeaveError("Network error. Please try again.");
      setConfirming(true);
    } finally {
      setLeaving(false);
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
          <h1 className="text-[18px] font-bold text-[#1a1a1a] m-0 md:text-[20px] flex items-center gap-[8px]"><Layers color="#B8860B" />  My Bookings</h1>
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

          {leaveError && (
            <p className="text-[13px] text-[#c0392b] bg-[#fdf2f2] border border-[#f5c6cb] rounded-[8px] py-[10px] px-[14px] mx-[16px] mb-[8px] text-center">
              {leaveError}
            </p>
          )}

          {!loading && booking && (
            <>
              <p className="text-[13px] font-semibold text-[#5a5a5a] text-center m-0 mb-[10px]" style={{ fontWeight: "bold" }}>
                {booking.dateGroup}
              </p>
              <QueueCard
                booking={booking}
                slug={slug}
                leaving={leaving}
                confirming={confirming}
                onRequestLeave={() => { setConfirming(true); setLeaveError(null); }}
                onKeep={() => setConfirming(false)}
                onConfirmLeave={handleConfirmLeave}
              />
            </>
          )}

        </div>
      </div>
    </div>
  );
}

// ── QueueCard ────────────────────────────────────────────────────────────────

function QueueCard({
  booking,
  slug,
  leaving,
  confirming,
  onRequestLeave,
  onKeep,
  onConfirmLeave,
}: {
  booking: QueueBooking;
  slug: string;
  leaving: boolean;
  confirming: boolean;
  onRequestLeave: () => void;
  onKeep: () => void;
  onConfirmLeave: () => void;
}) {
  const router      = useRouter();
  const isActive    = booking.status === "waiting";
  const isCancelled = booking.status === "cancelled";

  return (
    <div className={isCancelled
      ? "bg-[#FFF8F8] border border-[#FDDEDE] rounded-[14px] p-[16px] mb-[12px] md:p-[20px] md:rounded-[16px]"
      : "bg-white border border-[#EEEBE5] rounded-[14px] p-[16px] mb-[12px] md:p-[20px] md:rounded-[16px]"
    }>

      {/* Service + provider */}
      <div className="mb-[14px]">
        <p style={{ fontWeight: "bold" }} className="text-[15px] font-bold text-[#1a1a1a] m-0 mb-[3px] leading-[1.3] md:text-[16px]">
          {booking.service}
        </p>
        <p className="text-[13px] text-[#7a7060] m-0">{booking.provider}</p>
      </div>

      {/* Meta grid */}
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
            <Timer size={14} className="text-[#B8860B] flex-shrink-0" />
            <span>{booking.duration}</span>
          </div>
        </div>
      </div>

      {/* Live Queue banner */}
      {isActive && (
        <button
          onClick={() => router.push(`/barbers/${slug}/queue/${booking.id}/status`)}
          className="w-full flex items-center justify-between py-[12px] px-[14px] mb-[12px] bg-[#f0fdf4] border border-[#16a34a] rounded-[10px] cursor-pointer"
        >
          <div className="flex items-center gap-[8px]">
            <span className={styles.liveDot} />
            <span className="text-[13px] font-semibold text-[#15803d]">
             Live Queue{booking.queuePosition != null ? ` — Position #${booking.queuePosition}` : ""}
            </span>
          </div>
          <span className="text-[13px] font-semibold text-[#15803d]">View →</span>
        </button>
      )}

      {/* Price */}
      <div className="flex items-center justify-end mb-[12px]">
        <span className="text-[17px] font-bold text-[#B8860B] md:text-[18px] ">{booking.price}</span>
      </div>

      {/* Leave Queue button */}
      {isActive && !confirming && (
        <button className={styles.leaveBtn} onClick={onRequestLeave} disabled={leaving}>
          {leaving ? "Leaving…" : "Leave Queue"}
        </button>
      )}

      {/* Inline confirm */}
      {isActive && confirming && (
        <div className="bg-[#FFF5F5] border border-[#FDDEDE] rounded-[10px] p-[14px] pb-[12px]">
          <p className="text-[14px] font-semibold text-[#1a1a1a] m-0 mb-[12px]">Leave the queue?</p>
          <div className="flex gap-[10px]">
            <button className={styles.keepBtn} onClick={onKeep}>Keep</button>
            <button className={styles.confirmLeaveBtn} onClick={onConfirmLeave} disabled={leaving}>
              {leaving ? "Leaving…" : "Leave Queue"}
            </button>
          </div>
        </div>
      )}

      {isCancelled && (
        <div className="flex items-center justify-center w-full py-[13px] px-[16px] rounded-[10px] bg-[#FDDEDE] text-[#C0392B] text-[14px] font-medium min-h-[44px]">
          Left Queue
        </div>
      )}

    </div>
  );
}
