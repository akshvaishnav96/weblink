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

    // Spec: '[Shop Name] Barber | Book or Walk In | [Suburb]' (under 60 chars)
    const title = `${name} Barber | Book or Walk In | ${suburb}`;

    // Spec: 'Visit [Shop Name] in [Suburb]. Walk-ins welcome — check live wait times, view services and book online via Valet Vault.' (under 150 chars)
    const description = `Visit ${name} in ${suburb}. Walk-ins welcome \u2014 check live wait times, view services and book online via Valet Vault.`;

    // Spec: canonical tag
    const canonical = `https://valetvault.com.au/bookme/${slug}`;

    return {
      title,
      description,
      alternates: { canonical },
      openGraph: {
        title,
        description,
        url: canonical,
        images: profile.business_banner ? [{ url: profile.business_banner }] : [],
        type: "website",
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
