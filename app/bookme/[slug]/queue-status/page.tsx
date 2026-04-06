"use client";

import { Eye, SkipForward, XCircle, MessageCircle, Check, MessageSquare } from "lucide-react";
import { useQueueStatus } from "./_hooks/useQueueStatus";
import YourTurnView from "./_components/YourTurnView";
import { LeaveModal, SkipModal } from "./_components/ConfirmModal";
import styles from "./page.module.css";

export default function QueueStatusPage() {
  const q = useQueueStatus();

  const isYourTurn = q.view === "your-turn";

  return (
    <>
      <div className={styles.page}>

        {/* Status icon */}
        <div className={`${styles.iconWrap} ${isYourTurn ? styles.iconWrapTurn : ""}`}>
          {isYourTurn
            ? <span className={styles.iconParty}>🎉</span>
            : <Check className={styles.iconCheck} strokeWidth={3} />
          }
        </div>

        {/* Heading */}
        <h1 className={styles.heading}>
          {isYourTurn ? "It's Your Turn!" : "You're in the queue!"}
        </h1>
        <p className={styles.subheading}>
          {isYourTurn
            ? [q.serviceName, q.duration !== "—" ? `${q.duration} min` : ""].filter(Boolean).join(" • ")
            : "We've sent a link to manage your spot"
          }
        </p>
        {isYourTurn && q.staffName && q.staffName !== "Anyone Available" && (
          <p className={styles.subheadingStaff}>{q.staffName}</p>
        )}

        {/* Main view */}
        {isYourTurn ? (
          <YourTurnView
            countdownLabel={q.countdownLabel}
            countdownProgress={q.countdownProgress}
            skipUsed={q.skipUsed}
            onSkip={() => q.openModal("skip")}
            onLeave={() => q.openModal("leave")}
          />
        ) : (
          <>
            {/* SMS preview card */}
            <div className={styles.smsCard}>
              <div className={styles.smsHeader}>
                <MessageSquare className={styles.smsHeaderIcon} size={14} />
                <span className={styles.smsHeaderTitle}>Text Message</span>
                <span className={styles.smsHeaderTime}>Just now</span>
              </div>
              <div className={styles.smsBody}>
                <p className={styles.smsText}>
                  Hi! You&apos;re <strong>#{q.position}</strong> in line at {q.serviceName || "your provider"}.{" "}
                  Manage your spot here:
                </p>
                <span className={styles.smsLink}>queue.mikes.com/abc123</span>
              </div>
            </div>

            {/* FROM YOUR LINK */}
            <p className={styles.actionSectionLabel}>FROM YOUR LINK</p>
            <div className={styles.actionGrid}>
              <div className={styles.actionCard}>
                <Eye className={styles.actionIcon} size={20} />
                <span className={styles.actionText}>Track position</span>
              </div>
              <div className={styles.actionCard}>
                <SkipForward className={styles.actionIcon} size={20} />
                <span className={styles.actionText}>Skip turn</span>
              </div>
              <div className={styles.actionCard}>
                <XCircle className={`${styles.actionIcon} ${styles.actionIconDanger}`} size={20} />
                <span className={`${styles.actionText} ${styles.actionTextDanger}`}>Leave queue</span>
              </div>
            </div>
            <p className={styles.actionNote}>No app needed — works in any browser</p>

           
          </>
        )}

      </div>

      {/* Modals */}
      {q.modal === "leave" && (
        <LeaveModal
          position={q.position}
          isLeaving={q.isLeaving}
          onStay={q.closeModal}
          onLeave={q.confirmLeave}
        />
      )}
      {q.modal === "skip" && (
        <SkipModal
          isSkipping={q.isSkipping}
          onCancel={q.closeModal}
          onSkip={q.confirmSkip}
        />
      )}
    </>
  );
}
