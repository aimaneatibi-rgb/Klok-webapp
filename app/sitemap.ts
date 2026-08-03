import type { MetadataRoute } from "next";
import { BLOG_POSTS } from "@/lib/blog";
import { SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const blogUrls: MetadataRoute.Sitemap = BLOG_POSTS.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  return [
    { url: `${SITE_URL}/`, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/vacatures`, lastModified, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/werknemers`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/werkgevers`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/signup`, lastModified, changeFrequency: "yearly", priority: 0.8 },
    { url: `${SITE_URL}/aanbrengen`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/blog`, lastModified, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/download`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    ...blogUrls,
    { url: `${SITE_URL}/help`, lastModified, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/over-ons`, lastModified, changeFrequency: "yearly", priority: 0.5 },
    { url: `${SITE_URL}/voorwaarden`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/privacy`, lastModified, changeFrequency: "yearly", priority: 0.3 },
  ];
  // /login staat er bewust niet in: die pagina is op noindex gezet.
}
