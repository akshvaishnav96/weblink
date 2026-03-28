"use client";

import Image from "next/image";
import { Clock } from "lucide-react";
import BarberAvatar from "@/components/ui/BarberAvatar";
import type { ApiBusinessProfile } from "@/lib/api";
import { getInitials, formatApiTime } from "../_utils";
import styles from "../page.module.css";

interface AboutTabProps {
  profile: ApiBusinessProfile;
}

export default function AboutTab({ profile }: AboutTabProps) {
  return (
    <div className="p-[var(--sp-4)] flex flex-col gap-[var(--sp-6)] md:px-[var(--sp-8)] md:py-[var(--sp-6)]">
      {profile.who_we_are && (
        <p className="text-sm text-[var(--color-text-secondary)] leading-[1.65] md:text-base">
          {profile.who_we_are}
        </p>
      )}

      {/* Opening Hours */}
      {profile.open_hours?.length > 0 && (
        <div>
          <h3 className="flex items-center gap-[var(--sp-2)] text-base font-bold text-[var(--color-text-primary)] mb-[var(--sp-3)]">
            <Clock className="w-4 h-4 flex-shrink-0 text-[var(--color-primary)]" />{" "}
            Opening Hours
          </h3>
          {/* hoursTable */}
          <div className="flex flex-col gap-0.5 border border-[var(--color-border-light)] rounded-[var(--radius-md)] overflow-hidden">
            {/* hoursRow: nth-child alternating bg — kept in CSS module */}
            {profile.open_hours.map((h) => (
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
      )}

      {/* Team */}
      {profile.staff?.length > 0 && (
        <div>
          <h3 className="flex items-center gap-[var(--sp-2)] text-base font-bold text-[var(--color-text-primary)] mb-[var(--sp-3)]">
            Our Team
          </h3>
          {/* teamGrid: 2-col */}
          <div className="grid grid-cols-2 gap-[var(--sp-3)]">
            {profile.staff.map((member, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-[var(--sp-2)] p-[var(--sp-4)] px-[var(--sp-3)] border border-[var(--color-border-light)] rounded-[var(--radius-lg)] bg-[var(--color-surface)] text-center"
              >
                {member.picture ? (
                  /* teamAvatar: 60x60, rounded-full, object-cover — kept in CSS module */
                  <Image
                    src={member.picture}
                    alt={member.name}
                    width={60}
                    height={60}
                    className="w-[60px] h-[60px] rounded-full object-cover"
                  />
                ) : (
                  <BarberAvatar
                    initials={getInitials(member.name)}
                    size="md"
                  />
                )}
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                  {member.name}
                </p>
                {/* teamBio: 11px — kept in CSS module (non-standard size) */}
                {member.bio && (
                  <p className="text-[11px] text-[var(--color-text-muted)] leading-[1.5]">
                    {member.bio}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
