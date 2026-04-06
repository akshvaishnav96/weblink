"use client";

import type { ApiBusinessProfile } from "@/lib/api";
import OpeningHours from "./OpeningHours";
import TeamGrid from "./TeamGrid";

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

      {profile.open_hours?.length > 0 && (
        <OpeningHours openHours={profile.open_hours} />
      )}

      {profile.staff?.length > 0 && (
        <TeamGrid staff={profile.staff} />
      )}
    </div>
  );
}
