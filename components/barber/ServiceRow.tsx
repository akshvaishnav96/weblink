"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, ChevronDown, TrendingUp } from "lucide-react";
import { Service } from "@/types";
import { formatDuration, formatPrice, getPaymentLabel } from "@/lib/utils";
import BarberAvatar from "@/components/ui/BarberAvatar";
import TimeSlotButton from "@/components/ui/TimeSlotButton";
import Link from "next/link";
import { useBookingStore } from "@/store/bookingStore";
import styles from "./ServiceRow.module.css";

function getTodayLabel(): string {
  const d = new Date();
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

interface ServiceRowProps {
  service: Service;
  barberId: string;
  businessName?: string;
  businessAddress?: string;
  hideBadge?: boolean;
}

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function toRawSlot(displayTime: string, durationMins: number): string {
  const match = displayTime.match(/^(\d+)(?::(\d+))?\s*(AM|PM)$/i);
  if (!match) return "";
  let h = parseInt(match[1]);
  const m = parseInt(match[2] ?? "0");
  const ampm = match[3].toUpperCase();
  if (ampm === "PM" && h !== 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  const startMins = h * 60 + m;
  const endMins = startMins + durationMins;
  const endH = Math.floor(endMins / 60);
  const endM = endMins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}-${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;
}

export default function ServiceRow({ service, barberId, businessName = "", businessAddress = "", hideBadge = false }: ServiceRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const router = useRouter();
  const setSelection = useBookingStore((s) => s.setSelection);

  function handleSlotClick(staff: { staffId: string; staffInitials: string; staffName: string }, slot: string) {
    setSelectedSlot(slot);
    setSelection({
      barberId,
      serviceName:    service.name,
      serviceId:      service.id,
      staffName:      staff.staffName,
      staffId:        staff.staffId,
      staffInitials:  staff.staffInitials,
      staffPicture:   "",
      displayTime:    `${getTodayLabel()}, ${slot}`,
      duration:       String(service.duration),
      price:          String(service.price),
      businessName,
      businessAddress,
      rawTimeSlot:    toRawSlot(slot, service.duration),
      bookingDate:    todayISO(),
      serviceType:    service.serviceType ?? "walkin",
    });
    router.push(`/payment/${barberId}`);
  }

  const isWalkIn = service.paymentType === "WALK_IN_ONLY";

  // Only show staff section if there are actual staff entries
  const hasStaff =
    Array.isArray(service.staffAvailability) && service.staffAvailability.length > 0;

  // Only show the "Today — date" header for non-walk-in services that have staff
  const showDateHeader = !isWalkIn && hasStaff;

  // Show "View other times" for all services including walk-in
  const showViewMore = true;

  return (
    <div className={styles.row}>
      {/* Badge */}
      {!hideBadge && (
        <div
          className={`${styles.badge}${isWalkIn ? ` ${styles.badgeWalkin}` : ` ${styles.badgePay}`}`}
        >
          {isWalkIn ? (
            <>
              <svg
                width="12" height="12" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2.2"
                strokeLinecap="round" strokeLinejoin="round"
              >
                <circle cx="12" cy="4" r="1.5" />
                <path d="M9 12l1.5-4.5L13 9l2-3" />
                <path d="M7 21l2.5-5 2 2 2.5-5" />
              </svg>
              Walk-in only
            </>
          ) : (
            <>
              <span>🏠</span>
              {getPaymentLabel(service.paymentType)}
            </>
          )}
        </div>
      )}

      {/* Main row */}
      <div
        className={`${styles.main} ${styles.mainClickable}`}
        onClick={() => setExpanded((prev) => !prev)}
      >
        <div className={styles.left}>
          <div className={styles.nameRow}>
            <span className={styles.name}>{service.name}</span>
            {service.isMostPopular && (
              <span className={styles.popular}>🔥 Most Popular</span>
            )}
          </div>
          <div className={styles.duration}>
            <Clock />
            {formatDuration(service.duration)}
          </div>
          {service.nextAvailable && (
            <p className={styles.avail}>{service.nextAvailable}</p>
          )}
          {isWalkIn && !expanded && (
            <p className={styles.walkinHint}>Tap to view worker hours</p>
          )}
        </div>

        <div className={styles.right}>
          <div className={styles.priceBlock}>
            {service.originalPrice && (
              <span className={styles.priceOriginal}>
                {formatPrice(service.originalPrice)}
              </span>
            )}
            <span className={styles.price}>{formatPrice(service.price)}</span>
          </div>
          <span className={`${styles.chevron}${expanded ? ` ${styles.chevronOpen}` : ""}`}>
            <ChevronDown />
          </span>
        </div>
      </div>

      {/* Animated panel */}
      <div className={`${styles.panelWrapper}${expanded ? ` ${styles.panelWrapperOpen}` : ""}`}>
        <div className={styles.panelInner}>
          <div className={styles.panel}>

            {/* Description — only if present */}
            {service.description && (
              <p className={styles.panelDesc}>{service.description}</p>
            )}

            {/* "Today — date" header — only if there are staff slots to show */}
            {showDateHeader && (
              <p className={styles.panelDate}>Today — {getTodayLabel()}</p>
            )}

            {/* No staff available message */}
            {!hasStaff && !isWalkIn && (
              <p className={styles.noStaff}>No staff available at this time</p>
            )}

            {/* Staff rows — only if staff exists */}
            {hasStaff && service.staffAvailability!.map((staff) => (
              <div
                key={staff.staffId}
                className={isWalkIn ? styles.staffRowWalkin : styles.staffBlock}
              >
                <div className={styles.staffHeader}>
                  <BarberAvatar initials={staff.staffInitials} size="sm" />
                  <span className={styles.staffName}>{staff.staffName}</span>
                  {staff.isMostBooked && !isWalkIn && (
                    <span className={styles.staffMostBooked}>
                      <TrendingUp /> Most booked
                    </span>
                  )}
                </div>

                {isWalkIn ? (
                  staff.hours && (
                    <span className={styles.hoursRange}>{staff.hours}</span>
                  )
                ) : (
                  // Only render slots wrapper if there are actual slots
                  staff.slots && staff.slots.length > 0 && (
                    <div className={styles.staffSlots}>
                      {staff.slots.map((slot) => (
                        <TimeSlotButton
                          key={slot}
                          time={slot}
                          variant="pill"
                          selected={selectedSlot === slot}
                          onClick={() => handleSlotClick(staff, slot)}
                        />
                      ))}
                    </div>
                  )
                )}
              </div>
            ))}

            {/* "View other times" — only for non-walk-in */}
            {showViewMore && (
              <Link
                href={`/view-times/${barberId}?service=${service.id}&businessName=${encodeURIComponent(businessName)}&businessAddress=${encodeURIComponent(businessAddress)}`}
                className={styles.viewMore}
              >
                View other times →
              </Link>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}