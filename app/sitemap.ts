import { MetadataRoute } from "next";

const API_BASE = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://valetvaultdev.24livehost.com/api/v2/weblink";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://valetvault.com.au";

interface BusinessEntry {
  slug: string;
  updated_at?: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const res = await fetch(`${API_BASE}/marketplace-preview?search=`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 },
    });
    const json = await res.json() as { status: boolean; data: { data: BusinessEntry[] } | BusinessEntry[] };

    const businesses: BusinessEntry[] = Array.isArray(json.data)
      ? json.data
      : (json.data as { data: BusinessEntry[] }).data ?? [];

    return businesses
      .filter(b => b.slug)
      .map(b => ({
        url: `${SITE_URL}/bookme/${b.slug}`,
        lastModified: b.updated_at ? new Date(b.updated_at) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));
  } catch {
    return [];
  }
}
