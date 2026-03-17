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
      <div className={styles.image}>
        <div className={styles.ratingBadge}>
          <span className={styles.ratingStar}>★</span>
          {pkg.rating}
        </div>
      </div>
      <div className={styles.body}>
        <h3 className={styles.title}>{pkg.title}</h3>
        <p className={styles.desc}>{pkg.description}</p>
        <div className={styles.footer}>
          <span className={styles.price}>${pkg.price}</span>
          <span className={styles.duration}>
            <Clock />
            {formatDuration(pkg.duration)}
          </span>
        </div>
      </div>
    </div>
  );
}
