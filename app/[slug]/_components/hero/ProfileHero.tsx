import Image from "next/image";
import type { ApiBusinessProfile } from "@/lib/api";
import styles from "../../page.module.css";

interface ProfileHeroProps {
  profile: ApiBusinessProfile;
  hasAvailableSlots: boolean;
}

export default function ProfileHero({ profile, hasAvailableSlots }: ProfileHeroProps) {
  return (
    <div className={`${styles.hero}${profile.business_banner ? ` ${styles.heroBanner}` : ""}`}>
      {/* Use Next.js Image for LCP — gets WebP conversion, preload hint, proper sizing */}
      {profile.business_banner && (
        <Image
          src={profile.business_banner}
          alt={profile.business_name}
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: "center" }}
        />
      )}

      <p className={`${styles.heroName} relative z-[5]`}>
        {profile.business_name}
      </p>
      {profile.business_type && (
        <p className={`${styles.heroType} relative z-[5]`}>
          {profile.business_type}
        </p>
      )}
      {hasAvailableSlots && (
        <div className={`${styles.heroSeats} flex items-center gap-2`}>
          <div
            style={{
              height: "8px",
              width: "8px",
              background: "#0eaf0e",
              borderRadius: "50%",
              boxShadow: "0px 0px 10px green",
            }}
            className="w-2 h-2 min-w-2 min-h-2 bg-green-500"
          />
          <span>Seats available today</span>
        </div>
      )}
    </div>
  );
}
