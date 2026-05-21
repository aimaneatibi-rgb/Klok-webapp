import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://app.klok.works";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/login", "/signup", "/voorwaarden", "/privacy", "/help"],
        disallow: [
          "/dashboard",
          "/werknemer",
          "/admin",
          "/api",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
