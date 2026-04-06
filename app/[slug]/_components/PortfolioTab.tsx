"use client";

import Image from "next/image";
import { Video } from "lucide-react";
import type { ApiBusinessProfile } from "@/lib/api";

interface PortfolioTabProps {
  profile: ApiBusinessProfile;
}

export default function PortfolioTab({ profile }: PortfolioTabProps) {
  return (
    <div className="pb-[var(--sp-6)]">
      {profile.portfolio?.description && (
        <p className="px-[var(--sp-4)] pt-[var(--sp-4)] text-sm text-[var(--color-text-secondary)] leading-[1.6]">
          {profile.portfolio.description}
        </p>
      )}

      {/* portfolioGrid: gap 2px, 3-col — kept in CSS module */}
      {profile.portfolio?.images?.length > 0 && (
        <div className="grid grid-cols-3 gap-[2px] mt-[var(--sp-3)]">
          {profile.portfolio.images.map((img) => (
            <div key={img.id} className="w-full aspect-square block relative">
              <Image
                src={img.portfolio_url}
                alt="Portfolio"
                fill
                style={{ objectFit: "cover" }}
                sizes="(max-width: 600px) 50vw, 33vw"
              />
            </div>
          ))}
        </div>
      )}

      {profile.portfolio?.videos?.length > 0 && (
        <div className="p-[var(--sp-4)]">
          <h3 className="flex items-center gap-[var(--sp-2)] text-base font-bold text-[var(--color-text-primary)] mb-[var(--sp-3)]">
            <Video className="w-4 h-4 text-[var(--color-primary)]" /> Videos
          </h3>
          <div className="flex flex-col gap-[var(--sp-3)]">
            {profile.portfolio.videos.map((vid) => (
              <video
                key={vid.id}
                src={vid.portfolio_url}
                controls
                className="w-full rounded-[var(--radius-md)] bg-black max-h-[320px]"
                playsInline
              />
            ))}
          </div>
        </div>
      )}

      {!profile.portfolio?.images?.length &&
        !profile.portfolio?.videos?.length && (
          <div className="flex items-center justify-center py-20 px-[var(--sp-4)] text-sm text-[var(--color-text-muted)] italic">
            No portfolio items yet
          </div>
        )}
    </div>
  );
}
