"use client";

import { CheckCircle, AlertCircle, User, Mail } from "lucide-react";
import { useQueueStatus } from "./_hooks/useQueueStatus";
import WaitingView  from "./_components/WaitingView";
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
        <div className={`${styles.iconWrap}${isYourTurn ? ` ${styles.iconWrapTurn}` : ""}`}>
          {isYourTurn
            ? <span className={styles.iconParty}>🎉</span>
            : <CheckCircle className={styles.iconCheck} />
          }
        </div>

        {/* Heading */}
        <h1 className={styles.heading}>
          {isYourTurn ? "It's Your Turn!" : "You're in the Queue!"}
        </h1>
        <p className={styles.subheading}>
          {[q.serviceName, q.duration !== "—" ? `${q.duration} min` : ""].filter(Boolean).join(" • ")}
          {q.people > 1 && <> &bull; <span className={styles.subheadingBold}>{q.people} people</span></>}
        </p>
        {q.staffName && q.staffName !== "Anyone Available" && (
          <p className={styles.subheadingStaff}>{q.staffName}</p>
        )}

        {/* Main view: waiting or your-turn */}
        {isYourTurn ? (
          <YourTurnView
            countdownLabel={q.countdownLabel}
            countdownProgress={q.countdownProgress}
            skipUsed={q.skipUsed}
            onSkip={() => q.openModal("skip")}
            onLeave={() => q.openModal("leave")}
          />
        ) : (
          <WaitingView
            position={q.position}
            estWaitMins={q.estWaitMins}
            canSkip={q.canSkip}
            skipCount={q.skipCount}
            skipLimit={q.skipLimit}
            onSkip={() => q.openModal("skip")}
            onLeave={() => q.openModal("leave")}
          />
        )}

        {/* Customer info row — shown only in waiting state */}
        {!isYourTurn && (
          <>
            <div className={styles.infoRow}>
              <div className={styles.infoItem}>
                <User className={styles.infoIcon} />
                <span>{/* firstName comes via localStorage or booking pin */}{q.pin}</span>
              </div>
              <div className={styles.infoItem}>
                <Mail className={styles.infoIcon} />
                <span className={styles.infoEmail}>—</span>
              </div>
            </div>

            <div className={styles.priorityNote}>
              <AlertCircle className={styles.priorityIcon} />
              Note: Scheduled bookings may take priority over the live queue.
            </div>
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
