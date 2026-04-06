"use client";

import {
  User,
  Phone,
  Bell,
  Shield,
  CreditCard,
  HelpCircle,
  Star,
  LogOut,
} from "lucide-react";
import ProfileHeader from "@/components/profile/ProfileHeader";
import SettingsSection from "@/components/profile/SettingsSection";
import type { SettingsRow } from "@/components/profile/SettingsSection";
import { USER_PROFILE, USER_POINTS, USER_TIER, MOCK_BOOKINGS } from "@/lib/data";

const ACCOUNT_ROWS: SettingsRow[] = [
  { id: "name",  icon: User,       label: "Full Name",     value: USER_PROFILE.name  },
  { id: "phone", icon: Phone,      label: "Phone Number",  value: USER_PROFILE.phone },
  { id: "cards", icon: CreditCard, label: "Payment Methods"                           },
];

const PREFERENCES_ROWS: SettingsRow[] = [
  { id: "notifs",  icon: Bell,   label: "Notifications", value: "On"   },
  { id: "privacy", icon: Shield, label: "Privacy & Data", onClick: () => window.location.href = "/privacy" },
];

const SUPPORT_ROWS: SettingsRow[] = [
  { id: "help",   icon: HelpCircle, label: "Help & Support" },
  { id: "review", icon: Star,       label: "Rate Groomly"   },
];

const DANGER_ROWS: SettingsRow[] = [
  { id: "logout", icon: LogOut, label: "Log Out", danger: true },
];

export default function ProfilePage() {
  const totalBookings = MOCK_BOOKINGS.filter((b) => b.status === "completed").length;

  return (
    <div className="page-content">
      {/* Profile hero */}
      <ProfileHeader
        profile={USER_PROFILE}
        points={USER_POINTS}
        tier={USER_TIER}
        bookingCount={totalBookings}
      />

      {/* Settings sections */}
      <div className="lg:grid lg:grid-cols-2 lg:gap-[var(--sp-6)] lg:max-w-[var(--content-max)] lg:mx-auto lg:px-[var(--content-padding)] lg:pb-[var(--sp-6)]">
        <div className="flex flex-col gap-[var(--sp-5)] pb-[var(--sp-6)] mt-[var(--sp-2)] md:gap-[var(--sp-6)] lg:gap-[var(--sp-4)] lg:pb-0 lg:mt-0">
          <SettingsSection title="Account" rows={ACCOUNT_ROWS} />
          <SettingsSection title="Preferences" rows={PREFERENCES_ROWS} />
        </div>
        <div className="flex flex-col gap-[var(--sp-5)] pb-[var(--sp-6)] mt-[var(--sp-2)] md:gap-[var(--sp-6)] lg:gap-[var(--sp-4)] lg:pb-0 lg:mt-0">
          <SettingsSection title="Support" rows={SUPPORT_ROWS} />
          <SettingsSection title="Session" rows={DANGER_ROWS} />
        </div>
      </div>

      <div className="text-center p-[var(--sp-4)] mt-[var(--sp-2)] lg:text-left lg:px-[var(--content-padding)] lg:max-w-[var(--content-max)] lg:mx-auto">
        <p className="text-[11px] text-[var(--color-text-muted)]">
          Groomly v1.0.0 · Member since {USER_PROFILE.memberSince}
        </p>
      </div>
    </div>
  );
}
