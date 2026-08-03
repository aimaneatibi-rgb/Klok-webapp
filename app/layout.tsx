import type { Metadata, Viewport } from "next";
import "./globals.css";
import { OG_IMAGE, SITE_NAME, SITE_URL, organizationJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  // metadataBase maakt van elk relatief pad hieronder een absolute URL.
  // Zonder deze regel zet Next.js relatieve og:image-paden neer en die worden
  // door Google, LinkedIn en WhatsApp genegeerd.
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Vacatures en personeel zonder uitzendbureau · KLOK Works",
    template: `%s · ${SITE_NAME}`,
  },
  description:
    "Vacatures en shifts, direct tussen werkgever en werknemer. Gratis voor werknemers, vanaf €149 per vacature voor werkgevers — geen marge over je uurloon en iedereen verdient mee aan het netwerk.",
  applicationName: SITE_NAME,
  keywords: [
    "vacatures",
    "flexwerk",
    "shifts",
    "personeel vinden",
    "uitzendbureau alternatief",
    "bijbaan",
    "horeca vacatures",
    "zorg vacatures",
    "logistiek vacatures",
    "personeel werven zonder uitzendbureau",
  ],
  authors: [{ name: SITE_NAME, url: `${SITE_URL}/over-ons` }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  // Bewust géén canonical hier: metadata erft naar beneden door, dus een
  // canonical in de root zou elke pagina zonder eigen canonical naar de
  // homepage laten wijzen. Elke publieke pagina zet hem zelf via pageMetadata().
  openGraph: {
    type: "website",
    locale: "nl_NL",
    siteName: SITE_NAME,
    url: `${SITE_URL}/`,
    title: "Vacatures en personeel zonder uitzendbureau · KLOK Works",
    description:
      "De marktplaats voor werk: werkgevers plaatsen vacatures en shifts, werknemers reageren direct. Geen uitzendbureau, geen marge over je uurloon.",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vacatures en personeel zonder uitzendbureau · KLOK Works",
    description:
      "De marktplaats voor werk: vacatures en shifts, direct tussen werkgever en werknemer.",
    images: [OG_IMAGE.url],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      // Zonder deze drie knijpt Google de weergave dicht tot een korte tekst
      // zonder afbeelding — precies wat je in de zoekresultaten niet wilt.
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <head>
        {/* Cookiebot — moet als eerste script in <head> laden (auto-blocking) */}
        <script
          id="Cookiebot"
          src="https://consent.cookiebot.com/uc.js"
          data-cbid="d833d332-e3d1-4b55-b867-1fd18946e18d"
          data-blockingmode="auto"
          type="text/javascript"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        {/* Organisatie + website voor Google: merknaam, logo en de zoekbalk
            in de sitelinks. Staat sitewide zodat elke pagina hem meeneemt. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd()),
          }}
        />
      </head>
      <body className="bg-cream text-ink font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
