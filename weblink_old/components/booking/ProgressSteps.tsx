import styles from "./ProgressSteps.module.css";

interface ProgressStepsProps {
  currentStep: 1 | 2;
}

export default function ProgressSteps({ currentStep }: ProgressStepsProps) {
  return (
    <div className={styles.steps}>
      {/* Step 1 */}
      <div className={styles.step}>
        <div className={`${styles.circle}${currentStep >= 1 ? ` ${styles.circleActive}` : ""}${currentStep > 1 ? ` ${styles.circleDone}` : ""}`}>
          {currentStep > 1 ? "✓" : "1"}
        </div>
        <span className={`${styles.label}${currentStep === 1 ? ` ${styles.labelActive}` : ""}`}>
          Details
        </span>
      </div>

      {/* Connector */}
      <div className={`${styles.divider}${currentStep > 1 ? ` ${styles.dividerDone}` : ""}`} />

      {/* Step 2 */}
      <div className={styles.step}>
        <span className={`${styles.label}${currentStep === 2 ? ` ${styles.labelActive}` : ""}`}>
          Payment
        </span>
        <div className={`${styles.circle}${currentStep >= 2 ? ` ${styles.circleActive}` : ""}`}>
          2
        </div>
      </div>
    </div>
  );
}
