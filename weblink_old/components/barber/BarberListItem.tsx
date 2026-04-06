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
      <div className={styles.info}>
        <p className={styles.name}>{barber.name}</p>
        <p className={styles.title}>{barber.title}</p>
        <div className={styles.meta}>
          <StarRating rating={barber.rating} count={barber.reviewCount} variant="compact" />
          <span className={styles.distance}>
            <MapPin />
            {barber.distance}
          </span>
        </div>
      </div>
      <span className={styles.price}>From ${barber.priceFrom}</span>
    </Link>
  );
}
