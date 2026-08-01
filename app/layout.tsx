import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KLOK Works · De marktplaats voor werk",
  description:
    "Vacatures en shifts, direct tussen werkgever en werknemer. Gratis voor werknemers, eerlijke prijzen voor werkgevers — en iedereen verdient mee aan het netwerk.",
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
      </head>
      <body className="bg-cream text-ink font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
