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
  const config    = TIER_CONFIG[tier];
  const progress  = Math.min((points / nextTierPoints) * 100, 100);
  const remaining = Math.max(nextTierPoints - points, 0);

  return (
    <div className={styles.hero}>
      {/* inner: 3-stop dark gradient — kept in CSS module */}
      <div className={styles.inner}>
        {/* Tier badge */}
        <div className="flex items-center gap-[var(--sp-2)]">
          <span className="text-[20px]">{config.icon}</span>
          <span className="text-[var(--text-sm)] font-bold tracking-[0.5px]" style={{ color: config.color }}>
            {tier} Member
          </span>
        </div>

        {/* Points */}
        <div className="flex items-baseline gap-[6px]">
          <span className="text-[56px] font-[800] text-white leading-none tracking-[-2px] md:text-[72px]">
            {points.toLocaleString()}
          </span>
          <span className="text-[var(--text-md)] font-semibold text-white/55">pts</span>
        </div>

        {/* Progress to next tier */}
        {config.next && (
          <div className="w-full max-w-[280px] md:max-w-[360px]">
            <div className="h-[6px] bg-white/[.15] rounded-full overflow-hidden mb-[var(--sp-2)]">
              <div
                className="h-full bg-gradient-to-r from-[#B8860B] to-[#E2B860] rounded-full transition-[width] duration-[600ms] ease-in-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            {/* progressText: strong child selector — kept in CSS module */}
            <p className={styles.progressText}>
              <strong>{remaining.toLocaleString()} pts</strong> to {config.next}
            </p>
          </div>
        )}
        {!config.next && (
          <p className="text-[12px] text-white/55 italic">You&apos;ve reached the highest tier!</p>
        )}
      </div>
    </div>
  );
}
