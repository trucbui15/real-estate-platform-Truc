"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function CookieConsentBanner() {
  const [accepted, setAccepted] = useState(true);

  useEffect(() => {
    // Kiểm tra xem khách hàng đã xác nhận đồng ý lưu trữ dữ liệu & cookies chưa
    const consent = localStorage.getItem("cookie_consent_minhdungland");
    if (!consent) {
      setAccepted(false);
    }
  }, []);

  function handleAccept() {
    localStorage.setItem("cookie_consent_minhdungland", "accepted_" + new Date().toISOString());
    // Lưu cookie 365 ngày
    document.cookie = "cookie_consent_minhdungland=accepted; path=/; max-age=" + 365 * 24 * 60 * 60;
    setAccepted(true);
  }

  if (accepted) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-slate-900/95 backdrop-blur-md text-white p-5 rounded-2xl border border-slate-700/80 shadow-2xl space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🍪</span>
            <h3 className="font-bold text-sm text-white">Xác nhận Lưu trữ & Bảo mật dữ liệu</h3>
          </div>
          <button
            onClick={handleAccept}
            className="text-slate-400 hover:text-white text-xs font-bold p-1 cursor-pointer"
            title="Đóng"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Website <strong>Minh Dũng Land</strong> sử dụng cookies và lưu trữ thông tin cá nhân (như họ tên, SĐT) khi bạn đăng ký tư vấn để nâng cao trải nghiệm, hỗ trợ tìm BĐS & bảo mật thông tin theo{" "}
          <Link href="/chinh-sach" className="text-amber-400 underline hover:text-amber-300">
            Chính sách bảo mật
          </Link>
          .
        </p>

        <div className="flex items-center justify-end gap-2 pt-1">
          <Link
            href="/chinh-sach"
            className="px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
          >
            Chính sách
          </Link>
          <button
            onClick={handleAccept}
            className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition cursor-pointer"
          >
            Chấp nhận & Đồng ý ✓
          </button>
        </div>
      </div>
    </div>
  );
}
