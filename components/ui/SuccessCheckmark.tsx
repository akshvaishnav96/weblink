"use client";

import styles from "./SuccessCheckmark.module.css";

/**
 * Animated success checkmark.
 * - Circle scales in with a spring bounce
 * - Check path draws itself via stroke-dashoffset
 * No external dependencies — pure CSS/SVG.
 */
export default function SuccessCheckmark({ size = 72 }: { size?: number }) {
  return (
    <div className={styles.wrap} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 52 52"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={styles.svg}
        aria-hidden="true"
      >
        {/* Main circle */}
        <circle cx="26" cy="26" r="22" className={styles.circle} />
        {/* Checkmark path */}
        <path
          d="M14 26.5 L22 34.5 L38 18"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={styles.check}
        />
      </svg>
    </div>
  );
}
