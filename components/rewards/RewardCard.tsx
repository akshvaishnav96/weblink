import { RewardItem } from "@/types";
import styles from "./RewardCard.module.css";

interface RewardCardProps {
  reward: RewardItem;
  userPoints: number;
}

export default function RewardCard({ reward, userPoints }: RewardCardProps) {
  const canRedeem = userPoints >= reward.points;

  return (
    <div className={`${styles.card}${canRedeem ? "" : ` ${styles.locked}`}`}>
      <div className="w-[48px] h-[48px] rounded-[var(--radius-md)] bg-[var(--color-primary-bg)] border border-[var(--color-primary-border)] flex items-center justify-center text-[22px] flex-shrink-0 md:w-[56px] md:h-[56px] md:text-[26px]">
        {reward.icon}
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-[2px]">
        <span className="text-[var(--text-sm)] font-bold text-[var(--color-text-primary)] md:text-[var(--text-base)]">
          {reward.title}
        </span>
        <span className="text-[12px] text-[var(--color-text-muted)] md:text-[var(--text-sm)]">
          {reward.description}
        </span>
        <span className="text-[12px] font-semibold text-[var(--color-primary)] mt-[2px] md:text-[var(--text-sm)]">
          {reward.points.toLocaleString()} pts
        </span>
      </div>
      {/* btn: :hover:not(:disabled) + transform — kept in CSS module */}
      <button
        className={`${styles.btn}${canRedeem ? "" : ` ${styles.btnDisabled}`}`}
        disabled={!canRedeem}
      >
        {canRedeem ? "Redeem" : "Locked"}
      </button>
    </div>
  );
}
