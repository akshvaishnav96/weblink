"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { fetchBusinessProfileBySlug, type ApiBusinessProfile } from "@/lib/api";
import { type Tab, type ServiceMode, mapApiService } from "./_utils";
import { trackPageVisit, trackServiceSelected } from "@/lib/analytics";
import ProfileHero from "./_components/hero/ProfileHero";
import ProfileInfo from "./_components/info/ProfileInfo";
import ServicesTab from "./_components/services/ServicesTab";
import PortfolioTab from "./_components/portfolio/PortfolioTab";
import AboutTab from "./_components/about/AboutTab";
import styles from "./page.module.css";

export default function BusinessProfileClient({
  slug,
  userId,
  initialProfile,
}: {
  slug: string;
  userId?: string | null;
  initialProfile?: ApiBusinessProfile | null;
}) {

  const [profile, setProfile] = useState<ApiBusinessProfile | null>(
    initialProfile ?? null,
  );
  const [loading, setLoading] = useState(!initialProfile);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("services");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedServiceId, setExpandedServiceId] = useState<string | null>(null);
  const [serviceMode, setServiceMode] = useState<ServiceMode>("onsite");
  const lastServiceRef = useRef<string | null>(null);

  // Page visit — once per session per slug.
  // Intentionally using profile?.id (not profile) so this only re-fires when the
  // business actually changes, not every time the profile object reference updates.
  useEffect(() => {
    if (profile) {
      trackPageVisit(slug, profile.business_display_name ?? profile.business_name, String(profile.id));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, profile?.id]);

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

  const hasWalkinServices = useMemo(
    () => profile?.services.some((s) => s.service_type === "walkin") ?? false,
    [profile],
  );
  const hasMobileOnlyServices = useMemo(
    () => profile?.services.some((s) => s.service_type === "mobile") ?? false,
    [profile],
  );
  const hasBothServices = useMemo(
    () => profile?.services.some((s) => s.service_type === "both") ?? false,
    [profile],
  );

  // Show toggle when: any service is "both"  OR  there's a mix of walkin + mobile
  const hasMobileServices =
    hasBothServices || (hasWalkinServices && hasMobileOnlyServices);

  // Auto-switch to mobile when there are only mobile-type services
  useEffect(() => {
    if (!hasWalkinServices && !hasBothServices && hasMobileOnlyServices) {
      setServiceMode("mobile");
    }
  }, [hasWalkinServices, hasBothServices, hasMobileOnlyServices]);

  const mappedServices = useMemo(() => {
    if (!profile) return [];
    return profile.services
      .filter((s) =>
        serviceMode === "mobile"
          ? s.service_type === "mobile" || s.service_type === "both"
          : s.service_type === "walkin" || s.service_type === "both",
      )
      .map((s) => mapApiService(s, serviceMode))
      .filter((s) => s.price > 0);
  }, [profile, serviceMode]);

  const filteredServices = useMemo(
    () =>
      mappedServices.filter((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [mappedServices, searchQuery],
  );

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
      <ProfileHero profile={profile} hasAvailableSlots={hasAvailableSlots} />

      {/* ── Info card + Tabs ── */}
      <ProfileInfo
        profile={profile}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* ── Services Tab ── */}
      {activeTab === "services" && (
        <ServicesTab
          profile={profile}
          slug={slug}
          userId={userId}
          filteredServices={filteredServices}
          hasMobileServices={hasMobileServices}
          serviceMode={serviceMode}
          onServiceModeChange={setServiceMode}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          expandedServiceId={expandedServiceId}
          onExpandedChange={(id) => {
            setExpandedServiceId(id);
            if (id !== null) {
              const svc = filteredServices.find((s) => s.id === id);
              if (svc) trackServiceSelected(lastServiceRef, String(id), svc.name, slug, String(profile?.id ?? ""));
            }
          }}
        />
      )}

      {/* ── Portfolio Tab ── */}
      {activeTab === "portfolio" && <PortfolioTab profile={profile} />}

      {/* ── About Tab ── */}
      {activeTab === "about" && <AboutTab profile={profile} />}

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
