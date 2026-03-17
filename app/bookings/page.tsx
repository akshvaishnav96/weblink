// "use client";

// import { useState } from "react";
// import Link from "next/link";
// import { MOCK_BOOKINGS } from "@/lib/data";
// import { Booking } from "@/types";
// import BookingCard from "@/components/bookings/BookingCard";
// import styles from "./page.module.css";

// type BookingTab = "upcoming" | "past";

// export default function BookingsPage() {
//   const [activeTab, setActiveTab] = useState<BookingTab>("upcoming");

//   const upcoming: Booking[] = MOCK_BOOKINGS.filter((b) => b.status === "confirmed");
//   const past: Booking[]     = MOCK_BOOKINGS.filter((b) => b.status !== "confirmed");
//   const displayed           = activeTab === "upcoming" ? upcoming : past;

//   return (
//     <div className="page-content">
//       <div className={styles.header}>
//         <h1 className={styles.headerTitle}>My Bookings</h1>
//         <span className={styles.headerCount}>
//           {displayed.length} appointment{displayed.length !== 1 ? "s" : ""}
//         </span>
//       </div>

//       {/* Tab toggle */}
//       <div className={styles.tabs}>
//         <button
//           className={`${styles.tabBtn}${activeTab === "upcoming" ? ` ${styles.tabActive}` : ""}`}
//           onClick={() => setActiveTab("upcoming")}
//         >
//           Upcoming
//           {upcoming.length > 0 && <span className={styles.tabBadge}>{upcoming.length}</span>}
//         </button>
//         <button
//           className={`${styles.tabBtn}${activeTab === "past" ? ` ${styles.tabActive}` : ""}`}
//           onClick={() => setActiveTab("past")}
//         >
//           Past
//         </button>
//       </div>

//       {/* List or empty state */}
//       {displayed.length > 0 ? (
//         <div className={styles.list}>
//           {displayed.map((booking) => (
//             <BookingCard key={booking.id} booking={booking} />
//           ))}
//         </div>
//       ) : (
//         <div className={styles.empty}>
//           <span className={styles.emptyIcon}>📅</span>
//           <p className={styles.emptyTitle}>
//             {activeTab === "upcoming" ? "No upcoming bookings" : "No past bookings"}
//           </p>
//           <p className={styles.emptySubtitle}>
//             {activeTab === "upcoming"
//               ? "Book your next grooming session with a top barber near you."
//               : "Your completed and cancelled appointments will appear here."}
//           </p>
//           {activeTab === "upcoming" && (
//             <Link href="/explore" className={styles.emptyCta}>
//               Find a Barber
//             </Link>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }


"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Clock, MapPin, Home, Search, BookOpen, Gift, User } from "lucide-react";
import styles from "./page.module.css";

type BookingStatus = "upcoming" | "completed" | "cancelled";

interface Booking {
  id: string;
  service: string;
  provider: string;
  date: string;
  time: string;
  location: string;
  status: BookingStatus;
}

const BOOKINGS: Booking[] = [
  {
    id: "1",
    service: "Skin Fade",
    provider: "with Marcus R.",
    date: "11:00 AM",
    time: "11:00 AM",
    location: "42 King St, Downtown",
    status: "upcoming",
  },
  {
    id: "2",
    service: "Classic Haircut & Beard Trim",
    provider: "with Marcus Rivera",
    date: "Sat, Feb 22",
    time: "10:00 AM",
    location: "Downtown Studio, NYC",
    status: "upcoming",
  },
  {
    id: "3",
    service: "Deep Tissue Massage",
    provider: "with Alex Thompson",
    date: "Wed, Feb 26",
    time: "2:30 PM",
    location: "Wellness Hub, Brooklyn",
    status: "upcoming",
  },
  {
    id: "4",
    service: "Pro Look Package",
    provider: "with James Chen",
    date: "Jan 28",
    time: "11:00 AM",
    location: "Midtown Barbers, NYC",
    status: "completed",
  },
  {
    id: "5",
    service: "Beard Sculpting",
    provider: "with Derek Williams",
    date: "Jan 15",
    time: "3:00 PM",
    location: "The Grooming Room, SoHo",
    status: "completed",
  },
];


export default function BookingsPage() {
  const router = useRouter();
  const [bookings,     setBookings]     = useState<Booking[]>(BOOKINGS);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [activeNav,    setActiveNav]    = useState("Bookings");

  const upcoming = bookings.filter((b) => b.status === "upcoming");
  const past     = bookings.filter((b) => b.status !== "upcoming");

  const handleCancel = (id: string) => {
    setCancellingId(id);
    setTimeout(() => {
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "cancelled" as BookingStatus } : b))
      );
      setCancellingId(null);
    }, 600);
  };

  return (
    <div className={styles.pageShell}>
      {/* Scrollable content */}
      <div className={styles.scrollArea}>
        {/* Header */}
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={() => router.back()} aria-label="Go back">
            <ArrowLeft size={18} />
          </button>
          <h1 className={styles.title}>My Bookings</h1>
        </div>

        <div className={styles.content}>
          {upcoming.length > 0 && (
            <section className={styles.section}>
              <p className={styles.sectionLabel}>UPCOMING</p>
              <div className={styles.list}>
                {upcoming.map((b) => (
                  <BookingCard
                    key={b.id}
                    booking={b}
                    cancelling={cancellingId === b.id}
                    onCancel={() => handleCancel(b.id)}
                  />
                ))}
              </div>
            </section>
          )}

          {past.length > 0 && (
            <section className={styles.section}>
              <p className={styles.sectionLabel}>PAST</p>
              <div className={styles.list}>
                {past.map((b) => (
                  <BookingCard key={b.id} booking={b} />
                ))}
              </div>
            </section>
          )}

          {bookings.length === 0 && (
            <div className={styles.empty}>
              <p className={styles.emptyText}>No bookings yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BookingCard({
  booking,
  cancelling,
  onCancel,
}: {
  booking: Booking;
  cancelling?: boolean;
  onCancel?: () => void;
}) {
  const isUpcoming  = booking.status === "upcoming";
  const isCancelled = booking.status === "cancelled";

  return (
    <div className={`${styles.card} ${isCancelled ? styles.cardCancelled : ""}`}>
      <div className={styles.cardTop}>
        <div className={styles.cardInfo}>
          <p className={styles.cardService}>{booking.service}</p>
          <p className={styles.cardProvider}>{booking.provider}</p>
        </div>
        <span className={`${styles.badge} ${styles[`badge_${booking.status}`]}`}>
          {isCancelled ? "cancelled" : booking.status}
        </span>
      </div>

      <div className={styles.cardMeta}>
        <div className={styles.metaRow}>
          <Calendar size={13} className={styles.metaIcon} />
          <span>{booking.date}</span>
        </div>
        <div className={styles.metaRow}>
          <Clock size={13} className={styles.metaIcon} />
          <span>{booking.time}</span>
        </div>
        <div className={styles.metaRow}>
          <MapPin size={13} className={styles.metaIcon} />
          <span>{booking.location}</span>
        </div>
      </div>

      {isUpcoming && onCancel && (
        <button
          className={styles.cancelBtn}
          onClick={onCancel}
          disabled={cancelling}
        >
          {cancelling ? "Cancelling…" : "Cancel Booking"}
        </button>
      )}
    </div>
  );
}