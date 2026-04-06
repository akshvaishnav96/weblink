"use client";

import type { ApiBusinessProfile } from "@/lib/api";
import PortfolioGrid from "./PortfolioGrid";
import PortfolioVideos from "./PortfolioVideos";

interface PortfolioTabProps {
  profile: ApiBusinessProfile;
}

export default function PortfolioTab({ profile }: PortfolioTabProps) {
  const hasImages = profile.portfolio?.images?.length > 0;
  const hasVideos = profile.portfolio?.videos?.length > 0;

  return (
    <div className="pb-[var(--sp-6)]">
      {profile.portfolio?.description && (
        <p className="px-[var(--sp-4)] pt-[var(--sp-4)] text-sm text-[var(--color-text-secondary)] leading-[1.6]">
          {profile.portfolio.description}
        </p>
      )}

      {hasImages && <PortfolioGrid images={profile.portfolio.images} />}

      {hasVideos && <PortfolioVideos videos={profile.portfolio.videos} />}

      {!hasImages && !hasVideos && (
        <div className="flex items-center justify-center py-20 px-[var(--sp-4)] text-sm text-[var(--color-text-muted)] italic">
          No portfolio items yet
        </div>
      )}
    </div>
  );
}
