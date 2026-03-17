import styles from "./StarRating.module.css";

interface StarRatingProps {
  rating: number;
  count?: number;
  variant?: "default" | "compact" | "badge";
}

export default function StarRating({ rating, count, variant = "default" }: StarRatingProps) {
  const cls = [
    styles.rating,
    variant === "compact" ? styles.compact : "",
    variant === "badge"   ? styles.badge   : "",
  ].filter(Boolean).join(" ");

  return (
    <span className={cls}>
      <span className={styles.star}>★</span>
      <span className={styles.value}>{rating}</span>
      {count !== undefined && (
        <span className={styles.count}>({count})</span>
      )}
    </span>
  );
}
