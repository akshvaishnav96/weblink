"use client";

import { useRef } from "react";
import { Video } from "lucide-react";
import type { ApiPortfolioItem } from "@/lib/api";

interface PortfolioVideosProps {
  videos: ApiPortfolioItem[];
}

export default function PortfolioVideos({ videos }: PortfolioVideosProps) {
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  function handlePlay(index: number) {
    videoRefs.current.forEach((vid, i) => {
      if (vid && i !== index) vid.pause();
    });
  }

  return (
    <div className="p-[var(--sp-4)]">
      <h3 className="flex items-center gap-[var(--sp-2)] text-base font-bold text-[var(--color-text-primary)] mb-[var(--sp-3)]">
        <Video className="w-4 h-4 text-[var(--color-primary)]" /> Videos
      </h3>
      <div className="flex flex-col gap-[var(--sp-3)]">
        {videos.map((vid, i) => (
          <video
            key={vid.id}
            ref={(el) => { videoRefs.current[i] = el; }}
            src={vid.portfolio_url}
            controls
            preload="none"
            onPlay={() => handlePlay(i)}
            className="w-full rounded-[var(--radius-md)] bg-black max-h-[320px]"
            playsInline
          />
        ))}
      </div>
    </div>
  );
}
