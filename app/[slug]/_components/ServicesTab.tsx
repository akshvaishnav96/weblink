"use client";

import React from "react";
import { Zap, Search, CreditCard, Home, Car, X } from "lucide-react";
import { LuWallet, LuFootprints } from "react-icons/lu";
import ServiceRow from "@/components/barber/ServiceRow";
import type { ApiBusinessProfile } from "@/lib/api";
import type { Service } from "@/types";
import { type ServiceMode } from "../_utils";
import styles from "../page.module.css";

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

interface ServicesTabProps {
  profile: ApiBusinessProfile;
  slug: string;
  userId?: string | null;
  filteredServices: Service[];
  hasMobileServices: boolean;
  serviceMode: ServiceMode;
  onServiceModeChange: (mode: ServiceMode) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  expandedServiceId: string | null;
  onExpandedChange: (id: string | null) => void;
}

export default function ServicesTab({
  profile,
  slug,
  userId,
  filteredServices,
  hasMobileServices,
  serviceMode,
  onServiceModeChange,
  searchQuery,
  onSearchChange,
  expandedServiceId,
  onExpandedChange,
}: ServicesTabProps) {
  return (
    /* servicesSection: bg #F5F2ED */
    <div className=" pb-[var(--sp-6)] relative z-[1]">
      {/* servicesTop */}
      <div className="flex items-center justify-between px-[var(--sp-4)] pt-[var(--sp-4)] pb-[var(--sp-3)] md:px-[var(--sp-8)]">
        <h2 className="text-base font-bold text-[var(--color-text-primary)]">
          Services
        </h2>
        <button className="flex items-center gap-1 text-xs font-semibold text-[var(--color-primary)] bg-transparent border-none ">
          <Zap height={14} width={14} className="w-2 h-2" /> Book in 20 seconds
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
            onClick={() => onServiceModeChange("onsite")}
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
            onClick={() => onServiceModeChange("mobile")}
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
                    onExpandedChange(expandedServiceId === s.id ? null : s.id)
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
  );
}
