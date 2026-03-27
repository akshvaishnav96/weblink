import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/bookme/",
      disallow: ["/admin/", "/dashboard/", "/api/"],
    },
    sitemap: `${(process.env.NEXT_PUBLIC_SITE_URL ?? "https://valetvault.com.au").replace(/\/$/, "")}/bookme/sitemap.xml`,
  };
}
