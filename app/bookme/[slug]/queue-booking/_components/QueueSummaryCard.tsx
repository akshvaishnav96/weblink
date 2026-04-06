import { Clock, User } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import styles from "../page.module.css";

interface Props {
  serviceName: string;
  staffId: string;
  staffName: string;
  staffInitials: string;
  duration: string;
  price: number;
  deposit: number;
  remaining: number;
  waitMins: number;
  people: number;
}

export default function QueueSummaryCard({
  serviceName, staffId, staffName,
  duration, price, deposit, remaining, people,
}: Props) {
  const isAny = !staffId || staffId === "fastest" || staffId === "anyone";
  const displayStaff = isAny ? "Anyone Available" : staffName;

  return (
    <div className={styles.summaryCard}>

      {/* Service name + total price */}
      <div className={styles.summaryHeader}>
        <p className={styles.summaryServiceName}>{serviceName}</p>
        <span className={styles.summaryPrice}>{formatPrice(price)}</span>
      </div>

      {/* Meta: duration · staff */}
      <div className={styles.summaryMeta}>
        <Clock className={styles.summaryMetaIcon} />
        <span>{duration !== "—" ? `${duration} min` : "—"}</span>
        {people > 1 && <span>× {people}</span>}
        <span className={styles.summaryMetaDot}>·</span>
        <User className={styles.summaryMetaIcon} />
        <span>{displayStaff}</span>
      </div>

      {/* Divider */}
      <div className={styles.summaryDivider} />

      {/* Deposit breakdown */}
      <div className={styles.summaryDepositRow}>
        <span className={styles.summaryDepositLabel}>Deposit now (50%)</span>
        <span className={styles.summaryDepositValue}>{formatPrice(deposit)}</span>
      </div>
      <div className={styles.summaryDepositRow}>
        <span className={styles.summaryDepositLabel}>Pay on-site (50%)</span>
        <span className={styles.summaryDepositLa}>{formatPrice(remaining)}</span>
      </div>

    </div>
  );
}
