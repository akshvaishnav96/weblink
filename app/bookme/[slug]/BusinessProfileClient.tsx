"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Globe,
  Instagram,
  MapPin,
  Zap,
  Search,
  Clock,
  Video,
  ExternalLink,
  CreditCard,
  Home,
  User,
  Car,
} from "lucide-react";
import BarberAvatar from "@/components/ui/BarberAvatar";
import StarRating from "@/components/ui/StarRating";
import ServiceRow from "@/components/barber/ServiceRow";
import {
  fetchBusinessProfileBySlug,
  type ApiBusinessProfile,
  type ApiService,
} from "@/lib/api";
import type { Service, StaffAvailability } from "@/types";
import styles from "./page.module.css";

type Tab = "services" | "portfolio" | "about";
type ServiceMode = "onsite" | "mobile";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatApiTime(time: string): string {
  const [hours, minutes] = time.split(":");
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return minutes === "00" ? `${h12} ${ampm}` : `${h12}:${minutes} ${ampm}`;
}

function formatSlotStart(slot: string): string {
  return formatApiTime(slot.split("-")[0]);
}

function applyDiscount(
  base: number,
  isDiscount: number,
  pct: string,
): { price: number; originalPrice?: number } {
  const discountPct = parseFloat(pct) || 0;
  if (isDiscount && discountPct > 0) {
    return {
      price: Math.round(base * (1 - discountPct / 100) * 100) / 100,
      originalPrice: base,
    };
  }
  return { price: base };
}

function getPaymentType(
  serviceType: ApiService["service_type"],
): Service["paymentType"] {
  if (serviceType === "walkin") return "WALK_IN_ONLY";
  if (serviceType === "mobile") return "PAY_ONLINE";
  if (serviceType === "both") return "PAY_ONLINE_OR_ONSITE";
  return "PAY_ONSITE";
}

function mapApiService(apiService: ApiService, mode: ServiceMode): Service {
  let price: number;
  let originalPrice: number | undefined;
  const paymentType = getPaymentType(apiService.service_type);

  if (apiService.service_type === "walkin") {
    const d = applyDiscount(
      parseFloat(apiService.walk_price) || 0,
      apiService.is_walk_discount,
      apiService.walk_discount_percentage,
    );
    price = d.price;
    originalPrice = d.originalPrice;
  } else if (apiService.service_type === "mobile") {
    const d = applyDiscount(
      parseFloat(apiService.mobile_price) || 0,
      apiService.is_mobile_discount,
      apiService.mobile_discount_percentage,
    );
    price = d.price;
    originalPrice = d.originalPrice;
  } else {
    const useMobile = mode === "mobile";
    const d = useMobile
      ? applyDiscount(
          parseFloat(apiService.mobile_price) || 0,
          apiService.is_mobile_discount,
          apiService.mobile_discount_percentage,
        )
      : applyDiscount(
          parseFloat(apiService.walk_price) || 0,
          apiService.is_walk_discount,
          apiService.walk_discount_percentage,
        );
    price = d.price;
    originalPrice = d.originalPrice;
  }

  const staffAvailability: StaffAvailability[] = apiService.staff
    .filter((s) => s.staff_availability.length > 0)
    .map((staff) => {
      const avail = staff.staff_availability[0];
      return {
        staffId: staff.id.toString(),
        staffInitials: getInitials(staff.name),
        staffName: staff.name,
        slots: (avail?.slots ?? []).map(formatSlotStart),
        hours:
          avail?.open_time && avail?.close_time
            ? `${formatApiTime(avail.open_time)} – ${formatApiTime(avail.close_time)}`
            : undefined,
      };
    });

  const resolvedServiceType =
    apiService.service_type === "both"
      ? mode === "mobile"
        ? "mobile"
        : "walkin"
      : apiService.service_type;

  return {
    id: apiService.id.toString(),
    name: apiService.service_name,
    duration: apiService.time,
    price,
    originalPrice,
    description: apiService.service_description ?? undefined,
    serviceType: resolvedServiceType,
    paymentType,
    staffAvailability:
      staffAvailability.length > 0 ? staffAvailability : undefined,
  };
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function BusinessProfileClient({
  slug,
  userId,
}: {
  slug: string;
  userId?: string | null;
}) {
  const router = useRouter();

  const [profile, setProfile] = useState<ApiBusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("services");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedServiceId, setExpandedServiceId] = useState<string | null>(
    null,
  );
  const [serviceMode, setServiceMode] = useState<ServiceMode>("onsite");

  useEffect(() => {
    fetchBusinessProfileBySlug(slug)
      .then((data) => {
        setProfile(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message ?? "Failed to load profile");
        setLoading(false);
      });
  }, [slug]);

  const hasMobileServices = useMemo(
    () =>
      profile?.services.some(
        (s) => s.service_type === "mobile" || s.service_type === "both",
      ) ?? false,
    [profile],
  );

  const mappedServices = useMemo(() => {
    if (!profile) return [];
    return profile.services
      .filter((s) =>
        serviceMode === "mobile"
          ? s.service_type === "mobile" || s.service_type === "both"
          : true,
      )
      .map((s) => mapApiService(s, serviceMode));
  }, [profile, serviceMode]);

  const filteredServices = useMemo(
    () =>
      mappedServices.filter((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [mappedServices, searchQuery],
  );

  const TABS = [
    { id: "services" as Tab, label: "Services" },
    { id: "portfolio" as Tab, label: "Portfolio" },
    { id: "about" as Tab, label: "About" },
  ];

  type PaymentType = Service["paymentType"];
  const SECTION_CONFIG: Record<
    PaymentType,
    { label: string; variant: "amber" | "gray"; icon: React.ReactNode }
  > = {
    PAY_ONLINE: { label: "PAY ONLINE", variant: "amber", icon: <CreditCard /> },
    PAY_ONSITE: { label: "PAY ONSITE", variant: "amber", icon: <Home /> },
    PAY_ONLINE_OR_ONSITE: {
      label: "",
      variant: "amber",
      icon: (
        <>
          <CreditCard />
          <span
            style={{
              fontWeight: 700,
              letterSpacing: "0.06em",
              fontSize: 10,
              marginLeft: 4,
            }}
          >
            PAY ONLINE
          </span>
          <span style={{ margin: "0 5px", opacity: 0.35 }}>·</span>
          <Home />
          <span
            style={{
              fontWeight: 700,
              letterSpacing: "0.06em",
              fontSize: 10,
              marginLeft: 4,
            }}
          >
            PAY ONSITE
          </span>
        </>
      ),
    },
    WALK_IN_ONLY: { label: "WALK-IN ONLY", variant: "gray", icon: <User /> },
  };

  const hasAvailableSlots = mappedServices.some((s) =>
    s.staffAvailability?.some((st) => st.slots.length > 0),
  );

  // ── Loading ──
  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        {/* loadingSpinner uses custom animation + color tokens — kept in CSS module */}
        <div className={styles.loadingSpinner} />
        <p className="text-sm text-[var(--color-text-muted)]">
          Loading profile…
        </p>
      </div>
    );

  // ── Error ──
  if (error || !profile)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-4 text-center">
        <p className="text-sm text-[var(--color-text-muted)]">
          {error ?? "Profile not found"}
        </p>
      </div>
    );

  return (
    <div className="page-content">
      {/* ── Hero ── */}
      {/*
        .hero background gradient uses rgba alpha mid-stops unsupported by Tailwind utilities.
        ::after radial-gradient overlay requires pseudo-element — kept in CSS module.
        .heroBanner::after override also kept in CSS module.
      */}
      <div
        className={`${styles.hero}${profile.business_banner ? ` ${styles.heroBanner}` : ""}`}
        style={
          profile.business_banner
            ? {
                backgroundImage: `url(${profile.business_banner})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      >
     

        {/* heroCenter — CSS module: z-index:5 must sit above ::after z-index:1 */}
        <div className={styles.heroCenter}>
          <p className={styles.heroName}>{profile.business_name}</p>
          {profile.business_type && (
            <p className={styles.heroType}>{profile.business_type}</p>
          )}
        </div>

        {/* heroSeats: text-shadow, exact gap 6px, font-size 13px — kept in CSS module */}
        {hasAvailableSlots && (
          <div className={styles.heroSeats}>
            {/* heroSeatsDot: box-shadow ring rgba — kept in CSS module */}
            <span className={styles.heroSeatsDot} />
            Seats available today
          </div>
        )}
      </div>

      {/* ── Info ── */}
      {/*
        top: -1.6rem negative offset not achievable with standard Tailwind.
        border-radius: 20px 20px 0 0 — Tailwind rounded-t-[20px] works but
        grouping with the negative top in same rule; kept in CSS module for precision.
      */}
      <div className={styles.info}>
        {/* infoName: exact 22px, font-weight 700, letter-spacing -0.4px */}
        <h1 className="text-[22px] font-bold text-[var(--color-text-primary)] tracking-[-0.4px] mb-1 md:text-[28px]">
          {(() => {
            const name = profile.business_display_name ?? profile.business_name;
            const parts = (profile.business_address ?? "")
              .split(",")
              .map((s) => s.trim());
            const suburb = parts[1] ?? "";
            const state = parts[2]?.split(" ")[0] ?? "";
            const location = [suburb, state].filter(Boolean).join(" ");
            return location
              ? `${name} \u2014 Walk-ins Welcome, ${location}`
              : name;
          })()}
        </h1>

        {/* infoAddress: gap 4px, 13px, margin-top 3px — kept in CSS module (svg color token) */}
        {profile.business_address && (
          <a
            href={
              profile.latitude && profile.longitude
                ? `https://www.google.com/maps?q=${profile.latitude},${profile.longitude}`
                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.business_address)}`
            }
            target="_blank"
            rel="noreferrer"
            className={styles.infoAddress}
          >
            <MapPin /> {profile.business_address}
          </a>
        )}

        {/* infoRating */}
        <div className="mt-[5px]">
          <StarRating
            rating={profile.average_rating}
            count={profile.total_reviews}
          />
        </div>

        {/* infoSocials */}
        <div className="flex gap-[var(--sp-5)] mt-[var(--sp-3)]">
          {profile.website_url && (
            /* socialLink class MUST stay: CSS module uses .socialLink:hover .socialBtn selector */
            <a
              href={profile.website_url}
              target="_blank"
              rel="noreferrer"
              className={styles.socialLink}
            >
              <div className={styles.socialBtn}>
                <Globe />
              </div>
              <span className={styles.socialLabel}>Website</span>
            </a>
          )}
          {profile.instagram_url && (
            <a
              href={profile.instagram_url}
              target="_blank"
              rel="noreferrer"
              className={styles.socialLink}
            >
              <div className={styles.socialBtn}>
                <Instagram />
              </div>
              <span className={styles.socialLabel}>Instagram</span>
            </a>
          )}
          {profile.facebook_url && (
            <a
              href={profile.facebook_url}
              target="_blank"
              rel="noreferrer"
              className={styles.socialLink}
            >
              <div className={styles.socialBtn}>
                <ExternalLink />
              </div>
              <span className={styles.socialLabel}>Facebook</span>
            </a>
          )}
          {profile.tiktok_url && (
            <a
              href={profile.tiktok_url}
              target="_blank"
              rel="noreferrer"
              className={styles.socialLink}
            >
              <div className={styles.socialBtn}>
                <ExternalLink />
              </div>
              <span className={styles.socialLabel}>TikTok</span>
            </a>
          )}
        </div>

        {/* tabs */}
        <div className={`flex gap-4 mt-[var(--sp-4)] ${styles.tabBtnMain}`}>
          {TABS.map(({ id: tabId, label }, i) => (
            <button
              key={tabId}
              onClick={() => setActiveTab(tabId)}
              /* tabBtn: 1.5px border #DEDAD3, exact padding/font — kept in CSS module */
              className={`${styles.tabBtn}${activeTab === tabId ? ` ${styles.tabActive}` : ""}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Services Tab ── */}
      {activeTab === "services" && (
        /* servicesSection: bg #F5F2ED */
        <div className="bg-[#F5F2ED] pb-[var(--sp-6)] relative z-[1]">
          {/* servicesTop */}
          <div className="flex items-center justify-between px-[var(--sp-4)] pt-[var(--sp-4)] pb-[var(--sp-3)] md:px-[var(--sp-8)]">
            <h2 className="text-base font-bold text-[var(--color-text-primary)]">
              Services
            </h2>
            <button className="flex items-center gap-1 text-xs font-semibold text-[var(--color-primary)] bg-transparent border-none ">
              <Zap className="w-2 h-2" /> Book in 20 seconds
            </button>
          </div>

          {/* modeToggle: bg #EDE8E1, padding 4px, border-radius 999px — kept in CSS module */}
          {hasMobileServices && (
            <div className={styles.modeToggle}>
              <button
                className={`${styles.modeBtn}${serviceMode === "onsite" ? ` ${styles.modeBtnActive}` : ""}`}
                onClick={() => setServiceMode("onsite")}
              >
                <Home size={13} /> Walk-in
              </button>
              <button
                className={`${styles.modeBtn}${serviceMode === "mobile" ? ` ${styles.modeBtnActive}` : ""}`}
                onClick={() => setServiceMode("mobile")}
              >
                <Car size={13} /> Mobile
              </button>
            </div>
          )}

          {/* serviceSearch: 1.5px border, border-radius 10px, exact focus — kept in CSS module */}
          <div className={styles.serviceSearch}>
            <Search />
            <input
              type="text"
              placeholder="Search services…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.serviceSearchInput}
            />
          </div>

          {/* servicesList */}
          <div className="px-[var(--sp-4)] pt-[10px] pb-[var(--sp-4)] flex flex-col gap-[10px] md:px-[var(--sp-8)] md:pt-[var(--sp-3)]">
            {filteredServices.length > 0 ? (
              filteredServices.map((s) => {
                const { label, variant, icon } = SECTION_CONFIG[s.paymentType];
                return (
                  /* serviceCard: border #E2C97A, box-shadow rgba — kept in CSS module */
                  <div key={s.id} className={styles.serviceCard}>
                    <div
                      className={`${styles.sectionHeader} ${variant === "amber" ? styles.sectionHeaderAmber : styles.sectionHeaderGray}`}
                    >
                      <span className={styles.sectionHeaderIcon}>{icon}</span>
                      {label}
                    </div>
                    <ServiceRow
                      service={s}
                      businessId={String(profile.id)}
                      barberSlug={slug}
                      businessName={
                        profile.business_display_name ?? profile.business_name
                      }
                      businessAddress={profile.business_address}
                      userId={userId}
                      hideBadge
                      expanded={expandedServiceId === s.id}
                      onToggle={() =>
                        setExpandedServiceId(
                          expandedServiceId === s.id ? null : s.id,
                        )
                      }
                      serviceMode={serviceMode}
                    />
                  </div>
                );
              })
            ) : (
              <p className="py-[var(--sp-6)] px-[var(--sp-4)] text-center text-sm text-[var(--color-text-muted)] italic">
                No services found
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Portfolio Tab ── */}
      {activeTab === "portfolio" && (
        <div className="pb-[var(--sp-6)]">
          {profile.portfolio?.description && (
            <p className="px-[var(--sp-4)] pt-[var(--sp-4)] text-sm text-[var(--color-text-secondary)] leading-[1.6]">
              {profile.portfolio.description}
            </p>
          )}
          {/* portfolioGrid: gap 2px, 3-col — kept in CSS module */}
          {profile.portfolio?.images?.length > 0 && (
            <div className={styles.portfolioGrid}>
              {profile.portfolio.images.map((img) => (
                <div
                  key={img.id}
                  className={styles.portfolioImg}
                  style={{ position: "relative" }}
                >
                  <Image
                    src={img.portfolio_url}
                    alt="Portfolio"
                    fill
                    style={{ objectFit: "cover" }}
                    sizes="(max-width: 600px) 50vw, 33vw"
                  />
                </div>
              ))}
            </div>
          )}
          {profile.portfolio?.videos?.length > 0 && (
            <div className="p-[var(--sp-4)]">
              <h3 className="flex items-center gap-[var(--sp-2)] text-base font-bold text-[var(--color-text-primary)] mb-[var(--sp-3)]">
                <Video className="w-4 h-4 text-[var(--color-primary)]" /> Videos
              </h3>
              <div className="flex flex-col gap-[var(--sp-3)]">
                {profile.portfolio.videos.map((vid) => (
                  <video
                    key={vid.id}
                    src={vid.portfolio_url}
                    controls
                    className="w-full rounded-[var(--radius-md)] bg-black max-h-[320px]"
                    playsInline
                  />
                ))}
              </div>
            </div>
          )}
          {!profile.portfolio?.images?.length &&
            !profile.portfolio?.videos?.length && (
              <div className="flex items-center justify-center py-20 px-[var(--sp-4)] text-sm text-[var(--color-text-muted)] italic">
                No portfolio items yet
              </div>
            )}
        </div>
      )}

      {/* ── About Tab ── */}
      {activeTab === "about" && (
        <div className="p-[var(--sp-4)] flex flex-col gap-[var(--sp-6)] md:px-[var(--sp-8)] md:py-[var(--sp-6)]">
          {profile.who_we_are && (
            <p className="text-sm text-[var(--color-text-secondary)] leading-[1.65] md:text-base">
              {profile.who_we_are}
            </p>
          )}

          {/* Opening Hours */}
          {profile.open_hours?.length > 0 && (
            <div>
              <h3 className="flex items-center gap-[var(--sp-2)] text-base font-bold text-[var(--color-text-primary)] mb-[var(--sp-3)]">
                <Clock className="w-4 h-4 flex-shrink-0 text-[var(--color-primary)]" />{" "}
                Opening Hours
              </h3>
              {/* hoursTable */}
              <div className="flex flex-col gap-0.5 border border-[var(--color-border-light)] rounded-[var(--radius-md)] overflow-hidden">
                {/* hoursRow: nth-child alternating bg — kept in CSS module */}
                {profile.open_hours.map((h) => (
                  <div key={h.id} className={styles.hoursRow}>
                    <span className="font-medium text-[var(--color-text-primary)] min-w-[90px]">
                      {h.day}
                    </span>
                    <span
                      className={`text-[var(--color-text-secondary)]${h.is_closed ? " text-[var(--color-text-muted)] italic" : ""}`}
                    >
                      {h.is_closed
                        ? "Closed"
                        : `${formatApiTime(h.open_time!)} – ${formatApiTime(h.close_time!)}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Team */}
          {profile.staff?.length > 0 && (
            <div>
              <h3 className="flex items-center gap-[var(--sp-2)] text-base font-bold text-[var(--color-text-primary)] mb-[var(--sp-3)]">
                Our Team
              </h3>
              {/* teamGrid: 2-col */}
              <div className="grid grid-cols-2 gap-[var(--sp-3)]">
                {profile.staff.map((member, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-[var(--sp-2)] p-[var(--sp-4)] px-[var(--sp-3)] border border-[var(--color-border-light)] rounded-[var(--radius-lg)] bg-[var(--color-surface)] text-center"
                  >
                    {member.picture ? (
                      /* teamAvatar: 60x60, rounded-full, object-cover — kept in CSS module */
                      <Image
                        src={member.picture}
                        alt={member.name}
                        width={60}
                        height={60}
                        className={styles.teamAvatar}
                      />
                    ) : (
                      <BarberAvatar
                        initials={getInitials(member.name)}
                        size="md"
                      />
                    )}
                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                      {member.name}
                    </p>
                    {/* teamBio: 11px — kept in CSS module (non-standard size) */}
                    {member.bio && (
                      <p className={styles.teamBio}>{member.bio}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── JSON-LD ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: profile.business_display_name ?? profile.business_name,
            address: {
              "@type": "PostalAddress",
              streetAddress: profile.business_address,
            },
            telephone: profile.business_phone ?? undefined,
            url:
              profile.website_url ?? `https://valetvault.com.au/bookme/${slug}`,
            image: profile.business_banner ?? undefined,
            ...(profile.latitude && profile.longitude
              ? {
                  geo: {
                    "@type": "GeoCoordinates",
                    latitude: profile.latitude,
                    longitude: profile.longitude,
                  },
                }
              : {}),
          }),
        }}
      />
    </div>
  );
}
