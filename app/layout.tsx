import type { Metadata } from "next";
import "./globals.css"; //

const BASE_URL = "https://awareometer.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Aware-o-meter",
    template: "%s — Aware-o-meter",
  },
  description:
    "A research project investigating intuitions about consciousness and awareness. Vote on which entities — animals, plants, AI, cosmic objects — you think are more aware.",
  keywords: [
    "consciousness",
    "awareness",
    "philosophy of mind",
    "animal consciousness",
    "AI sentience",
    "research",
    "survey",
  ],
  authors: [{ name: "Aware-o-meter Research" }],
  openGraph: {
    type: "website",
    url: BASE_URL,
    siteName: "Aware-o-meter",
    title: "Aware-o-meter — Which is more aware?",
    description:
      "Vote on which entities are more conscious: chimps, bees, ChatGPT, coral reefs, the universe. Join the research.",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "Aware-o-meter — Which is more aware?",
    description:
      "Vote on which entities are more conscious: chimps, bees, ChatGPT, coral reefs, the universe. Join the research.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: BASE_URL,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Aware-o-meter",
  url: BASE_URL,
  description:
    "A research project investigating intuitions about consciousness and awareness through pairwise comparisons.",
  applicationCategory: "ResearchApplication",
  operatingSystem: "All",
  author: {
    "@type": "Organization",
    name: "Aware-o-meter Research",
    email: "awareometer@gmail.com",
  },
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
