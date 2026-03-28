"use client";

import { type Tab } from "../../_utils";
import styles from "../../page.module.css";

const TABS = [
  { id: "services" as Tab, label: "Services" },
  { id: "portfolio" as Tab, label: "Portfolio" },
  { id: "about" as Tab, label: "About" },
];

interface ProfileTabsProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export default function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
  return (
    <div
      style={{ gap: "0.5rem" }}
      className="flex items-center justify-center gap-2 mt-[var(--sp-4)] pb-0"
    >
      {TABS.map(({ id: tabId, label }) => (
        <button
          key={tabId}
          onClick={() => onTabChange(tabId)}
          /* tabBtn: 1.5px border #DEDAD3, exact padding/font — kept in CSS module */
          className={`${styles.tabBtn}${activeTab === tabId ? ` ${styles.tabActive}` : ""}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
