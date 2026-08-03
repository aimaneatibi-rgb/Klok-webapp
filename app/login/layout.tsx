// Inlogpagina's horen niet in de zoekresultaten: ze leveren geen bezoeker iets
// op en verdunnen alleen het beeld dat Google van de site heeft.
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Inloggen",
  description: "Log in op je KLOK Works-account.",
  alternates: { canonical: `${SITE_URL}/login` },
  robots: { index: false, follow: true },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
