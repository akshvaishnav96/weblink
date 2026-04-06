"use client";

import styles from "./TimeSlotButton.module.css";

interface TimeSlotButtonProps {
  time: string;
  selected?: boolean;
  onClick?: () => void;
  variant?: "full" | "pill";
}

export default function TimeSlotButton({
  time,
  selected,
  onClick,
  variant = "full",
}: TimeSlotButtonProps) {
  if (variant === "pill") {
    return (
      <button
        onClick={onClick}
        className={`${styles.pill}${selected ? ` ${styles.pillSelected}` : ""}`}
      >
        {time}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`${styles.btn}${selected ? ` ${styles.btnSelected}` : ""}`}
    >
      {time}
    </button>
  );
}
