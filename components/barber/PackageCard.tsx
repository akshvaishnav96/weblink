import { Clock } from "lucide-react";
import { Package } from "@/types";
import { formatDuration } from "@/lib/utils";
import styles from "./PackageCard.module.css";

interface PackageCardProps {
  pkg: Package;
}

export default function PackageCard({ pkg }: PackageCardProps) {
  return (
    <div className={styles.card}>
      {/* image: ::after pseudo-element overlay — kept in CSS module */}
      <div className={styles.image}>
        <div className="absolute top-2 right-2 z-[2] inline-flex items-center gap-[3px] bg-white/90 backdrop-blur-[5px] rounded-full py-[3px] px-2 text-[11px] font-semibold text-[var(--color-text-primary)]">
          <span className="text-[var(--color-star)] text-[11px]">★</span>
          {pkg.rating}
        </div>
      </div>
      <div className="pt-[10px] px-[var(--sp-3)] pb-[var(--sp-3)]">
        <h3 className="text-sm font-bold text-[var(--color-text-primary)] mb-[3px] md:text-base">{pkg.title}</h3>
        {/* desc: -webkit-line-clamp — kept in CSS module */}
        <p className={styles.desc}>{pkg.description}</p>
        <div className="flex items-center justify-between mt-[var(--sp-2)]">
          <span className="text-sm font-bold text-[var(--color-primary)]">${pkg.price}</span>
          {/* duration: svg child selector — kept in CSS module */}
          <span className={styles.duration}>
            <Clock />
            {formatDuration(pkg.duration)}
          </span>
        </div>
      </div>
    </div>
  );
}
