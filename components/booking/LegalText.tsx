import styles from "./LegalText.module.css";

interface LegalTextProps {
  action?: "confirming" | "paying";
}

export default function LegalText({ action = "confirming" }: LegalTextProps) {
  return (
    <p className={styles.legalText}>
      By {action}, you agree to our{" "}
      <a href="/bookme/privacy" className={styles.legalLink}>Privacy Policy</a>
      {" "}and{" "}
      <a href="/bookme/terms" className={styles.legalLink}>Terms</a>.
    </p>
  );
}
