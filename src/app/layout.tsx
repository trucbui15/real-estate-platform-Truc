import type { Metadata, Viewport } from "next";
import { Fraunces, Be_Vietnam_Pro } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ReferralTracker from "@/components/ReferralTracker";
import CookieConsentBanner from "@/components/CookieConsentBanner";
import GoogleTranslateManager from "@/components/GoogleTranslateManager";
import { ToastProvider } from "@/components/ToastProvider";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

const beVietnam = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

import { SITE_URL, SITE_NAME } from "@/config/site";
import { CONTACT_CONFIG } from "@/config/contact";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Minh Dũng Land - Nền tảng bất động sản Quy Nhơn",
  description:
    "Mua bán, cho thuê căn hộ, nhà đất, biệt thự, dự án tại Quy Nhơn và Bình Định. Minh bạch, xác thực, cập nhật liên tục.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Minh Dũng Land - Nền tảng bất động sản Quy Nhơn",
    description:
      "Mua bán, cho thuê căn hộ, nhà đất, biệt thự, dự án tại Quy Nhơn và Bình Định. Minh bạch, xác thực, cập nhật liên tục.",
    url: SITE_URL,
    siteName: SITE_NAME,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Minh Dũng Land - Bất động sản Quy Nhơn",
      },
    ],
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Minh Dũng Land - Nền tảng bất động sản Quy Nhơn",
    description:
      "Mua bán, cho thuê căn hộ, nhà đất, biệt thự, dự án tại Quy Nhơn và Bình Định. Minh bạch, xác thực, cập nhật liên tục.",
    images: ["/og-image.jpg"],
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "RealEstateAgent",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/logo.png`,
      description: "Mua bán, cho thuê căn hộ, nhà đất, biệt thự, dự án tại Quy Nhơn và Bình Định. Minh bạch, xác thực, cập nhật liên tục.",
      address: {
        "@type": "PostalAddress",
        streetAddress: CONTACT_CONFIG.address,
        addressLocality: "Quy Nhơn",
        addressRegion: "Bình Định",
        addressCountry: "VN",
      },
      telephone: CONTACT_CONFIG.phone,
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      publisher: {
        "@id": `${SITE_URL}/#organization`,
      },
      inLanguage: "vi-VN",
    },
  ],
};

const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${fraunces.variable} ${beVietnam.variable}`}>
      <body>
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <AuthProvider>
          <ToastProvider>
            <ReferralTracker />
            <GoogleTranslateManager />
            <Header />
            <main className="min-h-[70vh]">{children}</main>
            <Footer />
            <CookieConsentBanner />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
