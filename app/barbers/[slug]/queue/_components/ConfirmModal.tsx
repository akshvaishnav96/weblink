import styles from "../page.module.css";

interface ModalShellProps {
  children: React.ReactNode;
  onBackdropClick?: () => void;
}

function ModalShell({ children, onBackdropClick }: ModalShellProps) {
  return (
    <div className={styles.modalBackdrop} onClick={onBackdropClick}>
      <div className={styles.modalCard} onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

// ── Leave Queue modal ──────────────────────────────────────────────────────
interface LeaveModalProps {
  position: number;
  isLeaving: boolean;
  onStay: () => void;
  onLeave: () => void;
}

export function LeaveModal({ position, isLeaving, onStay, onLeave }: LeaveModalProps) {
  return (
    <ModalShell onBackdropClick={onStay}>
      <h2 className={styles.modalTitle}>Leave the Queue?</h2>
      <p className={styles.modalBody}>
        You&apos;ll lose your position <strong>#{position}</strong>. You can rejoin later,
        but you&apos;ll start from the back.
      </p>
      <div className={styles.modalActions}>
        <button className={styles.modalBtnSecondary} onClick={onStay}>
          Stay in Queue
        </button>
        <button className={`${styles.modalBtnDanger}${isLeaving ? ` ${styles.modalBtnLoading}` : ""}`} onClick={onLeave} disabled={isLeaving}>
          {isLeaving ? "Leaving…" : "Leave"}
        </button>
      </div>
    </ModalShell>
  );
}

// ── Skip Turn modal ────────────────────────────────────────────────────────
interface SkipModalProps {
  isSkipping: boolean;
  onCancel: () => void;
  onSkip: () => void;
}

export function SkipModal({ isSkipping, onCancel, onSkip }: SkipModalProps) {
  return (
    <ModalShell onBackdropClick={onCancel}>
      <h2 className={styles.modalTitle}>Skip Your Turn?</h2>
      <p className={styles.modalBody}>
        The next person will take your spot, and you&apos;ll move back one position in the queue.
      </p>
      <div className={styles.modalActions}>
        <button className={styles.modalBtnSecondary} onClick={onCancel}>
          Cancel
        </button>
        <button className={`${styles.modalBtnAmber}${isSkipping ? ` ${styles.modalBtnLoading}` : ""}`} onClick={onSkip} disabled={isSkipping}>
          {isSkipping ? "Skipping…" : "Yes, Skip"}
        </button>
      </div>
    </ModalShell>
  );
}
