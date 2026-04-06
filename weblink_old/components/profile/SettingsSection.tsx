import { ChevronRight, LucideIcon } from "lucide-react";
import styles from "./SettingsSection.module.css";

export interface SettingsRow {
  id: string;
  icon: LucideIcon;
  label: string;
  value?: string;
  danger?: boolean;
  onClick?: () => void;
}

interface SettingsSectionProps {
  title: string;
  rows: SettingsRow[];
}

export default function SettingsSection({ title, rows }: SettingsSectionProps) {
  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      <div className={styles.card}>
        {rows.map((row, idx) => {
          const Icon = row.icon;
          return (
            <button
              key={row.id}
              className={[
                styles.row,
                row.danger ? styles.rowDanger : "",
                idx < rows.length - 1 ? styles.rowBordered : "",
              ].filter(Boolean).join(" ")}
              onClick={row.onClick}
            >
              <div className={`${styles.iconWrap}${row.danger ? ` ${styles.iconWrapDanger}` : ""}`}>
                <Icon />
              </div>
              <span className={styles.rowLabel}>{row.label}</span>
              {row.value && (
                <span className={styles.rowValue}>{row.value}</span>
              )}
              <ChevronRight className={styles.chevron} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
