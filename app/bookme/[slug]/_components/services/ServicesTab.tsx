"use client";

import { Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ApiBusinessProfile } from "@/lib/api";
import type { Service } from "@/types";
import { type ServiceMode } from "../../_utils";
import ServiceModeToggle from "./ServiceModeToggle";
import ServiceSearch from "./ServiceSearch";
import ServiceCard from "./ServiceCard";
import QueueRow from "@/components/barber/QueueRow";
import { useBookingStore } from "@/store/bookingStore";

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
  const router = useRouter();
  const { setSelection } = useBookingStore();

  function handleQueueJoin(
    staffId: string,
    people: number,
    serviceId: string,
    serviceName: string,
    duration: number,
    price: number,
    waitMins: number,
    staffName: string,
    staffInitials: string,
  ) {
    setSelection({
      barberId:        String(profile.id ?? ""),
      barberSlug:      slug,
      serviceName,
      serviceId,
      staffName:       staffId === "fastest" ? "Anyone Available" : staffName,
      staffId,
      staffInitials,
      staffPicture:    "",
      displayTime:     `~${waitMins} min wait`,
      duration:        String(duration),
      price:           String(price),
      businessName:    profile.business_name ?? "",
      businessAddress: profile.business_address ?? "",
      rawTimeSlot:     "",
      bookingDate:     "",
      serviceType:     "walkin",
      userId:          userId ?? null,
      people,
      waitMins,
    });
    router.push(`/bookme/${slug}/queue-booking`);
  }

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
          <>
            {filteredServices.map((s) => (
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
            ))}

            {/* Queue section — dummy data for now */}
            <QueueRow
              serviceId="247"
              serviceName="Hair Spa"
              duration={30}
              price={25}
              originalPrice={60}
              description="Classic or modern haircut tailored to your style. Includes wash, cut, and styling."
              waitMins={10}
              queueCount={2}
              staff={[
                { staffId: "fastest", staffName: "Fastest",   staffInitials: "F",  waitMins: 10, queueCount: 2, rating: 4.9, isFastest: true },
                { staffId: "mr",      staffName: "Marcus R.", staffInitials: "MR", waitMins: 20, queueCount: 3 },
                { staffId: "jp",      staffName: "Jay P.",    staffInitials: "JP", waitMins: 20, queueCount: 3 },
              ]}
              onJoin={(staffId, people) => {
                const selectedStaff = [
                  { staffId: "mr", staffName: "Marcus R.", staffInitials: "MR", waitMins: 20 },
                  { staffId: "jp", staffName: "Jay P.",    staffInitials: "JP", waitMins: 20 },
                ].find(s => s.staffId === staffId);
                handleQueueJoin(
                  staffId,
                  people,
                  "queue-demo",
                  "Classic Haircut",
                  30,
                  25,
                  selectedStaff?.waitMins ?? 10,
                  selectedStaff?.staffName ?? "Anyone Available",
                  selectedStaff?.staffInitials ?? "??",
                );
              }}
            />
          </>
        ) : (
          <p className="py-[var(--sp-6)] px-[var(--sp-4)] text-center text-sm text-[var(--color-text-muted)] italic">
            No services found
          </p>
        )}
      </div>
    </div>
  );
}
