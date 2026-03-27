import { UserProfile } from "@/types";
import { Edit2 } from "lucide-react";
import styles from "./ProfileHeader.module.css";

interface ProfileHeaderProps {
  profile: UserProfile;
  points: number;
  tier: string;
  bookingCount: number;
}

export default function ProfileHeader({ profile, points, tier, bookingCount }: ProfileHeaderProps) {
  return (
    <div className={styles.header}>
      {/* hero/editBtn: editBtn:hover + editBtn svg child — kept in CSS module */}
      <div className="relative inline-block">
        <div className="w-[84px] h-[84px] rounded-full bg-gradient-to-br from-[#B8860B] to-[#E2B860] text-white text-[28px] font-[800] flex items-center justify-center border-[3px] border-white/[.15] tracking-[1px] md:w-[100px] md:h-[100px] md:text-[34px]">
          {profile.initials}
        </div>
        <button className={styles.editBtn}>
          <Edit2 />
        </button>
      </div>

      <div className="flex flex-col gap-[3px]">
        <h1 className="text-[var(--text-lg)] font-bold text-white tracking-[-0.3px] md:text-[28px]">{profile.name}</h1>
        <p className="text-[var(--text-sm)] text-white/55 md:text-[var(--text-base)]">{profile.email}</p>
        <p className="text-[12px] text-white/35">Member since {profile.memberSince}</p>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-[var(--sp-4)] bg-white/[.07] border border-white/10 rounded-[var(--radius-lg)] py-[var(--sp-3)] px-[var(--sp-5)] mt-[var(--sp-2)] w-full max-w-[320px] justify-between md:max-w-[400px] md:py-[var(--sp-4)] md:px-[var(--sp-6)]">
        <div className="flex flex-col items-center gap-[2px]">
          <span className="text-[var(--text-md)] font-bold text-white md:text-[var(--text-lg)]">{bookingCount}</span>
          <span className="text-[11px] text-white/45">Bookings</span>
        </div>
        <div className="w-px h-[32px] bg-white/[.12]" />
        <div className="flex flex-col items-center gap-[2px]">
          <span className="text-[var(--text-md)] font-bold text-white md:text-[var(--text-lg)]">{points.toLocaleString()}</span>
          <span className="text-[11px] text-white/45">Points</span>
        </div>
        <div className="w-px h-[32px] bg-white/[.12]" />
        <div className="flex flex-col items-center gap-[2px]">
          <span className="text-[var(--text-md)] font-bold text-white md:text-[var(--text-lg)]">{tier}</span>
          <span className="text-[11px] text-white/45">Tier</span>
        </div>
      </div>
    </div>
  );
}
