import type { Metadata } from "next";
import "./globals.css";

const SITE_URL = "https://aiworkflow.modules.club";
const TITLE = "AI WORKFLOW — от идеи до результата";
const DESCRIPTION =
  "Практический курс для дизайнеров. Встройте ИИ в рабочий процесс: от брифа и концепции до готового продукта.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: SITE_URL,
    siteName: "AI WORKFLOW",
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: "/assets/speaker.jpg",
        width: 1280,
        height: 720,
        alt: "Артур Андрейко — спикер курса AI WORKFLOW",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/assets/speaker.jpg"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Course",
  name: "AI WORKFLOW",
  description: DESCRIPTION,
  url: SITE_URL,
  inLanguage: "ru",
  provider: {
    "@type": "Organization",
    name: "AI WORKFLOW",
    url: SITE_URL,
  },
  instructor: {
    "@type": "Person",
    name: "Артур Андрейко",
  },
  offers: {
    "@type": "Offer",
    url: `${SITE_URL}/#pricing`,
    priceCurrency: "RUB",
    availability: "https://schema.org/LimitedAvailability",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <head>
        <link
          rel="preload"
          href="/fonts/Sonko-Medium.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/Sonko-Bold.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/Sonko-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <style
          dangerouslySetInnerHTML={{
            __html:
              "html[data-preload=on],html:not([data-preload]) body:has(.site-preloader:not(.is-leaving)){overflow:hidden}.site-preloader{position:fixed;inset:0;z-index:999998;background:#000;color:#ff5b0b}",
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
