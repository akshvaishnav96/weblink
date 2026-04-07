import { Clock, AlertTriangle, SkipForward, LogOut } from "lucide-react";
import styles from "../page.module.css";

// SVG circle constants
const R  = 45;
const C  = 2 * Math.PI * R; // circumference ≈ 282.7

interface Props {
  countdownLabel:    string;
  countdownProgress: number; // 1 → 0
  countdown:         number; // raw seconds remaining
  skipUsed:          boolean;
  onSkip:            () => void;
  onLeave:           () => void;
}

export default function YourTurnView({
  countdownLabel, countdownProgress, countdown,
  skipUsed, onSkip, onLeave,
}: Props) {
  const dashOffset = C * (1 - countdownProgress);
  const isUrgent   = countdown <= 10;

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
            stroke={isUrgent ? "#ef4444" : "#16a34a"}
            strokeWidth="5.5"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 50 50)"
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
        </svg>
        <div className={styles.timerInner}>
          <Clock className={`${styles.timerIcon}${isUrgent ? ` ${styles.timerIconUrgent}` : ""}`} />
          <p className={`${styles.timerCount}${isUrgent ? ` ${styles.timerCountUrgent}` : ""}`}>{countdownLabel}</p>
          <p className={styles.timerSub}>remaining</p>
        </div>
      </div>

      {/* Hurry pill — only when ≤ 10 s left */}
      {isUrgent && (
        <div className={styles.hurryPill}>
          <AlertTriangle size={14} />
          Hurry! Time running out
        </div>
      )}

      {/* Check-in warning */}
      <div className={styles.checkInBox}>
        <AlertTriangle className={styles.checkInIcon} size={18} />
        <div>
          <p className={styles.checkInTitle}>Get checked in before the timer ends</p>
          <p className={styles.checkInDesc}>
            If you don&apos;t check in with the barber before time runs out, you risk being moved to the back of the queue.
          </p>
        </div>
      </div>

      {/* What to do now */}
      <div className={styles.stepsCard}>
        <p className={styles.stepsTitle}>What to do now:</p>
        <div className={styles.stepsList}>
          {[
            "Head to the service counter",
            "Show this screen to the barber",
            "Take a seat and enjoy your haircut!",
          ].map((step, i) => (
            <div key={i} className={styles.stepItem}>
              <span className={styles.stepNum}>{i + 1}</span>
              <span className={styles.stepText}>{step}</span>
            </div>
          ))}
        </div>
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
