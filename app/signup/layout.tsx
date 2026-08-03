// De signup-pagina is een client component en kan zelf geen metadata
// exporteren; die hangt daarom in dit laagje eromheen.
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Gratis account aanmaken",
  description:
    "Maak in een minuut een account als werknemer of werkgever. Werknemers betalen niets; werkgevers plaatsen hun eerste vacature veertien dagen gratis.",
  path: "/signup",
});

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
