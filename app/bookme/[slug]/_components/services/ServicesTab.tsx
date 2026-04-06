"use client";

import { Zap } from "lucide-react";
import type { ApiBusinessProfile } from "@/lib/api";
import type { Service } from "@/types";
import { type ServiceMode } from "../../_utils";
import ServiceModeToggle from "./ServiceModeToggle";
import ServiceSearch from "./ServiceSearch";
import ServiceCard from "./ServiceCard";

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

      {hasMobileServices && (
        <ServiceModeToggle
          serviceMode={serviceMode}
          onServiceModeChange={onServiceModeChange}
        />
      )}

      <ServiceSearch
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
      />

      {/* servicesList */}
      <div className="px-[var(--sp-4)] pt-[10px] pb-[var(--sp-4)] flex flex-col gap-[10px] md:px-[var(--sp-8)] md:pt-[var(--sp-3)]">
        {filteredServices.length > 0 ? (
          filteredServices.map((s) => (
            <ServiceCard
              key={s.id}
              service={s}
              profile={profile}
              slug={slug}
              userId={userId}
              isExpanded={expandedServiceId === s.id}
              onToggle={() =>
                onExpandedChange(expandedServiceId === s.id ? null : s.id)
              }
              serviceMode={serviceMode}
            />
          ))
        ) : (
          <p className="py-[var(--sp-6)] px-[var(--sp-4)] text-center text-sm text-[var(--color-text-muted)] italic">
            No services found
          </p>
        )}
      </div>
    </div>
  );
}
