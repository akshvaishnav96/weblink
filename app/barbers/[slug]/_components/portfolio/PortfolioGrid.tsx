"use client";

import { useState } from "react";
import Image from "next/image";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Counter from "yet-another-react-lightbox/plugins/counter";
import "yet-another-react-lightbox/plugins/counter.css";
import type { ApiPortfolioItem } from "@/lib/api";

interface PortfolioGridProps {
  images: ApiPortfolioItem[];
}

export default function PortfolioGrid({ images }: PortfolioGridProps) {
  const [index, setIndex] = useState(-1);

  const slides = images.map((img) => ({ src: img.portfolio_url }));

  return (
    <>
      <div className="grid grid-cols-3 gap-[2px] mt-[var(--sp-3)]">
        {images.map((img, i) => (
          <button
            key={img.id}
            onClick={() => setIndex(i)}
            className="w-full aspect-square block relative focus:outline-none"
          >
            <Image
              src={img.portfolio_url}
              alt="Portfolio"
              fill
              style={{ objectFit: "cover" }}
              sizes="(max-width: 600px) 50vw, 33vw"
            />
          </button>
        ))}
      </div>

      <Lightbox
        open={index >= 0}
        index={index}
        close={() => setIndex(-1)}
        slides={slides}
        plugins={[Slideshow, Zoom, Counter]}
      />
    </>
  );
}
