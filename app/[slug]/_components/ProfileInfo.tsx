"use client";

import { Globe, MapPin } from "lucide-react";
import StarRating from "@/components/ui/StarRating";
import { FaFacebookF, FaTiktok, FaInstagram } from "react-icons/fa";
import { FaGoogle } from "react-icons/fa6";
import type { ApiBusinessProfile } from "@/lib/api";
import { toAbsoluteUrl, type Tab } from "../_utils";
import styles from "../page.module.css";

const TABS = [
  { id: "services" as Tab, label: "Services" },
  { id: "portfolio" as Tab, label: "Portfolio" },
  { id: "about" as Tab, label: "About" },
];

interface ProfileInfoProps {
  profile: ApiBusinessProfile;
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export default function ProfileInfo({ profile, activeTab, onTabChange }: ProfileInfoProps) {
  return (
    <div
      style={{ background: "white" }}
      className="p-[var(--sp-4)] border-b border-[var(--color-border-light)] relative top-[-1.6rem] mb-[-1.6rem] bg-white rounded-t-[20px] z-[2] w-full md:pt-[var(--sp-5)] md:px-[var(--sp-8)] md:pb-[var(--sp-6)] md:mx-auto md:border-b-0"
    >
      {/* infoName: exact 22px, font-weight 700, letter-spacing -0.4px */}
      <h1 className="text-[22px] font-bold text-[var(--color-text-primary)] tracking-[-0.4px] mb-1 md:text-[28px]">
        {profile.business_display_name ?? profile.business_name}
      </h1>

      {/* infoAddress: gap 4px, 13px, margin-top 3px — kept in CSS module (svg color token) */}
      {profile.business_address && (
        <a
          href={
            profile.latitude && profile.longitude
              ? `https://www.google.com/maps?q=${profile.latitude},${profile.longitude}`
              : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.business_address)}`
          }
          target="_blank"
          rel="noreferrer"
          className={styles.infoAddress}
        >
          <MapPin />{" "}
          <span className="text-[0.875rem]">{profile.business_address}</span>
        </a>
      )}

      {/* infoRating */}
      {profile.average_rating > 0 && (
        <div className="mt-[5px]">
          <StarRating
            rating={profile.average_rating}
            count={profile.total_reviews}
          />
        </div>
      )}

      {/* infoSocials */}
      <div className="flex gap-[var(--sp-5)] mt-[var(--sp-3)]">
        {profile.website_url && (
          /* socialLink class MUST stay: CSS module uses .socialLink:hover .socialBtn selector */
          <a
            href={toAbsoluteUrl(profile.website_url)}
            target="_blank"
            rel="noreferrer"
            className={styles.socialLink}
          >
            <div className={styles.socialBtn}>
              <Globe />
            </div>
            <span className="text-[10px] text-[var(--color-text-muted)]">
              Website
            </span>
          </a>
        )}
        {profile.instagram_url && (
          <a
            href={toAbsoluteUrl(profile.instagram_url)}
            target="_blank"
            rel="noreferrer"
            className={styles.socialLink}
          >
            <div className={styles.socialBtn}>
              <FaInstagram />
            </div>
            <span className="text-[10px] text-[var(--color-text-muted)]">
              Instagram
            </span>
          </a>
        )}
        {profile.facebook_url && (
          <a
            href={toAbsoluteUrl(profile.facebook_url)}
            target="_blank"
            rel="noreferrer"
            className={styles.socialLink}
          >
            <div className={styles.socialBtn}>
              <FaFacebookF />
            </div>
            <span className="text-[10px] text-[var(--color-text-muted)]">
              Facebook
            </span>
          </a>
        )}
        {profile.tiktok_url && (
          <a
            href={toAbsoluteUrl(profile.tiktok_url)}
            target="_blank"
            rel="noreferrer"
            className={styles.socialLink}
          >
            <div className={styles.socialBtn}>
              <FaTiktok />
            </div>
            <span className="text-[10px] text-[var(--color-text-muted)]">
              TikTok
            </span>
          </a>
        )}
        {profile.google_url && (
          <a
            href={toAbsoluteUrl(profile.google_url)}
            target="_blank"
            rel="noreferrer"
            className={styles.socialLink}
          >
            <div className={styles.socialBtn}>
              <FaGoogle />
            </div>
            <span className="text-[10px] text-[var(--color-text-muted)]">
              Website
            </span>
          </a>
        )}
      </div>

      {/* tabs */}
      <div
        style={{ gap: "0.5rem" }}
        className="flex items-center justify-center gap-2 mt-[var(--sp-4)] pb-0"
      >
        {TABS.map(({ id: tabId, label }) => (
          <button
            key={tabId}
            onClick={() => onTabChange(tabId)}
            /* tabBtn: 1.5px border #DEDAD3, exact padding/font — kept in CSS module */
            className={`${styles.tabBtn}${activeTab === tabId ? ` ${styles.tabActive}` : ""}`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
