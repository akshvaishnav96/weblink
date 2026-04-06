import { Clock, Zap } from "lucide-react";
import BarberAvatar from "@/components/ui/BarberAvatar";
import { formatPrice } from "@/lib/utils";
import styles from "../page.module.css";

interface Props {
  serviceName: string;
  staffId: string;
  staffName: string;
  staffInitials: string;
  duration: string;
  price: number;
  waitMins: number;
  people: number;
}

export default function QueueSummaryCard({
  serviceName, staffId, staffName, staffInitials,
  duration, price, waitMins, people,
}: Props) {
  const isAny = !staffId || staffId === "fastest" || staffId === "anyone";

  return (
    <div className={styles.summaryCard}>
      {/* Service + price */}
      <div className={styles.summaryHeader}>
        <div className={styles.summaryHeaderLeft}>
          <p className={styles.summaryServiceName}>{serviceName}</p>
          <div className={styles.summaryMeta}>
            <Clock className={styles.summaryMetaIcon} />
            <span>{duration !== "—" ? `${duration} min` : "—"}</span>
          </div>
        </div>
        <div className={styles.summaryHeaderRight}>
          <span className={styles.summaryPrice}>{formatPrice(price)}</span>
        </div>
      </div>

      {/* Staff */}
      <div className={styles.summaryStaff}>
        {isAny ? (
          <div className={styles.fastestAvatar}>
            <Zap className={styles.fastestAvatarIcon} />
          </div>
        ) : (
          <BarberAvatar initials={staffInitials} size="sm" />
        )}
        <div>
          <p className={styles.summaryStaffName}>{staffName}</p>
          {waitMins > 0 && (
            <p className={styles.summaryWait}>~{waitMins} min estimated wait</p>
          )}
        </div>
      </div>

      {/* People count */}
      {people > 1 && (
        <div className={styles.summaryPeople}>
          <span className={styles.summaryPeopleLabel}>People</span>
          <span className={styles.summaryPeopleValue}>{people}</span>
        </div>
      )}
    </div>
  );
}
