"use client";

import { Search, X } from "lucide-react";
import styles from "../../page.module.css";

interface ServiceSearchProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export default function ServiceSearch({ searchQuery, onSearchChange }: ServiceSearchProps) {
  return (
    /* serviceSearch: 1.5px border, border-radius 10px, exact focus — kept in CSS module */
    <div className={styles.serviceSearch}>
      <Search />
      <input
        type="text"
        placeholder="Search services…"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className={styles.serviceSearchInput}
      />
      {searchQuery && (
        <button
          className={styles.serviceSearchClear}
          onClick={() => onSearchChange("")}
          aria-label="Clear search"
        >
          <X />
        </button>
      )}
    </div>
  );
}
