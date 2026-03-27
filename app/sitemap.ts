import { MetadataRoute } from "next";
import { API_ENDPOINTS } from "@/lib/api-endpoints";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://valetvault.com.au").replace(/\/$/, "");

interface BusinessEntry {
  slug: string;
  updated_at?: string;
  business_name?: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // ── Static /bookme/* pages ─────────────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/bookme/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/bookme/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // ── Dynamic business profile pages ────────────────────────────────────────
  try {
    const res = await fetch(API_ENDPOINTS.SITEMAP_BUSINESSES, {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 }, // refresh every hour
    });

    if (!res.ok) return staticPages;

    const json = await res.json() as {
      status: boolean;
      data: { data: BusinessEntry[] } | BusinessEntry[];
    };

    if (!json.status) return staticPages;

    const businesses: BusinessEntry[] = Array.isArray(json.data)
      ? json.data
      : (json.data as { data: BusinessEntry[] }).data ?? [];

    const businessPages: MetadataRoute.Sitemap = businesses
      .filter(b => b.slug)
      .map(b => ({
        url: `${SITE_URL}/bookme/${b.slug}`,
        lastModified: b.updated_at ? new Date(b.updated_at) : now,
        changeFrequency: "daily" as const,
        priority: 0.9,
      }));

    return [...businessPages, ...staticPages];
  } catch {
    return staticPages;
  }
}
