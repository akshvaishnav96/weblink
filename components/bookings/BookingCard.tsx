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
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

const STATUS_CLASS: Record<BookingStatus, string> = {
  confirmed: "border-l-[3px] border-l-[var(--color-primary)]",
  completed: "border-l-[3px] border-l-[#4CAF50]",
  cancelled: "border-l-[3px] border-l-[#BBBBBB] opacity-[.85]",
};

const BADGE_CLASS: Record<BookingStatus, string> = {
  confirmed: "bg-[var(--color-primary-bg)] text-[var(--color-primary)]",
  completed: "bg-[#EBF5EB] text-[#388E3C]",
  cancelled: "bg-[#F5F5F5] text-[#999999]",
};

export default function BookingCard({ booking }: BookingCardProps) {
  const isUpcoming  = booking.status === "confirmed";
  const isCompleted = booking.status === "completed";
  const isCancelled = booking.status === "cancelled";

  return (
    <div className={`${styles.card} ${STATUS_CLASS[booking.status]}`}>
      {/* Header row */}
      <div className="flex items-center gap-[var(--sp-3)]">
        <BarberAvatar initials={booking.barberInitials} size="md" />
        <div className="flex-1 min-w-0 flex flex-col gap-[2px]">
          <span className="text-[var(--text-sm)] font-bold text-[var(--color-text-primary)] whitespace-nowrap overflow-hidden text-ellipsis md:text-[var(--text-base)]">
            {booking.barberName}
          </span>
          <span className="text-[12px] text-[var(--color-text-muted)] md:text-[var(--text-sm)]">
            {booking.service}
          </span>
        </div>
        <span className={`flex-shrink-0 text-[11px] font-semibold py-[3px] px-[9px] rounded-full md:text-[12px] md:py-[4px] md:px-[12px] ${BADGE_CLASS[booking.status]}`}>
          {STATUS_LABELS[booking.status]}
        </span>
      </div>

      {/* Meta row — metaItem svg child selector kept in CSS module */}
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
      <div className="flex items-center justify-between pt-[var(--sp-1)]">
        <span className="text-[var(--text-base)] font-bold text-[var(--color-primary)] md:text-[var(--text-md)]">
          ${booking.price}
        </span>
        <div className="flex gap-[var(--sp-2)]">
          {isUpcoming && (
            <>
              {/* btn/btnGhost: hover states — kept in CSS module */}
              <button className={`${styles.btn} ${styles.btnGhost}`}>Cancel</button>
              <Link
                href={`/bookme/${booking.barberId}/view-times`}
                className={`${styles.btn} ${styles.btnPrimary}`}
              >
                Reschedule
              </Link>
            </>
          )}
          {isCompleted && (
            <Link
              href={`/bookme/${booking.barberId}/view-times`}
              className={`${styles.btn} ${styles.btnPrimary}`}
            >
              Book Again
            </Link>
          )}
          {isCancelled && (
            <Link
              href={`/bookme/${booking.barberId}/view-times`}
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
