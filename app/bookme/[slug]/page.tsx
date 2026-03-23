import type { Metadata } from "next";
import { fetchBusinessProfileBySlug } from "@/lib/api";
import BusinessProfileClient from "./BusinessProfileClient";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ user_id?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const profile = await fetchBusinessProfileBySlug(slug, controller.signal).finally(() => clearTimeout(timeout));
    const name = profile.business_display_name ?? profile.business_name;
    const suburb = profile.business_address?.split(",")[1]?.trim() ?? "";

    const businessType = profile.business_type ?? "Business";
    const title = `${name} ${businessType} | Book or Walk In | ${suburb}`;
    const description = `Visit ${name} in ${suburb}. Walk-ins welcome \u2014 check live wait times, view services and book online via Valet Vault.`;
    const canonical = `https://valetvault.com.au/bookme/${slug}`;
    const ogImage = profile.business_banner
      ? [{ url: profile.business_banner, width: 1200, height: 630, alt: `${name} banner` }]
      : [];

    return {
      title,
      description,
      alternates: { canonical },
      openGraph: {
        title,
        description,
        url: canonical,
        siteName: "Valet Vault",
        images: ogImage,
        type: "website",
        locale: "en_AU",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: profile.business_banner ? [profile.business_banner] : [],
      },
    };
  } catch {
    return {
      title: "Book a Barber | Walk-ins Welcome | Valet Vault",
      description: "Find and book local barbers near you. Walk-ins welcome — check live wait times, view services and book online via Valet Vault.",
    };
  }
}

export default async function BookmePage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { user_id } = await searchParams;
  return <BusinessProfileClient slug={slug} userId={user_id ?? null} />;
}
