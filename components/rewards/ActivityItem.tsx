import { PointActivity } from "@/types";
import styles from "./ActivityItem.module.css";

interface ActivityItemProps {
  activity: PointActivity;
}

export default function ActivityItem({ activity }: ActivityItemProps) {
  const isEarned = activity.points > 0;

  return (
    <div className={styles.item}>
      <div className="flex items-center justify-center w-[28px] flex-shrink-0">
        <div className={isEarned
          ? "w-[10px] h-[10px] rounded-full bg-[var(--color-primary)]"
          : "w-[10px] h-[10px] rounded-full bg-[var(--color-text-muted)]"
        } />
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-[2px]">
        <span className="text-[var(--text-sm)] font-medium text-[var(--color-text-primary)] whitespace-nowrap overflow-hidden text-ellipsis md:text-[var(--text-base)]">
          {activity.description}
        </span>
        <span className="text-[12px] text-[var(--color-text-muted)]">{activity.date}</span>
      </div>
      <span className={isEarned
        ? "flex-shrink-0 text-[var(--text-sm)] font-bold text-[var(--color-primary)] md:text-[var(--text-base)]"
        : "flex-shrink-0 text-[var(--text-sm)] font-bold text-[var(--color-text-muted)] md:text-[var(--text-base)]"
      }>
        {isEarned ? "+" : ""}{activity.points.toLocaleString()} pts
      </span>
    </div>
  );
}
