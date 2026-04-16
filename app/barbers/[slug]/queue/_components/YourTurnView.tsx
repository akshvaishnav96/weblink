import { Clock, AlertTriangle, SkipForward, LogOut } from "lucide-react";
import styles from "../page.module.css";

// SVG circle constants
const R  = 45;
const C  = 2 * Math.PI * R; // circumference ≈ 282.7

interface Props {
  countdownLabel: string;
  countdownProgress: number; // 1 → 0
  skipUsed: boolean;
  onSkip: () => void;
  onLeave: () => void;
}

export default function YourTurnView({
  countdownLabel, countdownProgress,
  skipUsed, onSkip, onLeave,
}: Props) {
  const dashOffset = C * (1 - countdownProgress);

  return (
    <>
      {/* Circular countdown */}
      <div className={styles.timerWrap}>
        <svg className={styles.timerSvg} viewBox="0 0 100 100">
          {/* Track */}
          <circle cx="50" cy="50" r={R} fill="none" stroke="#e8f5e9" strokeWidth="5.5" />
          {/* Progress */}
          <circle
            cx="50" cy="50" r={R}
            fill="none"
            stroke="#16a34a"
            strokeWidth="5.5"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 50 50)"
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
        </svg>
        <div className={styles.timerInner}>
          <Clock className={styles.timerIcon} />
          <p className={styles.timerCount}>{countdownLabel}</p>
          <p className={styles.timerSub}>remaining</p>
        </div>
      </div>

      {/* Check-in warning */}
      <div className={styles.checkInBox}>
        <AlertTriangle className={styles.checkInIcon} size={16} />
        <span>Get checked in before the timer ends</span>
      </div>

      {/* Skip (one time only) */}
      {!skipUsed && (
        <button className={styles.skipBtnMuted} onClick={onSkip}>
          <SkipForward size={14} />
          Skip my turn (1 time only)
        </button>
      )}

      {/* Leave */}
      <button className={styles.leaveLinkSmall} onClick={onLeave}>
        <LogOut size={13} />
        Leave queue
      </button>
    </>
  );
}
