"use client";

import { Suspense, use, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Clock, CreditCard, Layers, Timer } from "lucide-react";
import styles from "./page.module.css";
// TODO: import { API_ENDPOINTS } from "@/lib/api-endpoints";

type BookingStatus = "upcoming" | "cancelled";

interface QueueBooking {
  id: number;
  service: string;
  provider: string;
  date: string;
  dateGroup: string;
  duration: string;
  paymentMethod: string;
  price: string;
  verificationCode: string;
  status: BookingStatus;
  queuePosition?: number;
}

// ── Dummy data — replace with API call when ready ─────────────────────────
const DUMMY_BOOKING: QueueBooking = {
  id:               1,
  service:          "Haircut & Style",
  provider:         "Haircut Studio",
  date:             "Tue, Nov 25, 2025",
  dateGroup:        "Tuesday, November 25, 2025",
  duration:         "45 min",
  paymentMethod:    "Card",
  price:            "$45",
  verificationCode: "7842",
  status:           "upcoming",
  queuePosition:    1,
};

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

  // TODO: replace with API fetch when ready
  const [booking,    setBooking]    = useState<QueueBooking>(DUMMY_BOOKING);
  const [loading]                   = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [leaving,    setLeaving]    = useState(false);
  const [leaveError, setLeaveError] = useState<string | null>(null);

  // TODO: handleConfirmLeave — wire up API_ENDPOINTS.BOOKING_CANCEL(id)
  function handleConfirmLeave() {
    setLeaving(true);
    setConfirming(false);
    setLeaveError(null);
    // Simulate leave with dummy state update
    setTimeout(() => {
      setBooking(prev => ({ ...prev, status: "cancelled" }));
      setLeaving(false);
    }, 800);
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

          {booking && (
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
  const isUpcoming  = booking.status === "upcoming";
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
      {isUpcoming && (
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

      {/* Verification code */}
      {/* <div className="flex items-center justify-between py-[10px] px-[12px] bg-[#F7F5F1] rounded-[8px] mb-[12px]">
        <span className="text-[13px] text-[#7a7060]">Verification Code</span>
        <span className="text-[13px] font-semibold text-[#1a1a1a] tracking-[0.04em]" style={{ fontWeight: "bold" }}>
          {booking.verificationCode}
        </span>
      </div> */}

      {/* Leave Queue button */}
      {/* {isUpcoming && !confirming && (
        <button className={styles.leaveBtn} onClick={onRequestLeave} disabled={leaving}>
          {leaving ? "Leaving…" : "Leave Queue"}
        </button>
      )} */}

      {/* Inline confirm */}
      {isUpcoming && confirming && (
        <div className="bg-[#FFF5F5] border border-[#FDDEDE] rounded-[10px] p-[14px] pb-[12px]">
          <p className="text-[14px] font-semibold text-[#1a1a1a] m-0 mb-[12px]">Leave the queue?</p>
          <div className="flex gap-[10px]">
            <button className={styles.keepBtn} onClick={onKeep}>Keep</button>
            <button className={styles.confirmLeaveBtn} onClick={onConfirmLeave}>Leave Queue</button>
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
