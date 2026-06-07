import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const SITE_NAME = "RwandaShop";
const SITE_URL  = process.env.NEXT_PUBLIC_SITE_URL ?? "https://rwandashop.rw";
const SITE_DESC =
  "Discover and buy authentic Rwandan crafts: Agaseke basketry, Imigongo sculptures, Kitenge textiles and jewellery. Delivery across Rwanda. Every purchase directly supports local artisans.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default:  `${SITE_NAME} — Authentic Rwandan Crafts`,
    template: `%s | ${SITE_NAME}`,
  },

  description: SITE_DESC,

  keywords: [
    "Rwandan crafts",
    "Rwanda",
    "Rwanda marketplace",
    "basketry",
    "Agaseke",
    "Imigongo",
    "Kitenge",
    "Rwanda sculptures",
    "Rwanda jewellery",
    "local artisans",
    "Rwanda e-commerce",
    "UNILAK",
  ],

  authors:   [{ name: "RwandaShop", url: SITE_URL }],
  creator:   "RwandaShop — UNILAK",
  publisher: "RwandaShop",
  category:  "marketplace",

  robots: {
    index:  true,
    follow: true,
    googleBot: {
      index:               true,
      follow:              true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet":       -1,
    },
  },

  openGraph: {
    type:            "website",
    locale:          "en_RW",
    alternateLocale: ["fr_RW"],
    url:             SITE_URL,
    siteName:        SITE_NAME,
    title:           `${SITE_NAME} — Authentic Rwandan Crafts`,
    description:     SITE_DESC,
    images: [
      {
        url:    "/og-image.jpg",
        width:  1200,
        height: 630,
        alt:    "RwandaShop — Rwandan Crafts",
        type:   "image/jpeg",
      },
    ],
  },

  twitter: {
    card:        "summary_large_image",
    site:        "@rwandashop",
    creator:     "@rwandashop",
    title:       `${SITE_NAME} — Authentic Rwandan Crafts`,
    description: SITE_DESC,
    images:      ["/og-image.jpg"],
  },

  icons: {
    icon: [
      { url: "/favicon.ico",  sizes: "any" },
      { url: "/icon.svg",     type: "image/svg+xml" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple:   [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: "/favicon.ico",
  },

  manifest: "/manifest.json",

  alternates: {
    canonical: SITE_URL,
    languages: {
      "en-RW": SITE_URL,
      "fr-RW": `${SITE_URL}/fr`,
    },
  },

  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? "",
  },

  applicationName: SITE_NAME,
  appleWebApp: {
    capable:         true,
    title:           SITE_NAME,
    statusBarStyle:  "default",
  },
  formatDetection: {
    telephone: true,
    email:     true,
    address:   false,
  },
};

export const viewport: Viewport = {
  width:        "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0f6138" },
    { media: "(prefers-color-scheme: dark)",  color: "#0d4f2f" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans bg-white text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
