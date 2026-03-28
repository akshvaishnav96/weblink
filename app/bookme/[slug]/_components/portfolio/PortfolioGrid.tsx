"use client";

import Image from "next/image";
import type { ApiPortfolioItem } from "@/lib/api";

interface PortfolioGridProps {
  images: ApiPortfolioItem[];
}

export default function PortfolioGrid({ images }: PortfolioGridProps) {
  return (
    <div className="grid grid-cols-3 gap-[2px] mt-[var(--sp-3)]">
      {images.map((img) => (
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
  );
}
