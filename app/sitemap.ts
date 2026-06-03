import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://app.klok.works";
  const lastModified = new Date();

  return [
    { url: `${baseUrl}/`, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/werknemers`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/werkgevers`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/vacatures`, lastModified, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/aanbrengen`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/over-ons`, lastModified, changeFrequency: "yearly", priority: 0.5 },
    { url: `${baseUrl}/download`, lastModified, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/help`, lastModified, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/signup`, lastModified, changeFrequency: "yearly", priority: 0.8 },
    { url: `${baseUrl}/login`, lastModified, changeFrequency: "yearly", priority: 0.5 },
    { url: `${baseUrl}/voorwaarden`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/privacy`, lastModified, changeFrequency: "yearly", priority: 0.3 },
  ];
}
