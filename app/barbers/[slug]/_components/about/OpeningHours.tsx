"use client";

import { Clock } from "lucide-react";
import type { ApiOpenHour } from "@/lib/api";
import { formatApiTime } from "../../_utils";
import styles from "../../page.module.css";

interface OpeningHoursProps {
  openHours: ApiOpenHour[];
}

export default function OpeningHours({ openHours }: OpeningHoursProps) {
  return (
    <div>
      <h3 className="flex items-center gap-[var(--sp-2)] text-base font-bold text-[var(--color-text-primary)] mb-[var(--sp-3)]">
        <Clock className="w-4 h-4 flex-shrink-0 text-[var(--color-primary)]" />{" "}
        Opening Hours
      </h3>
      {/* hoursRow: nth-child alternating bg — kept in CSS module */}
      <div className="flex flex-col gap-0.5 border border-[var(--color-border-light)] rounded-[var(--radius-md)] overflow-hidden">
        {openHours.map((h) => (
          <div key={h.id} className={styles.hoursRow}>
            <span className="font-medium text-[var(--color-text-primary)] min-w-[90px]">
              {h.day}
            </span>
            <span
              className={`text-[var(--color-text-secondary)]${h.is_closed ? " text-[var(--color-text-muted)] italic" : ""}`}
            >
              {h.is_closed
                ? "Closed"
                : `${formatApiTime(h.open_time!)} – ${formatApiTime(h.close_time!)}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
