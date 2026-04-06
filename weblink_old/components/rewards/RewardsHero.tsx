import { RewardTier } from "@/types";
import styles from "./RewardsHero.module.css";

interface RewardsHeroProps {
  points: number;
  tier: RewardTier;
  nextTierPoints: number;
}

const TIER_CONFIG: Record<RewardTier, { icon: string; color: string; next: RewardTier | null }> = {
  Bronze:   { icon: "🥉", color: "#CD7F32", next: "Silver"   },
  Silver:   { icon: "🥈", color: "#9EA0A3", next: "Gold"     },
  Gold:     { icon: "🥇", color: "#B8860B", next: "Platinum" },
  Platinum: { icon: "💎", color: "#5B6EF5", next: null       },
};

export default function RewardsHero({ points, tier, nextTierPoints }: RewardsHeroProps) {
  const config   = TIER_CONFIG[tier];
  const progress = Math.min((points / nextTierPoints) * 100, 100);
  const remaining = Math.max(nextTierPoints - points, 0);

  return (
    <div className={styles.hero}>
      <div className={styles.inner}>
        {/* Tier badge */}
        <div className={styles.tier}>
          <span className={styles.tierIcon}>{config.icon}</span>
          <span className={styles.tierLabel} style={{ color: config.color }}>
            {tier} Member
          </span>
        </div>

        {/* Points */}
        <div className={styles.pointsWrap}>
          <span className={styles.points}>{points.toLocaleString()}</span>
          <span className={styles.pointsLabel}>pts</span>
        </div>

        {/* Progress to next tier */}
        {config.next && (
          <div className={styles.progressArea}>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className={styles.progressText}>
              <strong>{remaining.toLocaleString()} pts</strong> to {config.next}
            </p>
          </div>
        )}
        {!config.next && (
          <p className={styles.maxTier}>You&apos;ve reached the highest tier!</p>
        )}
      </div>
    </div>
  );
}
