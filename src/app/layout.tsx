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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.minhdungland.com.vn";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
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
    url: siteUrl,
    siteName: "Minh Dũng Land",
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
        <AuthProvider>
          <ReferralTracker />
          <GoogleTranslateManager />
          <Header />
          <main className="min-h-[70vh]">{children}</main>
          <Footer />
          <CookieConsentBanner />
        </AuthProvider>
      </body>
    </html>
  );
}
