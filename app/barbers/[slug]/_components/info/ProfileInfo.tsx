"use client";

import StarRating from "@/components/ui/StarRating";
import type { ApiBusinessProfile } from "@/lib/api";
import { type Tab } from "../../_utils";
import ProfileAddress from "./ProfileAddress";
import ProfileSocials from "./ProfileSocials";
import ProfileTabs from "./ProfileTabs";

interface ProfileInfoProps {
  profile: ApiBusinessProfile;
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  slug: string;
}

export default function ProfileInfo({ profile, activeTab, onTabChange, slug }: ProfileInfoProps) {
  return (
    <div
      style={{ background: "white" }}
      className="p-[var(--sp-4)] border-b border-[var(--color-border-light)] relative top-[-1.6rem] mb-[-1.6rem] bg-white rounded-t-[20px] z-[2] w-full md:pt-[var(--sp-5)] md:px-[var(--sp-8)] md:pb-[var(--sp-6)] md:mx-auto md:border-b-0"
    >
      {/* infoName: exact 22px, font-weight 700, letter-spacing -0.4px */}
      <h1 className="text-[22px] font-bold text-[var(--color-text-primary)] tracking-[-0.4px] mb-1 md:text-[28px]">
        {profile.business_display_name ?? profile.business_name}
      </h1>

      <ProfileAddress profile={profile} />

      {profile.average_rating > 0 && (
        <div className="mt-[5px]">
          <StarRating
            rating={profile.average_rating}
            count={profile.total_reviews}
          />
        </div>
      )}

      <ProfileSocials profile={profile} slug={slug} businessId={profile.id} />

      <ProfileTabs activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
}
