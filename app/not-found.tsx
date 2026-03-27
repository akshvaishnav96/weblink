"use client";

import Link from "next/link";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#111009] overflow-hidden p-[var(--sp-6)] z-[10]">
      {/* bgGradient/bgLights/bgVignette: radial-gradients — kept in CSS module */}
      <div className={styles.bgGradient} />
      <div className={styles.bgLights} />
      <div className={styles.bgVignette} />

      <div className="relative z-[1] flex flex-col items-center text-center gap-0">
        {/* Scissors icon */}
        <div className="mb-[28px] opacity-[.55]">
          <svg
            className="w-[56px] h-[56px] text-[var(--color-primary)]"
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

        {/* 404 heading — font-family: var(--font-heading) + clamp — kept in CSS module */}
        <h1 className={styles.heading}>
          4<span className="text-[var(--color-primary)]">0</span>4
        </h1>

        <p className="text-[clamp(15px,4vw,19px)] font-semibold text-[#e8e0d0] mb-[10px] tracking-[-0.2px]">
          This page got a trim — and didn&apos;t make it back.
        </p>
        <p className="text-[13px] text-white/35 mb-[40px]">
          The link may be broken, or the page no longer exists.
        </p>
      </div>

      {/* Brand watermark */}
      <p className="absolute bottom-[24px] left-1/2 -translate-x-1/2 text-[12px] font-bold text-white/[.18] tracking-[1px] uppercase whitespace-nowrap">
        valet vault<span className="text-[var(--color-primary)] opacity-[.5]">.</span>
      </p>
    </div>
  );
}
