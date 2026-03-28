"use client";

import { MapPin } from "lucide-react";
import type { ApiBusinessProfile } from "@/lib/api";
import styles from "../../page.module.css";

interface ProfileAddressProps {
  profile: ApiBusinessProfile;
}

export default function ProfileAddress({ profile }: ProfileAddressProps) {
  if (!profile.business_address) return null;

  const mapsUrl =
    profile.latitude && profile.longitude
      ? `https://www.google.com/maps?q=${profile.latitude},${profile.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.business_address)}`;

  return (
    <a
      href={mapsUrl}
      target="_blank"
      rel="noreferrer"
      className={styles.infoAddress}
    >
      <MapPin />{" "}
      <span className="text-[0.875rem]">{profile.business_address}</span>
    </a>
  );
}
