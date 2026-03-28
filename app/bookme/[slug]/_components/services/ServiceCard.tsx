"use client";

import React from "react";
import { CreditCard } from "lucide-react";
import { LuWallet, LuFootprints } from "react-icons/lu";
import ServiceRow from "@/components/barber/ServiceRow";
import type { ApiBusinessProfile } from "@/lib/api";
import type { Service } from "@/types";
import { type ServiceMode } from "../../_utils";

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

interface ServiceCardProps {
  service: Service;
  profile: ApiBusinessProfile;
  slug: string;
  userId?: string | null;
  isExpanded: boolean;
  onToggle: () => void;
  serviceMode: ServiceMode;
}

export default function ServiceCard({
  service,
  profile,
  slug,
  userId,
  isExpanded,
  onToggle,
  serviceMode,
}: ServiceCardProps) {
  const { label, variant, icon } = SECTION_CONFIG[service.paymentType];

  return (
    <div
      className={
        isExpanded
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
        <span className="inline-flex items-center flex-shrink-0">{icon}</span>
        <span>{label}</span>
      </div>
      <ServiceRow
        service={service}
        businessId={String(profile.id)}
        barberSlug={slug}
        businessName={profile.business_display_name ?? profile.business_name}
        businessAddress={profile.business_address}
        userId={userId}
        hideBadge
        expanded={isExpanded}
        onToggle={onToggle}
        serviceMode={serviceMode}
      />
    </div>
  );
}
