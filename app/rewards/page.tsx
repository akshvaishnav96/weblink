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

const HOW_IT_WORKS = [
  { num: 1, text: "Book a service with any partner barber in the app." },
  { num: 2, text: "Earn points equal to dollars spent on every visit." },
  { num: 3, text: "Redeem points for free services and exclusive perks." },
];

export default function RewardsPage() {
  return (
    <div className="page-content">
      {/* Header */}
      <div className="pt-[var(--sp-6)] px-[var(--sp-4)] pb-[var(--sp-2)] md:pt-[var(--sp-8)] md:px-[var(--sp-8)] md:pb-[var(--sp-3)] md:max-w-[var(--content-max)] md:mx-auto lg:px-[var(--content-padding)] lg:pb-[var(--sp-4)]">
        <h1 className="text-[26px] font-bold text-[var(--color-text-primary)] tracking-[-0.5px] md:text-[32px]">Rewards</h1>
        <p className="text-[var(--text-sm)] text-[var(--color-text-muted)] mt-[2px]">
          Earn points on every booking and unlock exclusive perks.
        </p>
      </div>

      {/* Points hero */}
      <RewardsHero
        points={USER_POINTS}
        tier={USER_TIER}
        nextTierPoints={NEXT_TIER_POINTS}
      />

      {/* Redeem section */}
      <div className="px-[var(--sp-4)] mt-[var(--sp-5)] md:px-[var(--sp-8)] md:mt-[var(--sp-6)] lg:px-[var(--content-padding)] lg:max-w-[var(--content-max)] lg:mx-auto">
        <div className="flex items-center justify-between mb-[var(--sp-3)]">
          <h2 className="text-[var(--text-base)] font-bold text-[var(--color-text-primary)] md:text-[var(--text-md)]">
            Redeem Points
          </h2>
        </div>
        <div className="flex flex-col gap-[var(--sp-3)] md:gap-[var(--sp-4)] lg:grid lg:grid-cols-2">
          {REWARDS.map((reward) => (
            <RewardCard key={reward.id} reward={reward} userPoints={USER_POINTS} />
          ))}
        </div>
      </div>

      {/* Activity section */}
      <div className="px-[var(--sp-4)] mt-[var(--sp-5)] md:px-[var(--sp-8)] md:mt-[var(--sp-6)] lg:px-[var(--content-padding)] lg:max-w-[var(--content-max)] lg:mx-auto">
        <div className="flex items-center justify-between mb-[var(--sp-3)]">
          <h2 className="text-[var(--text-base)] font-bold text-[var(--color-text-primary)] md:text-[var(--text-md)]">
            Points Activity
          </h2>
        </div>
        <div className="bg-white border-[1.5px] border-[var(--color-border)] rounded-[var(--radius-lg)] py-[var(--sp-1)] px-[var(--sp-4)] md:py-[var(--sp-2)] md:px-[var(--sp-5)]">
          {POINT_ACTIVITIES.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="mx-[var(--sp-4)] mt-[var(--sp-5)] p-[var(--sp-4)] bg-[var(--color-primary-bg)] border border-[var(--color-primary-border)] rounded-[var(--radius-lg)] md:mx-[var(--sp-8)] md:mt-[var(--sp-6)] md:p-[var(--sp-5)] md:rounded-[var(--radius-xl)] lg:mx-[var(--content-padding)] lg:max-w-[var(--content-max)]">
        <h3 className="text-[var(--text-sm)] font-bold text-[var(--color-text-primary)] mb-[var(--sp-3)]">
          How it works
        </h3>
        <div className="flex flex-col gap-[var(--sp-2)] md:flex-row md:gap-[var(--sp-4)]">
          {HOW_IT_WORKS.map(({ num, text }) => (
            <div key={num} className="flex items-start gap-[var(--sp-3)] md:flex-col md:items-center md:text-center md:flex-1">
              <div className="w-[22px] h-[22px] rounded-full bg-[var(--color-primary)] text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-[1px] md:mt-0">
                {num}
              </div>
              <p className="text-[var(--text-sm)] text-[var(--color-text-secondary)] leading-[1.45]">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
