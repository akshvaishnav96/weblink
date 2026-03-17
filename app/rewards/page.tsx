import {
  USER_POINTS,
  USER_TIER,
  NEXT_TIER_POINTS,
  REWARDS,
  POINT_ACTIVITIES,
} from "@/lib/data";
import RewardsHero from "@/components/rewards/RewardsHero";
import RewardCard from "@/components/rewards/RewardCard";
import ActivityItem from "@/components/rewards/ActivityItem";
import styles from "./page.module.css";

const HOW_IT_WORKS = [
  { num: 1, text: "Book a service with any partner barber in the app." },
  { num: 2, text: "Earn points equal to dollars spent on every visit." },
  { num: 3, text: "Redeem points for free services and exclusive perks." },
];

export default function RewardsPage() {
  return (
    <div className="page-content">
      {/* Header */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Rewards</h1>
        <p className={styles.pageSubtitle}>Earn points on every booking and unlock exclusive perks.</p>
      </div>

      {/* Points hero */}
      <RewardsHero
        points={USER_POINTS}
        tier={USER_TIER}
        nextTierPoints={NEXT_TIER_POINTS}
      />

      {/* Redeem section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Redeem Points</h2>
        </div>
        <div className={styles.rewardsList}>
          {REWARDS.map((reward) => (
            <RewardCard key={reward.id} reward={reward} userPoints={USER_POINTS} />
          ))}
        </div>
      </div>

      {/* Activity section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Points Activity</h2>
        </div>
        <div className={styles.activityCard}>
          {POINT_ACTIVITIES.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className={styles.howItWorks}>
        <h3 className={styles.howTitle}>How it works</h3>
        <div className={styles.howSteps}>
          {HOW_IT_WORKS.map(({ num, text }) => (
            <div key={num} className={styles.howStep}>
              <div className={styles.howStepNum}>{num}</div>
              <p className={styles.howStepText}>{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
