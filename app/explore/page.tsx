"use client";

import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import FilterChip from "@/components/ui/FilterChip";
import BarberListItem from "@/components/barber/BarberListItem";
import { BARBERS } from "@/lib/data";
import styles from "./page.module.css";

const FILTERS = ["All", "Nearby", "Top Rated", "Available Now", "Mobile"];

export default function ExplorePage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBarbers = BARBERS.filter(
    (b) =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page-content">
      <header className={styles.header}>
        <h1 className={styles.title}>Explore</h1>
      </header>

      {/* Search */}
      <div className={styles.search}>
        <Search className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search services, barbers, styles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
        <button className={styles.searchFilter}>
          <SlidersHorizontal />
        </button>
      </div>

      {/* Filters */}
      <div className={`${styles.filters} scrollbar-hide`}>
        {FILTERS.map((f) => (
          <FilterChip
            key={f}
            label={f}
            active={activeFilter === f}
            onClick={() => setActiveFilter(f)}
          />
        ))}
      </div>

      {/* Barber list */}
      <div className={styles.list}>
        {filteredBarbers.length === 0 ? (
          <p className={styles.listEmpty}>No barbers found</p>
        ) : (
          filteredBarbers.map((barber) => (
            <BarberListItem key={barber.id} barber={barber} />
          ))
        )}
      </div>
    </div>
  );
}
