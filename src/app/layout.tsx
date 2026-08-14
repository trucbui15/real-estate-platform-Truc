import type { Metadata, Viewport } from "next";
import { Fraunces, Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ReferralTracker from "@/components/ReferralTracker";
import CookieConsentBanner from "@/components/CookieConsentBanner";

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

export const metadata: Metadata = {
  title: "Minh Dũng Land — Nền tảng bất động sản Quy Nhơn",
  description:
    "Mua bán, cho thuê căn hộ, nhà đất, biệt thự, dự án tại Quy Nhơn và Bình Định. Minh bạch, xác thực, cập nhật liên tục.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${fraunces.variable} ${beVietnam.variable}`}>
      <body>
        <AuthProvider>
          <ReferralTracker />
          <Header />
          <main className="min-h-[70vh]">{children}</main>
          <Footer />
          <CookieConsentBanner />
        </AuthProvider>
      </body>
    </html>
  );
}
