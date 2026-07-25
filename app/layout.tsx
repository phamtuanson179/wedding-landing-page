import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import { WeddingJsonLd } from "@/components/seo/WeddingJsonLd";
import { absoluteUrl, getSiteUrl, siteConfig } from "@/lib/seo/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "vietnamese"],
});

const siteUrl = getSiteUrl();
const ogImage = {
  url: siteConfig.ogImage.path,
  secureUrl: absoluteUrl(siteConfig.ogImage.path),
  width: siteConfig.ogImage.width,
  height: siteConfig.ogImage.height,
  type: siteConfig.ogImage.type,
  alt: siteConfig.ogImage.alt,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteConfig.title,
    template: siteConfig.titleTemplate,
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  authors: [...siteConfig.authors],
  creator: siteConfig.creator,
  publisher: siteConfig.creator,
  applicationName: `${siteConfig.name} Wedding`,
  category: "wedding",
  classification: "Wedding invitation website",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  alternates: {
    canonical: "/",
    languages: {
      "vi-VN": "/",
      "x-default": "/",
    },
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon-32x32.png"],
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    alternateLocale: ["en_US"],
    url: siteUrl,
    siteName: `${siteConfig.name} Wedding`,
    title: siteConfig.title,
    description: siteConfig.shareDescription,
    images: [ogImage],
    countryName: "Vietnam",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.shareDescription,
    images: [
      {
        url: siteConfig.ogImage.path,
        alt: siteConfig.ogImage.alt,
        width: siteConfig.ogImage.width,
        height: siteConfig.ogImage.height,
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  other: {
    "geo.region": "VN-HN",
    "geo.placename": siteConfig.wedding.locationName,
    // LinkedIn / Messenger / Telegram read these alongside Open Graph
    "og:image:width": String(siteConfig.ogImage.width),
    "og:image:height": String(siteConfig.ogImage.height),
    "og:image:type": siteConfig.ogImage.type,
    "og:image:alt": siteConfig.ogImage.alt,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: siteConfig.backgroundColor },
    { media: "(prefers-color-scheme: dark)", color: siteConfig.themeColor },
  ],
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang={siteConfig.language}
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <WeddingJsonLd />
        {children}
      </body>
    </html>
  );
}
