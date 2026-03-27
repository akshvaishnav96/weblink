import Link from "next/link";
import { MapPin } from "lucide-react";
import { Barber } from "@/types";
import BarberAvatar from "@/components/ui/BarberAvatar";
import StarRating from "@/components/ui/StarRating";
import styles from "./BarberListItem.module.css";

interface BarberListItemProps {
  barber: Barber;
}

export default function BarberListItem({ barber }: BarberListItemProps) {
  return (
    <Link href={`/provider/${barber.id}`} className={styles.item}>
      <BarberAvatar initials={barber.initials} size="md" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[var(--color-text-primary)] whitespace-nowrap overflow-hidden text-ellipsis md:text-base">{barber.name}</p>
        <p className="text-[12px] text-[var(--color-text-muted)] mt-[1px] md:text-sm">{barber.title}</p>
        <div className="flex items-center gap-[var(--sp-3)] mt-1">
          <StarRating rating={barber.rating} count={barber.reviewCount} variant="compact" />
          {/* distance: svg child selector — kept in CSS module */}
          <span className={styles.distance}>
            <MapPin />
            {barber.distance}
          </span>
        </div>
      </div>
      <span className="text-sm font-semibold text-[var(--color-primary)] whitespace-nowrap flex-shrink-0 ml-auto md:text-base">From ${barber.priceFrom}</span>
    </Link>
  );
}
