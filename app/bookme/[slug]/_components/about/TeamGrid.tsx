"use client";

import { useState } from "react";
import Image from "next/image";
import BarberAvatar from "@/components/ui/BarberAvatar";
import type { ApiStaffSummary } from "@/lib/api";
import { getInitials } from "../../_utils";

interface TeamGridProps {
  staff: ApiStaffSummary[];
}

function TeamAvatar({ picture, name }: { picture?: string; name: string }) {
  const [failed, setFailed] = useState(false);

  if (picture && !failed) {
    return (
      <Image
        src={picture}
        alt={name}
        width={60}
        height={60}
        className="w-[60px] h-[60px] rounded-full object-cover"
        onError={() => setFailed(true)}
      />
    );
  }

  return <BarberAvatar initials={getInitials(name)} size="md" />;
}

export default function TeamGrid({ staff }: TeamGridProps) {
  return (
    <div>
      <h3 className="flex items-center gap-[var(--sp-2)] text-base font-bold text-[var(--color-text-primary)] mb-[var(--sp-3)]">
        Our Team
      </h3>
      {/* teamGrid: 2-col */}
      <div className="grid grid-cols-2 gap-[var(--sp-3)]">
        {staff.map((member, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-[var(--sp-2)] p-[var(--sp-4)] px-[var(--sp-3)] border border-[var(--color-border-light)] rounded-[var(--radius-lg)] bg-[var(--color-surface)] text-center"
          >
            {/* teamAvatar: 60x60, rounded-full, object-cover — kept in CSS module */}
            <TeamAvatar picture={member.picture ?? undefined} name={member.name} />
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
  );
}
