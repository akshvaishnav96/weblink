import { formatPrice } from "@/lib/utils";
import styles from "../page.module.css";

interface Props {
  deposit: number;
  remaining: number;
}

export default function HowPaymentWorks({ deposit, remaining }: Props) {
  return (
    <div className={styles.howItWorks}>
      <p className={styles.howTitle}>How Payment Works</p>
      <div className={styles.howSteps}>

        <div className={styles.howStep}>
          <div className={`${styles.howStepDot} ${styles.howStepDotActive}`}>1</div>
          <div className={styles.howStepLine} />
          <div className={styles.howStepBody}>
            <p className={styles.howStepLabel}>Pay now (deposit)</p>
            <p className={styles.howStepAmount}>{formatPrice(deposit)}</p>
            <p className={styles.howStepNote}>Secures your spot in the queue</p>
          </div>
        </div>

        <div className={styles.howStep}>
          <div className={styles.howStepDot}>2</div>
          <div className={styles.howStepBody}>
            <p className={styles.howStepLabel}>Pay after service</p>
            <p className={`${styles.howStepAmount} ${styles.howStepAmountMuted}`}>
              {formatPrice(remaining)}
            </p>
            <p className={styles.howStepNote}>Cash or card accepted on-site</p>
          </div>
        </div>

      </div>
    </div>
  );
}
