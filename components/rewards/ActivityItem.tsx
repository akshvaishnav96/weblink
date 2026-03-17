import { PointActivity } from "@/types";
import styles from "./ActivityItem.module.css";

interface ActivityItemProps {
  activity: PointActivity;
}

export default function ActivityItem({ activity }: ActivityItemProps) {
  const isEarned = activity.points > 0;

  return (
    <div className={styles.item}>
      <div className={styles.dotWrap}>
        <div className={`${styles.dot}${isEarned ? "" : ` ${styles.dotSpent}`}`} />
      </div>
      <div className={styles.info}>
        <span className={styles.desc}>{activity.description}</span>
        <span className={styles.date}>{activity.date}</span>
      </div>
      <span className={`${styles.points}${isEarned ? "" : ` ${styles.pointsSpent}`}`}>
        {isEarned ? "+" : ""}{activity.points.toLocaleString()} pts
      </span>
    </div>
  );
}
