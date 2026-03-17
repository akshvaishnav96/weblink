"use client";

import { useState } from "react";
import { Check, CalendarPlus, Zap, X, CalendarDays, Bell, Tag, Download } from "lucide-react";
import styles from "./AppDownloadModal.module.css";

interface AppDownloadModalProps {
  name?: string;
  pin?: string;
  onSkip: () => void;
  onSaveDetails?: () => void;
}

const FEATURES = [
  { icon: CalendarDays, label: "All services",  desc: "Hair, beauty, fitness & more" },
  { icon: Bell,         label: "Recurring",     desc: "Weekly, fortnightly or monthly" },
  { icon: Tag,          label: "Offers",        desc: "Special deals & discounts" },
];

export default function AppDownloadModal({ name, pin, onSkip, onSaveDetails }: AppDownloadModalProps) {
  const [fasterDismissed, setFasterDismissed] = useState(false);
  const [detailsSaved,    setDetailsSaved]    = useState(false);

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>

        {/* ── Success section ── */}
        <div className={styles.successSection}>
          <div className={styles.checkCircle}>
            <Check className={styles.checkIcon} />
          </div>
          <h2 className={styles.successTitle}>
            You&apos;re all set{name ? `, ${name}` : ""}
          </h2>
          <p className={styles.successDesc}>
            We&apos;ve sent a text with your booking link — view or cancel anytime from there.
          </p>
          {pin && (
            <div className={styles.pinRow}>
              <span className={styles.pinLabel}>Confirmation PIN</span>
              <span className={styles.pin}>{pin}</span>
            </div>
          )}
          <button className={styles.calBtn}>
            <CalendarPlus size={16} />
            Add to Calendar
          </button>
          
          <p className={styles.calNote}>Includes reminders at 24h, 3h &amp; at appointment time</p>
        </div>

        {/* ── Faster next time banner ── */}
        {!fasterDismissed && (
          <div className={styles.fasterBanner}>
            <span className={styles.fasterIcon}><Zap size={14} /></span>
            <div className={styles.fasterText}>
              {detailsSaved
                ? <p className={styles.fasterTitle}>Details saved ✓</p>
                : <>
                    <p className={styles.fasterTitle}>Faster next time?</p>
                    <p className={styles.fasterDesc}>Save your details for instant bookings.</p>
                  </>
              }
            </div>
            {!detailsSaved && (
              <button className={styles.fasterYes} onClick={() => { onSaveDetails?.(); setDetailsSaved(true); }}>Yes</button>
            )}
            <button className={styles.fasterClose} onClick={() => setFasterDismissed(true)} aria-label="Dismiss">
              <X size={13} />
            </button>
          </div>
        )}

        {/* ── Do more section ── */}
        <div className={styles.moreSection}>
          <p className={styles.moreHeading}>DO MORE WITH VALET VAULT</p>
          <p className={styles.moreDesc}>
            Access services across hair, beauty, fitness, wellness, car detailing and car rentals — all in one app.
          </p>

          <div className={styles.featureGrid}>
            {FEATURES.map(({ icon: Icon, label, desc }) => (
              <div key={label} className={styles.featureCard}>
                <span className={styles.featureIcon}><Icon size={20} /></span>
                <p className={styles.featureLabel}>{label}</p>
                <p className={styles.featureDesc}>{desc}</p>
              </div>
            ))}
          </div>

          <button className={styles.getAppBtn}>
            <Download size={15} />
            Get the App — It&apos;s Free
          </button>
          <p className={styles.getAppNote}>
            Create an account to unlock recurring bookings, exclusive offers and more
          </p>
          <button className={styles.skipBtn} onClick={onSkip}>
            I&apos;ll explore later
          </button>
        </div>

      </div>
    </div>
  );
}
