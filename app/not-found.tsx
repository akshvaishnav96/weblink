"use client";

import Link from "next/link";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 200, background: "#111009", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", overflow: "hidden" }}>
      {/* bgGradient/bgLights/bgVignette: radial-gradients — kept in CSS module */}
      <div className={styles.bgGradient} />
      <div className={styles.bgLights} />
      <div className={styles.bgVignette} />

      <div className="relative z-[1] flex flex-col items-center text-center gap-0 w-full max-w-[520px] px-4">
        {/* Scissors icon */}
        <div className="mb-[28px] opacity-[.55]">
          <svg
            className="w-[clamp(56px,12vw,80px)] h-[clamp(56px,12vw,80px)] text-[var(--color-primary)]"
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

        <p style={{ textShadow: "0 1px 12px rgba(0,0,0,0.8)" }} className="text-[clamp(16px,4.5vw,22px)] font-semibold text-[#cbc3c3] mb-[10px] tracking-[-0.2px] w-full">
          This page got a trim — and didn&apos;t make it back.
        </p>
        <p style={{ textShadow: "0 1px 8px rgba(0,0,0,0.8)" }} className="text-[clamp(13px,3.5vw,16px)] text-[#cbc3c3] mb-[40px] w-full">
          The link may be broken, or the page no longer exists.
        </p>

      </div>

      {/* Brand watermark */}
      <div className="absolute bottom-[24px] left-1/2 -translate-x-1/2 text-center text-[9px] tracking-[0.14em] uppercase text-[var(--color-text-muted)] whitespace-nowrap">
        <a href="https://valetvault.com.au" rel="noopener" style={{ color: "inherit", textDecoration: "none" }}>
          Powered by <span className="text-[var(--color-primary)]">Valet Vault</span>
        </a>
      </div>
    </div>
  );
}
