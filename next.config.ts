import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
  // Legacy .html URLs van de oude statische marketing-site → nieuwe Next.js routes.
  // Permanent (308) zodat Google de oude links uit de index opruimt.
  async redirects() {
    return [
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/aanmelden.html", destination: "/signup", permanent: true },
      { source: "/inloggen.html", destination: "/login", permanent: true },
      { source: "/werkgevers.html", destination: "/werkgevers", permanent: true },
      { source: "/werknemers.html", destination: "/werknemers", permanent: true },
      { source: "/vacatures.html", destination: "/vacatures", permanent: true },
      { source: "/aanbrengen.html", destination: "/aanbrengen", permanent: true },
      { source: "/over-ons.html", destination: "/over-ons", permanent: true },
      { source: "/faq.html", destination: "/help", permanent: true },
      { source: "/contact.html", destination: "/help", permanent: true },
      // /download.html: oude marketing-link, app niet meer beschikbaar — naar /
      { source: "/download.html", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
