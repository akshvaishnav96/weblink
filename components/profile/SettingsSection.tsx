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
    <div className="px-[var(--sp-4)] mt-[var(--sp-5)] md:px-[var(--sp-8)] lg:px-[var(--content-padding)] lg:max-w-[var(--content-max)] lg:mx-auto">
      <h2 className="text-[12px] font-semibold text-[var(--color-text-muted)] uppercase tracking-[0.8px] mb-[var(--sp-2)] pl-[2px] md:text-sm">{title}</h2>
      <div className="bg-white border-[1.5px] border-[var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden">
        {rows.map((row, idx) => {
          const Icon = row.icon;
          return (
            <button
              key={row.id}
              className={[
                styles.row,
                row.danger ? styles.rowDanger : "",
                idx < rows.length - 1 ? "border-b border-[var(--color-border-light)]" : "",
              ].filter(Boolean).join(" ")}
              onClick={row.onClick}
            >
              {/* iconWrap: svg child selector — kept in CSS module */}
              <div className={`${styles.iconWrap}${row.danger ? ` ${styles.iconWrapDanger}` : ""}`}>
                <Icon />
              </div>
              {/* rowLabel: .rowDanger .rowLabel descendant selector — kept in CSS module */}
              <span className={styles.rowLabel}>{row.label}</span>
              {row.value && (
                <span className="text-[12px] text-[var(--color-text-muted)] mr-[var(--sp-1)] md:text-sm">{row.value}</span>
              )}
              <ChevronRight className="w-[14px] h-[14px] text-[var(--color-text-muted)] flex-shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
