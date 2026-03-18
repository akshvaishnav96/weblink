"use client";

import React, { use, useState, useEffect, useMemo } from "react";
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
  fetchBusinessProfile,
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

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function BusinessProfilePage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = use(params);
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
  console.log("BusinessProfilePage rendered with slug:", slug, "id:", id);
  useEffect(() => {
    fetchBusinessProfile(slug, id)
      .then((data) => {
        setProfile(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message ?? "Failed to load profile");
        setLoading(false);
      });
  }, [slug, id]);

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

  if (loading)
    return (
      <div className={styles.loadingState}>
        <div className={styles.loadingSpinner} />
        <p className={styles.loadingText}>Loading profile…</p>
      </div>
    );

  if (error || !profile)
    return (
      <div className={styles.errorState}>
        <p className={styles.errorMsg}>{error ?? "Profile not found"}</p>
        <button onClick={() => router.back()} className={styles.errorBackBtn}>
          Go back
        </button>
      </div>
    );

  return (
    <div className="page-content">
      {/* ── Hero ── */}
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
        <button className={styles.heroBack} onClick={() => router.back()}>
          <ArrowLeft />
        </button>
        <div className={styles.heroCenter}>
          <p className={styles.heroName}>{profile.business_name}</p>
          {profile.business_type && (
            <p className={styles.heroType}>{profile.business_type}</p>
          )}
        </div>
        {hasAvailableSlots && (
          <div className={styles.heroSeats}>
            <span className={styles.heroSeatsDot} />
            Seats available today
          </div>
        )}
      </div>

      {/* ── Info ── */}
      <div className={styles.info}>
        <h1 className={styles.infoName}>
          {profile.business_display_name ?? profile.business_name}
        </h1>
        {/* {profile.business_address && (
          <p className={styles.infoAddress}>
            <MapPin /> {profile.business_address}
          </p>
        )} */}
        <div className={styles.infoRating}>
          <StarRating
            rating={profile.average_rating}
            count={profile.total_reviews}
          />
        </div>
        <div className={styles.infoSocials}>
          {profile.website_url && (
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
        <div className={styles.tabs}>
          {TABS.map(({ id: tabId, label }, i) => (
            <button
              key={tabId}
              onClick={() => setActiveTab(tabId)}
              className={`${styles.tabBtn}${activeTab === tabId ? ` ${styles.tabActive}` : ""}${i < TABS.length - 1 ? ` ${styles.tabBtnBorder}` : ""}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Services Tab ── */}
      {activeTab === "services" && (
        <div className={styles.servicesSection}>
          <div className={styles.servicesTop}>
            <h2 className={styles.servicesTopTitle}>Services</h2>
            <button className={styles.quickBook}>
              <Zap /> Book in 20 seconds
            </button>
          </div>

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

          <div className={styles.servicesList}>
            {filteredServices.length > 0 ? (
              filteredServices.map((s) => {
                const { label, variant, icon } = SECTION_CONFIG[s.paymentType];
                return (
                  <div key={s.id} className={styles.serviceCard}>
                    <div
                      className={`${styles.sectionHeader} ${variant === "amber" ? styles.sectionHeaderAmber : styles.sectionHeaderGray}`}
                    >
                      <span className={styles.sectionHeaderIcon}>{icon}</span>
                      {label}
                    </div>
                    <ServiceRow
                      service={s}
                      barberId={id}
                      numericBusinessId={String(profile.id)}
                      barberSlug={slug}
                      businessName={
                        profile.business_display_name ?? profile.business_name
                      }
                      businessAddress={profile.business_address}
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
              <p className={styles.noResults}>No services found</p>
            )}
          </div>
        </div>
      )}

      {/* ── Portfolio Tab ── */}
      {activeTab === "portfolio" && (
        <div className={styles.portfolioTab}>
          {profile.portfolio?.description && (
            <p className={styles.portfolioDesc}>
              {profile.portfolio.description}
            </p>
          )}
          {profile.portfolio?.images?.length > 0 && (
            <div className={styles.portfolioGrid}>
              {profile.portfolio.images.map((img) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={img.id}
                  src={img.portfolio_url}
                  alt="Portfolio"
                  className={styles.portfolioImg}
                />
              ))}
            </div>
          )}
          {profile.portfolio?.videos?.length > 0 && (
            <div className={styles.videosSection}>
              <h3 className={styles.videosSectionTitle}>
                <Video /> Videos
              </h3>
              <div className={styles.videosGrid}>
                {profile.portfolio.videos.map((vid) => (
                  <video
                    key={vid.id}
                    src={vid.portfolio_url}
                    controls
                    className={styles.portfolioVideo}
                    playsInline
                  />
                ))}
              </div>
            </div>
          )}
          {!profile.portfolio?.images?.length &&
            !profile.portfolio?.videos?.length && (
              <div className={styles.portfolioEmpty}>
                No portfolio items yet
              </div>
            )}
        </div>
      )}

      {/* ── About Tab ── */}
      {activeTab === "about" && (
        <div className={styles.aboutTab}>
          {profile.who_we_are && (
            <p className={styles.aboutBio}>{profile.who_we_are}</p>
          )}
          {profile.open_hours?.length > 0 && (
            <div className={styles.openHoursSection}>
              <h3 className={styles.sectionTitle}>
                <Clock /> Opening Hours
              </h3>
              <div className={styles.hoursTable}>
                {profile.open_hours.map((h) => (
                  <div key={h.id} className={styles.hoursRow}>
                    <span className={styles.hoursDay}>{h.day}</span>
                    <span
                      className={`${styles.hoursTime}${h.is_closed ? ` ${styles.hoursClosed}` : ""}`}
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
          {profile.staff?.length > 0 && (
            <div className={styles.teamSection}>
              <h3 className={styles.sectionTitle}>Our Team</h3>
              <div className={styles.teamGrid}>
                {profile.staff.map((member, i) => (
                  <div key={i} className={styles.teamCard}>
                    {member.picture ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={member.picture}
                        alt={member.name}
                        className={styles.teamAvatar}
                      />
                    ) : (
                      <BarberAvatar
                        initials={getInitials(member.name)}
                        size="md"
                      />
                    )}
                    <p className={styles.teamName}>{member.name}</p>
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
    </div>
  );
}
