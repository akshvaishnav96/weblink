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
      <div className={styles.icon}>{reward.icon}</div>
      <div className={styles.body}>
        <span className={styles.title}>{reward.title}</span>
        <span className={styles.desc}>{reward.description}</span>
        <span className={styles.cost}>
          {reward.points.toLocaleString()} pts
        </span>
      </div>
      <button
        className={`${styles.btn}${canRedeem ? "" : ` ${styles.btnDisabled}`}`}
        disabled={!canRedeem}
      >
        {canRedeem ? "Redeem" : "Locked"}
      </button>
    </div>
  );
}
