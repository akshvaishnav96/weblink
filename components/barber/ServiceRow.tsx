"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Clock, ChevronDown, TrendingUp } from "lucide-react";
import { Service } from "@/types";
import { formatDuration, formatPrice, getPaymentLabel, toISODate } from "@/lib/utils";
import BarberAvatar from "@/components/ui/BarberAvatar";
import TimeSlotButton from "@/components/ui/TimeSlotButton";
import Link from "next/link";
import { useBookingStore } from "@/store/bookingStore";
import { trackStaffSelected } from "@/lib/analytics";
import styles from "./ServiceRow.module.css";

function getTodayLabel(): string {
  const tz = process.env.NEXT_PUBLIC_TIMEZONE ?? "Australia/Sydney";
  return new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    weekday:  "short",
    month:    "short",
    day:      "numeric",
  }).format(new Date());
}

interface ServiceRowProps {
  service: Service;
  businessId: string;
  barberSlug?: string;
  businessName?: string;
  businessAddress?: string;
  userId?: string | null;
  hideBadge?: boolean;
  expanded?: boolean;
  onToggle?: () => void;
  serviceMode?: "onsite" | "mobile";
}

function todayISO(): string {
  return toISODate(new Date());
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

export default function ServiceRow({ service, businessId, barberSlug = "", businessName = "", businessAddress = "", userId = null, hideBadge = false, expanded: externalExpanded, onToggle, serviceMode = "onsite" }: ServiceRowProps) {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ staffId: string; slot: string } | null>(null);
  const lastStaffRef = useRef<string | null>(null);

  const expanded = externalExpanded !== undefined ? externalExpanded : internalExpanded;
  const handleToggle = onToggle ?? (() => setInternalExpanded((prev) => !prev));
  const router = useRouter();
  const setSelection = useBookingStore((s) => s.setSelection);

  function handleSlotClick(staff: { staffId: string; staffInitials: string; staffName: string }, slot: string) {
    setSelectedSlot({ staffId: staff.staffId, slot });
    trackStaffSelected(lastStaffRef, staff.staffId, staff.staffName, barberSlug, service.id, businessId, service.name);
    setSelection({
      barberId: businessId,
      barberSlug,
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
      userId,
    });
    router.push(`/barbers/${barberSlug}/confirm-booking`);
  }

  const isWalkIn = service.paymentType === "WALK_IN_ONLY";

  const hasStaff =
    Array.isArray(service.staffAvailability) && service.staffAvailability.length > 0;

  const showDateHeader = !isWalkIn && hasStaff;
  const showViewMore = true;

  return (
    <div className={styles.row}>
      {/* Badge */}
      {!hideBadge && (
        <div className={isWalkIn
          ? "flex items-center gap-[5px] pt-3 px-[18px] pb-1 text-[10px] font-semibold tracking-[0.05em] uppercase text-[#a09080] md:pt-[var(--sp-3)] md:px-[var(--sp-6)] md:pb-1 lg:pt-[var(--sp-4)] lg:px-[var(--sp-8)] lg:pb-[6px]"
          : "flex items-center gap-[5px] pt-3 px-[18px] pb-1 text-[10px] font-bold tracking-[0.07em] uppercase text-[#b08040] md:pt-[var(--sp-3)] md:px-[var(--sp-6)] md:pb-1 lg:pt-[var(--sp-4)] lg:px-[var(--sp-8)] lg:pb-[6px]"
        }>
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
              <span>{getPaymentLabel(service.paymentType)}</span>
            </>
          )}
        </div>
      )}

      {/* Main row — :hover kept in CSS module */}
      <div
        className={`${styles.main} ${styles.mainClickable}`}
        onClick={handleToggle}
      >
        <div className="flex-1 min-w-0 pr-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* name: --font-heading custom font — kept in CSS module */}
            <span className={styles.name}>{service.name}</span>
            {service.isMostPopular && (
              <span className="inline-flex items-center gap-[3px] text-[10px] font-semibold bg-[#fff0d0] text-[#9a6a08] py-[2px] px-[9px] rounded-full border border-[#f0d88a]">🔥 Most Popular</span>
            )}
          </div>
          {/* duration: svg child selector — kept in CSS module */}
          <div className={styles.duration}>
            <Clock />
            {formatDuration(service.duration)}
          </div>
          {service.nextAvailable && (
            <p className="text-[12px] font-medium text-[#c8901a] mt-1 md:text-[13px]">{service.nextAvailable}</p>
          )}
          {isWalkIn && !expanded && (
            <p className="text-sm text-[#a09080] italic mt-[3px]">Tap to view worker hours</p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 flex-col">
          <div className="text-right">
            {service.originalPrice && (
              <span className="text-[11px] text-[#b0a090] line-through block">
                {formatPrice(service.originalPrice)}
              </span>
            )}
            <span style={{fontWeight:"bolder"}} className="text-[17px] font-black text-[#c8901a] block md:text-[18px] lg:text-[1.125rem] lg:leading-7">{formatPrice(service.price)}</span>
          </div>
          {/* chevron: svg child selector — kept in CSS module */}
          <span className={`${styles.chevron}${expanded ? ` ${styles.chevronOpen}` : ""}`}>
            <ChevronDown />
          </span>
        </div>
      </div>

      {/* Animated panel — grid animation kept in CSS module */}
      <div className={`${styles.panelWrapper}${expanded ? ` ${styles.panelWrapperOpen}` : ""}`}>
        <div className={styles.panelInner}>
          <div className="pt-[var(--sp-3)] px-[18px] pb-[var(--sp-4)] md:pt-[var(--sp-3)] md:px-[var(--sp-6)] md:pb-[var(--sp-5)] lg:pt-[var(--sp-4)] lg:px-[var(--sp-8)] lg:pb-[var(--sp-6)]">

            {service.description && (
              <p className="text-sm text-[#7a6a55] leading-[1.5] mb-[var(--sp-3)] pb-[var(--sp-3)] border-b border-[#e8ddd0]">{service.description}</p>
            )}

            {showDateHeader && (
              <p className="text-[13px] font-bold  mb-[var(--sp-3)] tracking-[0.01em]" style={{fontWeight:"bold"}}>Today — {getTodayLabel()}</p>
            )}

            {!hasStaff && (
              <p className="text-[13px] text-[#a09080] py-[var(--sp-2)]">No staff available at this time</p>
            )}

            {hasStaff && service.staffAvailability!.map((staff) => (
              <div
                key={staff.staffId}
                className={isWalkIn
                  ? styles.staffRowWalkin
                  : "mb-[var(--sp-3)] [&:last-of-type]:mb-0"
                }
              >
                <div className="flex items-center gap-[var(--sp-2)] mb-[10px]">
                  <BarberAvatar initials={staff.staffInitials} size="sm" />
                  <span className="text-[16px] font-bold text-[#2a1f10] flex-1" style={{fontWeight:"bold"}}>{staff.staffName}</span>
                  {staff.isMostBooked && !isWalkIn && (
                    /* staffMostBooked: svg child selector — kept in CSS module */
                    <span className={styles.staffMostBooked}>
                      <TrendingUp /> Most booked
                    </span>
                  )}
                </div>

                {isWalkIn ? (
                  staff.hours && (
                    <span className="text-[12px] text-bold text-[#a09080] bg-[#ede8df] rounded-[20px] py-1 px-[10px] whitespace-nowrap flex-shrink-0">{staff.hours}</span>
                  )
                ) : (
                  staff.slots && staff.slots.length > 0 && (
                    <div style={{gap:"0.5rem"}} className="flex flex-wrap gap-2 pt-1">
                      {staff.slots.map((slot) => (
                        <TimeSlotButton
                          key={slot}
                          time={slot}
                          variant="pill"
                          selected={selectedSlot?.staffId === staff.staffId && selectedSlot?.slot === slot}
                          onClick={() => handleSlotClick(staff, slot)}
                        />
                      ))}
                    </div>
                  )
                )}
              </div>
            ))}

            {showViewMore && (
              /* viewMore: :hover — kept in CSS module */
              <Link
                href={
                  barberSlug && businessId
                    ? `/barbers/${encodeURIComponent(barberSlug)}/view-times?service=${service.id}&businessName=${encodeURIComponent(businessName)}&businessAddress=${encodeURIComponent(businessAddress)}&mode=${serviceMode}${userId ? `&user_id=${encodeURIComponent(userId)}` : ""}`
                    : `#`
                }
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
