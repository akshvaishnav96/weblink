import { UserProfile } from "@/types";
import { Edit2 } from "lucide-react";
import styles from "./ProfileHeader.module.css";

interface ProfileHeaderProps {
  profile: UserProfile;
  points: number;
  tier: string;
  bookingCount: number;
}

export default function ProfileHeader({ profile, points, tier, bookingCount }: ProfileHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.hero}>
        <div className={styles.avatar}>
          {profile.initials}
        </div>
        <button className={styles.editBtn}>
          <Edit2 />
        </button>
      </div>

      <div className={styles.info}>
        <h1 className={styles.name}>{profile.name}</h1>
        <p className={styles.email}>{profile.email}</p>
        <p className={styles.member}>Member since {profile.memberSince}</p>
      </div>

      {/* Stats row */}
      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{bookingCount}</span>
          <span className={styles.statLabel}>Bookings</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.stat}>
          <span className={styles.statValue}>{points.toLocaleString()}</span>
          <span className={styles.statLabel}>Points</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.stat}>
          <span className={styles.statValue}>{tier}</span>
          <span className={styles.statLabel}>Tier</span>
        </div>
      </div>
    </div>
  );
}
