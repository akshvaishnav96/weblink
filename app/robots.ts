import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/bookme/",
      disallow: ["/admin/", "/dashboard/", "/api/"],
    },
    sitemap: "https://valetvaultstaging.24livehost.com/bookme/sitemap.xml",
  };
}
