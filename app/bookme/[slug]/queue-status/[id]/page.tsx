"use client";

import { Clock } from "lucide-react";
import { useQueueStatus } from "../_hooks/useQueueStatus";
import WaitingView  from "../_components/WaitingView";
import YourTurnView from "../_components/YourTurnView";
import { LeaveModal, SkipModal } from "../_components/ConfirmModal";
import styles from "../page.module.css";

export default function QueueStatusPage() {
  const q = useQueueStatus();

  const isYourTurn = q.view === "your-turn";

  // Build a single subheading line: "Service • Xmin • Staff"
  const subParts = [
    q.serviceName,
    q.duration !== "—" ? `${q.duration} min` : "",
    q.staffName && q.staffName !== "Anyone Available" ? q.staffName : "",
  ].filter(Boolean);

  return (
    <>
      <div className={styles.page}>

        {/* Status icon */}
        <div className={`${styles.iconWrap}${isYourTurn ? ` ${styles.iconWrapTurn}` : ` ${styles.iconWrapWaiting}`}`}>
          {isYourTurn ? (
            <span className={styles.iconParty}>🎉</span>
          ) : (
            <Clock size={28} color="#fff" strokeWidth={2} />
          )}
        </div>

        {/* Heading */}
        <h1 className={styles.heading}>
          {isYourTurn ? "It's Your Turn!" : "You're in the Queue!"}
        </h1>

        {/* Subheading — same format for both views */}
        <p className={styles.subheading}>
          {subParts.join(" • ")}
          {!isYourTurn && q.people > 1 && (
            <> &bull; <span className={styles.subheadingBold}>{q.people} people</span></>
          )}
        </p>

        {/* Main view */}
        {isYourTurn ? (
          <YourTurnView
            countdownLabel={q.countdownLabel}
            countdownProgress={q.countdownProgress}
            countdown={q.countdown}
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
