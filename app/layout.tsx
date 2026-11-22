import type { Metadata, Viewport } from "next";
import { SITE, SITE_URL } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE.title,
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.name, url: SITE_URL }],
  creator: SITE.name,
  alternates: { canonical: "/" },
  openGraph: {
    title: SITE.title,
    description: SITE.shortDescription,
    url: "/",
    siteName: SITE.name,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.shortDescription,
  },
};

export const viewport: Viewport = {
  themeColor: SITE.colors.paper,
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: SITE.name,
  url: SITE_URL,
  jobTitle: SITE.jobTitle,
  description: SITE.description,
  address: { "@type": "PostalAddress", addressLocality: SITE.locality, addressCountry: SITE.country },
  sameAs: [SITE.github, SITE.linkedin],
  knowsAbout: ["React", "TypeScript", "Next.js", "Python", "Supabase", "Flutter"],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          // Static, trusted data; `<` is escaped so the JSON can never close the script tag.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c") }}
        />
        {children}
      </body>
    </html>
  );
}
