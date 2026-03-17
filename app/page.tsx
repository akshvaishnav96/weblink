import Link from "next/link";
import { Bell, MapPin } from "lucide-react";
import PackageCard from "@/components/barber/PackageCard";
import { PACKAGES, SERVICE_CATEGORIES } from "@/lib/data";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <div className="page-content">
      {/* Header */}
      <header className={styles.header}>
        <div>
          <p className={styles.greeting}>Good evening</p>
          <h1 className={styles.appName}>Groomly<span className={styles.appNameDot}>.</span></h1>
        </div>
      </header>

      {/* Hero Banner */}
      <section className={styles.heroBanner}>
        <div className={styles.heroBannerGradient} />
        <div className={styles.heroBannerLights} />
        <div className={styles.heroBannerVignette} />

        <div className={styles.heroBannerContent}>
          <p className={styles.tagline}>Look sharp, feel sharp.</p>

          <Link href="/explore" className={styles.cta}>
            Book Now
          </Link>
        </div>
      </section>

      {/* Services */}
      <section className={styles.services}>
        <h2 className={styles.servicesTitle}>Services</h2>

        <div className={`${styles.servicesRow} scrollbar-hide`}>
          {SERVICE_CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/explore?category=${cat.id}`}
              className={styles.categoryItem}
            >
              <div className={styles.categoryIcon}>{cat.icon}</div>
              <span className={styles.categoryLabel}>{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Curated Packages */}
      <section className={styles.packages}>
        <div className={styles.packagesHeader}>
          <h2 className={styles.packagesTitle}>Curated Packages</h2>

          <Link href="/explore" className={styles.packagesSeeAll}>
            See all
          </Link>
        </div>

        <div className={`${styles.packagesScroll} scrollbar-hide`}>
          {PACKAGES.map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} />
          ))}
        </div>
      </section>

      {/* Reminder Banner */}
      <section className={styles.reminder}>
        <p className={styles.reminderText}>
          🧡 It&apos;s been{" "}
          <span className={styles.reminderWeeks}>5 weeks</span>{" "}
          since your last haircut
        </p>

        <Link href="/explore" className={styles.reminderLink}>
          Schedule now →
        </Link>
      </section>
    </div>
  );
}