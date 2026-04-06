"use client";

import { Globe } from "lucide-react";
import { FaFacebookF, FaTiktok, FaInstagram } from "react-icons/fa";
import { FaGoogle } from "react-icons/fa6";
import type { ApiBusinessProfile } from "@/lib/api";
import { toAbsoluteUrl } from "../../_utils";
import styles from "../../page.module.css";

interface ProfileSocialsProps {
  profile: ApiBusinessProfile;
}

export default function ProfileSocials({ profile }: ProfileSocialsProps) {
  return (
    <div className="flex gap-[var(--sp-5)] mt-[var(--sp-3)]">
      {profile.website_url && (
        /* socialLink class MUST stay: CSS module uses .socialLink:hover .socialBtn selector */
        <a
          href={toAbsoluteUrl(profile.website_url)}
          target="_blank"
          rel="noreferrer"
          className={styles.socialLink}
        >
          <div className={styles.socialBtn}><Globe /></div>
          <span className="text-[10px] text-[var(--color-text-muted)]">Website</span>
        </a>
      )}
      {profile.instagram_url && (
        <a
          href={toAbsoluteUrl(profile.instagram_url)}
          target="_blank"
          rel="noreferrer"
          className={styles.socialLink}
        >
          <div className={styles.socialBtn}><FaInstagram /></div>
          <span className="text-[10px] text-[var(--color-text-muted)]">Instagram</span>
        </a>
      )}
      {profile.facebook_url && (
        <a
          href={toAbsoluteUrl(profile.facebook_url)}
          target="_blank"
          rel="noreferrer"
          className={styles.socialLink}
        >
          <div className={styles.socialBtn}><FaFacebookF /></div>
          <span className="text-[10px] text-[var(--color-text-muted)]">Facebook</span>
        </a>
      )}
      {profile.tiktok_url && (
        <a
          href={toAbsoluteUrl(profile.tiktok_url)}
          target="_blank"
          rel="noreferrer"
          className={styles.socialLink}
        >
          <div className={styles.socialBtn}><FaTiktok /></div>
          <span className="text-[10px] text-[var(--color-text-muted)]">TikTok</span>
        </a>
      )}
      {profile.google_url && (
        <a
          href={toAbsoluteUrl(profile.google_url)}
          target="_blank"
          rel="noreferrer"
          className={styles.socialLink}
        >
          <div className={styles.socialBtn}><FaGoogle /></div>
          <span className="text-[10px] text-[var(--color-text-muted)]">Website</span>
        </a>
      )}
    </div>
  );
}
