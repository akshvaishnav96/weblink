import styles from "./LegalText.module.css";

interface LegalTextProps {
  action?: "confirming" | "paying";
}

export default function LegalText({ action = "confirming" }: LegalTextProps) {
  return (
    <p className={styles.legalText}>
      By {action}, you agree to our{" "}
      <a href="/barbers/privacy" className={styles.legalLink}>Privacy Policy</a>
      {" "}and{" "}
      <a href="/barbers/terms" className={styles.legalLink}>Terms</a>.
    </p>
  );
}
