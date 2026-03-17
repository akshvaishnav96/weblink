"use client";

import Link from "next/link";
import { MapPin, Clock, Calendar } from "lucide-react";
import { Booking, BookingStatus } from "@/types";
import BarberAvatar from "@/components/ui/BarberAvatar";
import { formatDuration } from "@/lib/utils";
import styles from "./BookingCard.module.css";

interface BookingCardProps {
  booking: Booking;
}

const STATUS_LABELS: Record<BookingStatus, string> = {
  confirmed:  "Confirmed",
  completed:  "Completed",
  cancelled:  "Cancelled",
};

const STATUS_CLASS: Record<BookingStatus, string> = {
  confirmed: styles.confirmed,
  completed: styles.completed,
  cancelled: styles.cancelled,
};

const BADGE_CLASS: Record<BookingStatus, string> = {
  confirmed: styles.badgeConfirmed,
  completed: styles.badgeCompleted,
  cancelled: styles.badgeCancelled,
};

export default function BookingCard({ booking }: BookingCardProps) {
  const isUpcoming  = booking.status === "confirmed";
  const isCompleted = booking.status === "completed";
  const isCancelled = booking.status === "cancelled";

  return (
    <div className={`${styles.card} ${STATUS_CLASS[booking.status]}`}>
      {/* Header row */}
      <div className={styles.header}>
        <BarberAvatar initials={booking.barberInitials} size="md" />
        <div className={styles.headerInfo}>
          <span className={styles.barberName}>{booking.barberName}</span>
          <span className={styles.service}>{booking.service}</span>
        </div>
        <span className={`${styles.badge} ${BADGE_CLASS[booking.status]}`}>
          {STATUS_LABELS[booking.status]}
        </span>
      </div>

      {/* Meta row */}
      <div className={styles.meta}>
        <span className={styles.metaItem}>
          <Calendar />
          {booking.date}
        </span>
        <span className={styles.metaItem}>
          <Clock />
          {booking.time} · {formatDuration(booking.duration)}
        </span>
        <span className={styles.metaItem}>
          <MapPin />
          {booking.address}
        </span>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <span className={styles.price}>${booking.price}</span>
        <div className={styles.actions}>
          {isUpcoming && (
            <>
              <button className={`${styles.btn} ${styles.btnGhost}`}>
                Cancel
              </button>
              <Link
                href={`/view-times/${booking.barberId}`}
                className={`${styles.btn} ${styles.btnPrimary}`}
              >
                Reschedule
              </Link>
            </>
          )}
          {isCompleted && (
            <Link
              href={`/view-times/${booking.barberId}`}
              className={`${styles.btn} ${styles.btnPrimary}`}
            >
              Book Again
            </Link>
          )}
          {isCancelled && (
            <Link
              href={`/view-times/${booking.barberId}`}
              className={`${styles.btn} ${styles.btnGhost}`}
            >
              Rebook
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
