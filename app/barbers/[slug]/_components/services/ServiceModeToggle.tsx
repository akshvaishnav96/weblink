"use client";

import { Home, Car } from "lucide-react";
import { type ServiceMode } from "../../_utils";

interface ServiceModeToggleProps {
  serviceMode: ServiceMode;
  onServiceModeChange: (mode: ServiceMode) => void;
}

export default function ServiceModeToggle({
  serviceMode,
  onServiceModeChange,
}: ServiceModeToggleProps) {
  return (
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
  );
}
