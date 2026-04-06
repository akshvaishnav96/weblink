import styles from "./BarberAvatar.module.css";

interface BarberAvatarProps {
  initials: string;
  size?: "sm" | "md" | "lg";
  circle?: boolean;
  selected?: boolean;
}

export default function BarberAvatar({
  initials,
  size = "md",
  circle = false,
  selected = false,
}: BarberAvatarProps) {
  const sizeClass = { sm: styles.sm, md: styles.md, lg: styles.lg }[size];
  const classes = [
    styles.avatar,
    sizeClass,
    circle   ? styles.circle   : "",
    selected ? styles.selected : "",
  ].filter(Boolean).join(" ");

  return <div className={classes}>{initials}</div>;
}
