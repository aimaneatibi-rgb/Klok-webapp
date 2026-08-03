import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        // "/" laat alles toe; de disallow-regels hieronder knippen er de
        // afgeschermde delen weer uit. Losse allow-regels per publieke pagina
        // zijn overbodig en kosten alleen onderhoud bij elke nieuwe route.
        allow: "/",
        disallow: ["/dashboard", "/werknemer", "/admin", "/api", "/login"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
