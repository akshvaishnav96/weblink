"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Clock, CreditCard, Timer } from "lucide-react";
import styles from "./page.module.css";

type BookingStatus = "upcoming" | "completed" | "cancelled";
type BookingType   = "Appointment" | "Pay Onsite" | "Walk-in";

interface Booking {
  id: string;
  service: string;
  provider: string;
  date: string;          // e.g. "Mar 6, 2025"
  dateGroup: string;     // e.g. "Thursday, March 6, 2025"
  time: string;          // e.g. "2:30 PM"
  duration: string;      // e.g. "45 min"
  paymentMethod: string; // e.g. "Apple Pay"
  price: string;         // e.g. "$35"
  bookingType: BookingType;
  verificationCode: string;
  status: BookingStatus;
}

const BOOKINGS: Booking[] = [
  {
    id: "1",
    service: "The Works",
    provider: "VV's Barbershop",
    date: "Mar 6, 2025",
    dateGroup: "Thursday, March 6, 2025",
    time: "2:30 PM",
    duration: "45 min",
    paymentMethod: "Apple Pay",
    price: "$35",
    bookingType: "Appointment",
    verificationCode: "4821",
    status: "upcoming",
  },
  {
    id: "2",
    service: "Shape Up",
    provider: "VV's Barbershop",
    date: "Feb 22, 2025",
    dateGroup: "Saturday, February 22, 2025",
    time: "11:00 AM",
    duration: "30 min",
    paymentMethod: "Apple Pay",
    price: "$25",
    bookingType: "Pay Onsite",
    verificationCode: "3310",
    status: "cancelled",
  },
];

export default function BookingsPage() {
  const router = useRouter();
  const [bookings,       setBookings]       = useState<Booking[]>(BOOKINGS);
  const [confirmingId,   setConfirmingId]   = useState<string | null>(null);
  const [cancellingId,   setCancellingId]   = useState<string | null>(null);

  const upcoming  = bookings.filter((b) => b.status === "upcoming");
  const cancelled = bookings.filter((b) => b.status === "cancelled");

  const handleConfirmCancel = (id: string) => {
    setCancellingId(id);
    setConfirmingId(null);
    setTimeout(() => {
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "cancelled" as BookingStatus } : b))
      );
      setCancellingId(null);
    }, 500);
  };

  return (
    <div className={styles.pageShell}>
      <div className={styles.scrollArea}>
        {/* Header */}
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={() => router.back()} aria-label="Back">
            <ArrowLeft size={18} />
          </button>
          <h1 className={styles.title}>My Bookings</h1>
        </div>

        <div className={styles.content}>
          {/* Upcoming section */}
          {upcoming.length > 0 && (
            <section className={styles.section}>
              <p className={styles.sectionLabelUpcoming}>Upcoming</p>
              {upcoming.map((b) => (
                <div key={b.id}>
                  <p className={styles.dateGroup}>{b.dateGroup}</p>
                  <BookingCard
                    booking={b}
                    cancelling={cancellingId === b.id}
                    confirming={confirmingId === b.id}
                    onRequestCancel={() => setConfirmingId(b.id)}
                    onKeep={() => setConfirmingId(null)}
                    onConfirmCancel={() => handleConfirmCancel(b.id)}
                  />
                </div>
              ))}
            </section>
          )}

          {/* Cancelled section */}
          {cancelled.length > 0 && (
            <section className={styles.section}>
              <p className={styles.sectionLabelCancelled}>Cancelled</p>
              {cancelled.map((b) => (
                <div key={b.id}>
                  <BookingCard booking={b} />
                </div>
              ))}
            </section>
          )}

          {bookings.length === 0 && (
            <div className={styles.empty}>
              <p className={styles.emptyText}>No bookings yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BookingCard({
  booking,
  cancelling,
  confirming,
  onRequestCancel,
  onKeep,
  onConfirmCancel,
}: {
  booking: Booking;
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

      {/* Verification code */}
      <div className={styles.verificationRow}>
        <span className={styles.verificationLabel}>Verification Code</span>
        <span className={styles.verificationCode}>{booking.verificationCode}</span>
      </div>

      {/* Upcoming: cancel button or inline confirmation */}
      {isUpcoming && !confirming && (
        <button
          className={styles.cancelBtn}
          onClick={onRequestCancel}
          disabled={cancelling}
        >
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
