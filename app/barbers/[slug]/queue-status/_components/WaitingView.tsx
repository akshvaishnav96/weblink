import { Clock, SkipForward, LogOut } from "lucide-react";
import styles from "../page.module.css";

interface Props {
  position: number;
  estWaitMins: number;
  canSkip: boolean;
  skipCount: number;
  skipLimit: number;
  onSkip: () => void;
  onLeave: () => void;
}

export default function WaitingView({ position, estWaitMins, canSkip, skipCount, skipLimit, onSkip, onLeave }: Props) {
  const waitLow   = Math.max(1, estWaitMins - 5);
  const waitHigh  = estWaitMins + 5;
  const isFirst   = position <= 1;
  const skipsLeft = skipLimit - skipCount;

  return (
    <>
      {/* Position card */}
      <div className={styles.positionCard}>
        <p className={styles.positionLabel}>YOUR POSITION</p>
        <p className={styles.positionNumber}>#{position}</p>
        <div className={styles.positionWait}>
          <Clock className={styles.positionWaitIcon} />
          <span>Est. wait: <strong>{waitLow}–{waitHigh} min</strong></span>
        </div>
      </div>

      {/* Skip turn */}
      {canSkip && (
        <button className={styles.skipBtn} onClick={onSkip}>
          <SkipForward className={styles.skipBtnIcon} />
          Need more time? Skip my turn
          {!isFirst && skipsLeft > 0 && (
            <span className={styles.skipBtnBadge}>{skipsLeft} left</span>
          )}
          {isFirst && <span className={styles.skipBtnBadge}>1 time only</span>}
        </button>
      )}

      {!canSkip && (
        <div className={styles.skipUsedNote}>
          {isFirst ? "Skip used — you've been moved back" : `All ${skipLimit} skips used`}
        </div>
      )}

      {/* Leave queue */}
      <button className={styles.leaveLink} onClick={onLeave}>
        <LogOut size={13} />
        Leave Queue
      </button>
    </>
  );
}
