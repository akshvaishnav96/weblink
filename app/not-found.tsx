"use client";

import Link from "next/link";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <div className={styles.root}>
      {/* Background lights same as hero */}
      <div className={styles.bgGradient} />
      <div className={styles.bgLights} />
      <div className={styles.bgVignette} />

      <div className={styles.content}>
        {/* Scissors icon */}
        <div className={styles.iconWrap}>
          <svg
            className={styles.scissorsIcon}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* blade 1 */}
            <line x1="32" y1="32" x2="6"  y2="10" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/>
            {/* blade 2 */}
            <line x1="32" y1="32" x2="6"  y2="54" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/>
            {/* handle 1 */}
            <line x1="32" y1="32" x2="56" y2="14" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/>
            {/* handle 2 */}
            <line x1="32" y1="32" x2="56" y2="50" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/>
            {/* pivot dot */}
            <circle cx="32" cy="32" r="3.5" fill="currentColor"/>
            {/* circle handles */}
            <circle cx="9"  cy="10" r="6" stroke="currentColor" strokeWidth="3"/>
            <circle cx="9"  cy="54" r="6" stroke="currentColor" strokeWidth="3"/>
          </svg>
        </div>

        {/* 404 heading */}
        <h1 className={styles.heading}>
          4<span className={styles.dot}>0</span>4
        </h1>

        <p className={styles.sub}>This page got a trim — and didn&apos;t make it back.</p>
        <p className={styles.hint}>The link may be broken, or the page no longer exists.</p>

      </div>

      {/* Brand watermark */}
      <p className={styles.brand}>valet vault<span className={styles.brandDot}>.</span></p>
    </div>
  );
}
