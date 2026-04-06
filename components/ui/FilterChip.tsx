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
      className={active
        ? "inline-flex items-center justify-center py-[6px] px-[15px] rounded-full border-[1.5px] border-[var(--color-primary)] bg-[var(--color-primary)] text-sm font-semibold text-[var(--color-white)] whitespace-nowrap flex-shrink-0 cursor-pointer transition-[background,border-color,color] duration-150 select-none md:py-[7px] md:px-[18px] md:text-base"
        : "inline-flex items-center justify-center py-[6px] px-[15px] rounded-full border-[1.5px] border-[var(--color-border)] bg-[var(--color-white)] text-sm font-medium text-[var(--color-text-secondary)] whitespace-nowrap flex-shrink-0 cursor-pointer transition-[background,border-color,color] duration-150 select-none hover:border-[var(--color-primary-border)] md:py-[7px] md:px-[18px] md:text-base"
      }
    >
      {label}
    </button>
  );
}
