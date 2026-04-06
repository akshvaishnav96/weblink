import styles from "./StarRating.module.css";

interface StarRatingProps {
  rating: number;
  count?: number;
  variant?: "default" | "compact" | "badge";
}

export default function StarRating({ rating, count, variant = "default" }: StarRatingProps) {
  const cls = [
    "inline-flex items-center gap-[3px] leading-none",
    variant === "compact" ? styles.compact : "",
    variant === "badge"   ? "bg-white/[.92] backdrop-blur-sm rounded-full py-[3px] px-2" : "",
  ].filter(Boolean).join(" ");

  return (
    <span className={cls}>
      <span className={styles.star}>★</span>
      <span className="text-[12px] font-semibold text-[var(--color-text-primary)] lg:text-[13px]">{rating}</span>
      {count !== undefined && (
        <span className="text-[12px] text-[var(--color-text-muted)] lg:text-[13px]">({count})</span>
      )}
    </span>
  );
}
