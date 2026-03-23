"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, CalendarDays, Award, User, Trophy } from "lucide-react";
import styles from "./BottomNav.module.css";

// const NAV_ITEMS = [
//   { label: "Home",     icon: Home,         href: "/" },
//   { label: "Explore",  icon: Search,       href: "/explore" },
//   { label: "Bookings", icon: CalendarDays,  href: "/bookings" },
//   { label: "Rewards",  icon: Trophy,        href: "/rewards" },
//   { label: "Profile",  icon: User,         href: "/profile" },
// ];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      {/* {NAV_ITEMS.map(({ label, icon: Icon, href }) => {
        const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`${styles.item}${isActive ? ` ${styles.active}` : ""}`}
          >
            <span className={styles.icon}><Icon /></span>
            <span className={styles.label}>{label}</span>
          </Link>
        );
      })} */}
     {/* ── Powered by ── */}
      <div className={styles.poweredBy}>
        <a href="https://valetvault.com.au" rel="noopener" style={{ color: "inherit", textDecoration: "none" }}>
          Powered by Valet Vault
        </a>
      </div>
    </nav>
  );
}
