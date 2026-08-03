// Eén bron voor alles wat met vindbaarheid te maken heeft. Titels, canonicals,
// deelbanner en structured data komen hier vandaan, zodat een pagina toevoegen
// nooit betekent dat je vijf plekken moet onthouden.

import type { Metadata } from "next";

/** Canonieke host. www is de primaire in Vercel — apex redirect daarheen. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.klokworks.nl"
).replace(/\/$/, "");

export const SITE_NAME = "KLOK Works";

/** 1200×630 deelbanner: Google, LinkedIn, WhatsApp en socials tonen deze. */
export const OG_IMAGE = {
  url: "/og-klok.jpg",
  width: 1200,
  height: 630,
  alt: "KLOK Works — vacatures en personeel, direct tussen werkgever en werknemer",
};

type PageSeo = {
  /** Zonder merknaam: het template in layout.tsx plakt " · KLOK Works" erachter. */
  title: string;
  description: string;
  /** Pad met leidende slash, bijv. "/werkgevers". */
  path: string;
};

/**
 * Bouwt titel, description, canonical, Open Graph en Twitter-card in één keer.
 * Canonicals zijn belangrijk: zonder canonical kiest Google zelf een variant
 * (met querystring, met of zonder www) en splitst hij de autoriteit.
 */
export function pageMetadata({ title, description, path }: PageSeo): Metadata {
  const url = `${SITE_URL}${path === "/" ? "/" : path}`;
  // De titel die buiten de site landt (deelkaart, tabblad) heeft de merknaam
  // nodig. Het title-template van de root layout geldt alleen voor onderliggende
  // segmenten, dus de homepage geeft zijn titel inclusief merknaam mee — vandaar
  // de check, zodat "KLOK Works" er nooit twee keer in staat.
  const volledigeTitel = title.includes(SITE_NAME)
    ? title
    : `${title} · ${SITE_NAME}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: volledigeTitel,
      description,
      url,
      siteName: SITE_NAME,
      locale: "nl_NL",
      type: "website",
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: volledigeTitel,
      description,
      images: [OG_IMAGE.url],
    },
  };
}

/** Organisatie + website. Levert Google de merknaam, het logo en de sitelinks-zoekbalk. */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        alternateName: "KLOK",
        url: `${SITE_URL}/`,
        logo: `${SITE_URL}/icon-512.png`,
        image: `${SITE_URL}${OG_IMAGE.url}`,
        description:
          "Marktplaats voor werk: werkgevers plaatsen vacatures en shifts, werknemers reageren direct. Zonder uitzendbureau en zonder marge over je uurloon.",
        areaServed: { "@type": "Country", name: "Nederland" },
        contactPoint: [
          {
            "@type": "ContactPoint",
            contactType: "customer support",
            url: `${SITE_URL}/help`,
            availableLanguage: ["nl"],
          },
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: `${SITE_URL}/`,
        name: SITE_NAME,
        inLanguage: "nl-NL",
        publisher: { "@id": `${SITE_URL}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITE_URL}/vacatures?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };
}

/** Kruimelpad. Google toont dit in plaats van de kale URL onder het zoekresultaat. */
export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path === "/" ? "" : item.path}`,
    })),
  };
}

/** FAQ-blok. Kan als uitklapbare vragen onder het zoekresultaat verschijnen. */
export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

/** Klein hulpje zodat pagina's niet elke keer dangerouslySetInnerHTML uitschrijven. */
export function jsonLdScript(data: object) {
  return {
    type: "application/ld+json",
    dangerouslySetInnerHTML: { __html: JSON.stringify(data) },
  };
}
