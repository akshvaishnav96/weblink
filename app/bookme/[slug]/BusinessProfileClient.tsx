"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Globe,
  MapPin,
  Zap,
  Search,
  Clock,
  Video,
  CreditCard,
  Home,
  Car,
  X,
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
import { LuFootprints, LuWallet } from "react-icons/lu";
import { FaFacebookF, FaTiktok, FaInstagram } from "react-icons/fa";
import { FaGoogle } from "react-icons/fa6";

type Tab = "services" | "portfolio" | "about";
type ServiceMode = "onsite" | "mobile";

function toAbsoluteUrl(url: string): string {
  if (!url) return url;
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

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
  initialProfile,
}: {
  slug: string;
  userId?: string | null;
  initialProfile?: ApiBusinessProfile | null;
}) {
  const router = useRouter();

  const [profile, setProfile] = useState<ApiBusinessProfile | null>(
    initialProfile ?? null,
  );
  const [loading, setLoading] = useState(!initialProfile);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("services");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedServiceId, setExpandedServiceId] = useState<string | null>(
    null,
  );
  const [serviceMode, setServiceMode] = useState<ServiceMode>("onsite");

  useEffect(() => {
    if (initialProfile) return;
    fetchBusinessProfileBySlug(slug)
      .then((data) => {
        setProfile(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message ?? "Failed to load profile");
        setLoading(false);
      });
  }, [slug, initialProfile]);

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
    PAY_ONLINE: {
      label: "PAY ONLINE",
      variant: "amber",
      icon: <CreditCard size={13} />,
    },
    PAY_ONSITE: {
      label: "PAY ONSITE",
      variant: "amber",
      icon: <LuWallet size={13} />,
    },
    PAY_ONLINE_OR_ONSITE: {
      label: "",
      variant: "amber",
      icon: (
        <>
          <CreditCard size={13} />
          <span style={{ marginLeft: 4 }}>PAY ONLINE</span>
          <span style={{ margin: "0 4px", opacity: 0.35 }}>·</span>
          <LuWallet size={13} />
          <span style={{ marginLeft: 4 }}>PAY ONSITE</span>
        </>
      ),
    },
    WALK_IN_ONLY: {
      label: "WALK-IN ONLY",
      variant: "gray",
      icon: <LuFootprints size={13} />,
    },
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
        {/* heroName / heroType sit directly in hero flex container — z-[5] above ::after z-index:1 */}
        <p className={`${styles.heroName} relative z-[5]`}>
          {profile.business_name}
        </p>
        {profile.business_type && (
          <p className={`${styles.heroType} relative z-[5]`}>
            {profile.business_type}
          </p>
        )}

        {/* heroSeats: text-shadow, exact gap 6px, font-size 13px — kept in CSS module */}
        {hasAvailableSlots && (
          <div className={`${styles.heroSeats} flex items-center gap-2`}>
            <div
              style={{
                height: "8px",
                width: "8px",
                background: "#0eaf0e",
                borderRadius: "50%",
                boxShadow: "0px 0px 10px green",
              }}
              className="w-2 h-2 min-w-2 min-h-2 bg-green-500"
            ></div>
            <span>Seats available today</span>
          </div>
        )}
      </div>

      {/* ── Info ── */}
      {/*
        top: -1.6rem negative offset not achievable with standard Tailwind.
        border-radius: 20px 20px 0 0 — Tailwind rounded-t-[20px] works but
        grouping with the negative top in same rule; kept in CSS module for precision.
      */}
      <div
        style={{ background: "white" }}
        className="p-[var(--sp-4)] border-b border-[var(--color-border-light)] relative top-[-1.6rem] mb-[-1.6rem] bg-white rounded-t-[20px] z-[2] w-full md:pt-[var(--sp-5)] md:px-[var(--sp-8)] md:pb-[var(--sp-6)] md:mx-auto md:border-b-0"
      >
        {/* infoName: exact 22px, font-weight 700, letter-spacing -0.4px */}
        <h1 className="text-[22px] font-bold text-[var(--color-text-primary)] tracking-[-0.4px] mb-1 md:text-[28px]">
          {profile.business_display_name ?? profile.business_name}
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
            <MapPin />{" "}
            <span className="text-[0.875rem]">{profile.business_address}</span>
          </a>
        )}

        {/* infoRating */}
        {profile.average_rating > 0 && (
          <div className="mt-[5px]">
            <StarRating
              rating={profile.average_rating}
              count={profile.total_reviews}
            />
          </div>
        )}

        {/* infoSocials */}
        <div className="flex gap-[var(--sp-5)] mt-[var(--sp-3)]">
          {profile.website_url && (
            /* socialLink class MUST stay: CSS module uses .socialLink:hover .socialBtn selector */
            <a
              href={toAbsoluteUrl(profile.website_url)}
              target="_blank"
              rel="noreferrer"
              className={styles.socialLink}
            >
              <div className={styles.socialBtn}>
                <Globe />
              </div>
              <span className="text-[10px] text-[var(--color-text-muted)]">
                Website
              </span>
            </a>
          )}
          {profile.instagram_url && (
            <a
              href={toAbsoluteUrl(profile.instagram_url)}
              target="_blank"
              rel="noreferrer"
              className={styles.socialLink}
            >
              <div className={styles.socialBtn}>
                <FaInstagram />
              </div>
              <span className="text-[10px] text-[var(--color-text-muted)]">
                Instagram
              </span>
            </a>
          )}
          {profile.facebook_url && (
            <a
              href={toAbsoluteUrl(profile.facebook_url)}
              target="_blank"
              rel="noreferrer"
              className={styles.socialLink}
            >
              <div className={styles.socialBtn}>
                <FaFacebookF />
              </div>
              <span className="text-[10px] text-[var(--color-text-muted)]">
                Facebook
              </span>
            </a>
          )}
          {profile.tiktok_url && (
            <a
              href={toAbsoluteUrl(profile.tiktok_url)}
              target="_blank"
              rel="noreferrer"
              className={styles.socialLink}
            >
              <div className={styles.socialBtn}>
                <FaTiktok />
              </div>
              <span className="text-[10px] text-[var(--color-text-muted)]">
                TikTok
              </span>
            </a>
          )}
          {profile.google_url && (
            <a
              href={toAbsoluteUrl(profile.google_url)}
              target="_blank"
              rel="noreferrer"
              className={styles.socialLink}
            >
              <div className={styles.socialBtn}>
                <FaGoogle />
              </div>
              <span className="text-[10px] text-[var(--color-text-muted)]">
                Website
              </span>
            </a>
          )}
        </div>

        {/* tabs */}
        <div
          style={{ gap: "0.5rem" }}
          className="flex items-center justify-center gap-2 mt-[var(--sp-4)] pb-0"
        >
          {TABS.map(({ id: tabId, label }) => (
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
        <div className=" pb-[var(--sp-6)] relative z-[1]">
          {/* servicesTop */}
          <div className="flex items-center justify-between px-[var(--sp-4)] pt-[var(--sp-4)] pb-[var(--sp-3)] md:px-[var(--sp-8)]">
            <h2 className="text-base font-bold text-[var(--color-text-primary)]">
              Services
            </h2>
            <button className="flex items-center gap-1 text-xs font-semibold text-[var(--color-primary)] bg-transparent border-none ">
              <Zap height={14} width={14} className="w-2 h-2" /> Book in 20
              seconds
            </button>
          </div>

          {/* modeToggle: bg #EDE8E1, padding 4px, border-radius 999px — kept in CSS module */}
          {hasMobileServices && (
            <div className="flex mx-[var(--sp-4)] mb-[var(--sp-3)] bg-[#EDE8E1] rounded-[12px] p-[4px]">
              <button
                className="flex-1 flex items-center justify-center gap-[6px] py-[9px] px-3 rounded-[9px] border-0 text-[13px] cursor-pointer transition-all duration-[180ms]"
                style={
                  serviceMode === "onsite"
                    ? {
                        backgroundColor: "#fff",
                        fontWeight: 600,
                        color: "#1a1a1a",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
                      }
                    : {
                        backgroundColor: "transparent",
                        fontWeight: 500,
                        color: "#7a6f63",
                      }
                }
                onClick={() => setServiceMode("onsite")}
              >
                <Home size={13} /> Onsite
              </button>
              <button
                className="flex-1 flex items-center justify-center gap-[6px] py-[9px] px-3 rounded-[9px] border-0 text-[13px] cursor-pointer transition-all duration-[180ms]"
                style={
                  serviceMode === "mobile"
                    ? {
                        backgroundColor: "#fff",
                        fontWeight: 600,
                        color: "#1a1a1a",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
                      }
                    : {
                        backgroundColor: "transparent",
                        fontWeight: 500,
                        color: "#7a6f63",
                      }
                }
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
            {searchQuery && (
              <button
                className={styles.serviceSearchClear}
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
              >
                <X />
              </button>
            )}
          </div>

          {/* servicesList */}
          <div className="px-[var(--sp-4)] pt-[10px] pb-[var(--sp-4)] flex flex-col gap-[10px] md:px-[var(--sp-8)] md:pt-[var(--sp-3)]">
            {filteredServices.length > 0 ? (
              filteredServices.map((s) => {
                const { label, variant, icon } = SECTION_CONFIG[s.paymentType];
                return (
                  <div
                    key={s.id}
                    className={
                      expandedServiceId === s.id
                        ? "border border-[rgba(167,166,166,0.358)] rounded-[12px] overflow-hidden bg-[#faf7f2] shadow-[0_0px_5px_0_rgba(201,138,1,0.849)] transition-[border-color] duration-[150ms]"
                        : "border border-[rgba(167,166,166,0.358)] rounded-[12px] overflow-hidden bg-[#faf7f2] shadow-[0_1px_4px_rgba(184,134,11,0.07)] transition-[border-color] duration-[150ms]"
                    }
                  >
                    <div
                      style={{ fontWeight: "bolder", fontSize: "0.865rem" }}
                      className={
                        variant === "amber"
                          ? "flex items-center gap-[6px] px-[14px] py-[6px] text-[11px] font-bold tracking-[0.08em] uppercase bg-[#FAF5EB] border-b border-[#EDE0BF] text-[#9B6B0A]"
                          : "flex items-center gap-[6px] px-[14px] py-[6px] text-[11px] font-bold tracking-[0.08em] uppercase bg-[#F5F4F1] border-b border-[#E8E6E2] text-[#888888]"
                      }
                    >
                      <span className="inline-flex items-center flex-shrink-0">
                        {icon}
                      </span>
                      <span>{label}</span>
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
            <div className="grid grid-cols-3 gap-[2px] mt-[var(--sp-3)]">
              {profile.portfolio.images.map((img) => (
                <div
                  key={img.id}
                  className="w-full aspect-square block relative"
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
                        className="w-[60px] h-[60px] rounded-full object-cover"
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
                      <p className="text-[11px] text-[var(--color-text-muted)] leading-[1.5]">
                        {member.bio}
                      </p>
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
