"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, CalendarDays, Award, User, MapPin, Bell } from "lucide-react";
import styles from "./TopNav.module.css";

const NAV_ITEMS = [
  // { label: "Home",     icon: Home,         href: "/" },
  // { label: "Explore",  icon: Search,       href: "/explore" },
  // { label: "Bookings", icon: CalendarDays,  href: "/bookings" },
  // { label: "Rewards",  icon: Award,        href: "/rewards" },
  // { label: "Profile",  icon: User,         href: "/profile" },
] as any[];

export default function TopNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      <Link href="/" className={styles.logo}>
        Groomly<span>.</span>
      </Link>

      <div className={styles.links}>
        {NAV_ITEMS.map(({ label, icon: Icon, href }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`${styles.link}${isActive ? ` ${styles.active}` : ""}`}
            >
              <Icon />
              {label}
            </Link>
          );
        })}
      </div>

      <div className={styles.actions}>
        <button className={styles.location}>
          <MapPin /> NYC
        </button>
        <button className={styles.notif}>
          <Bell />
          <span className={styles.notifDot} />
        </button>
      </div>
    </nav>
  );
}
