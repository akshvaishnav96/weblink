"use client";

import styles from "./FilterChip.module.css";

interface FilterChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export default function FilterChip({ label, active, onClick }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={`${styles.chip}${active ? ` ${styles.active}` : ""}`}
    >
      {label}
    </button>
  );
}
