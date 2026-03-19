import type { Metadata } from "next";
import { fetchBusinessProfileBySlug } from "@/lib/api";
import BusinessProfileClient from "./BusinessProfileClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const profile = await fetchBusinessProfileBySlug(slug);
    const name = profile.business_display_name ?? profile.business_name;
    const suburb = profile.business_address?.split(",")[1]?.trim() ?? "";
    const services = profile.services.slice(0, 3).map(s => s.service_name).join(", ");
    const description = `Book ${name} in ${suburb}. Services include: ${services}. Book online instantly.`;
    const canonical = `https://valetvault.com.au/bookme/${slug}`;
    return {
      title: `${name} | Book Online | Valet Vault`,
      description,
      alternates: { canonical },
      openGraph: {
        title: `${name} | Book Online`,
        description,
        url: canonical,
        images: profile.business_banner ? [{ url: profile.business_banner }] : [],
        type: "website",
      },
    };
  } catch {
    return { title: "Business Profile | Valet Vault" };
  }
}

export default async function BookmePage({ params }: PageProps) {
  const { slug } = await params;
  return <BusinessProfileClient slug={slug} />;
}
