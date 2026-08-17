"use client";

import { useState } from "react";
import { notFound } from "next/navigation";

// Chỉ cho phép xem ở môi trường Local Development
if (process.env.NODE_ENV === "production") {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  notFound();
}

interface ThemePalette {
  id: number;
  name: string;
  subtitle: string;
  primary: string;
  primaryHover: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  success: string;
  warning: string;
  danger: string;
  menuGradient: string;
  menuBorder: string;
  cardBorder: string;
  badgeBg: string;
  badgeText: string;
}

const THEMES: Record<number, ThemePalette> = {
  1: {
    id: 1,
    name: "Theme 1: Sky Blue & Ocean Breeze",
    subtitle: "Xanh Da Trời & Biển Quy Nhơn — Nhẹ nhàng, thanh lịch, tin cậy",
    primary: "#0284C7",
    primaryHover: "#0369A1",
    secondary: "#0284C7",
    accent: "#F59E0B",
    background: "#F8FAFC",
    surface: "#FFFFFF",
    border: "#BAE6FD",
    textPrimary: "#0F172A",
    textSecondary: "#475569",
    success: "#059669",
    warning: "#D97706",
    danger: "#E11D48",
    menuGradient: "linear-gradient(to right, #F0F9FF, #E0F2FE, #EEF2FF)",
    menuBorder: "#BAE6FD",
    cardBorder: "#E0F2FE",
    badgeBg: "#E0F2FE",
    badgeText: "#0369A1",
  },
  2: {
    id: 2,
    name: "Theme 2: Soft Mint & Luxury Gold",
    subtitle: "Xanh Ngọc Mint & Vàng Champagne — Thiên nhiên sang trọng, tươi mát",
    primary: "#0D9488",
    primaryHover: "#0F766E",
    secondary: "#0F766E",
    accent: "#D97706",
    background: "#F7FBF9",
    surface: "#FFFFFF",
    border: "#A7F3D0",
    textPrimary: "#064E3B",
    textSecondary: "#374151",
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
    menuGradient: "linear-gradient(to right, #ECFDF5, #F0FDF4, #ECFEFF)",
    menuBorder: "#A7F3D0",
    cardBorder: "#D1FAE5",
    badgeBg: "#CCFBF1",
    badgeText: "#0F766E",
  },
  3: {
    id: 3,
    name: "Theme 3: Slate Blue & Warm Coral",
    subtitle: "Xanh Slate & Cam Hoàng Hôn — Hiện đại, nổi bật, cá tính",
    primary: "#4F46E5",
    primaryHover: "#4338CA",
    secondary: "#4F46E5",
    accent: "#F97316",
    background: "#F8FAFC",
    surface: "#FFFFFF",
    border: "#C7D2FE",
    textPrimary: "#1E293B",
    textSecondary: "#475569",
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#F43F5E",
    menuGradient: "linear-gradient(to right, #F1F5F9, #EEF2FF, #FFF7ED)",
    menuBorder: "#CBD5E1",
    cardBorder: "#E2E8F0",
    badgeBg: "#EEF2FF",
    badgeText: "#4338CA",
  },
  4: {
    id: 4,
    name: "Theme 4: Ice Blue & High Corporate",
    subtitle: "Xanh Băng & Sapphire — Tinh tế, chuẩn doanh nghiệp, cao cấp",
    primary: "#1E40AF",
    primaryHover: "#1E3A8A",
    secondary: "#1E40AF",
    accent: "#06B6D4",
    background: "#F1F5F9",
    surface: "#FFFFFF",
    border: "#93C5FD",
    textPrimary: "#0F172A",
    textSecondary: "#334155",
    success: "#059669",
    warning: "#D97706",
    danger: "#DC2626",
    menuGradient: "linear-gradient(to right, #F8FAFC, #F0F9FF, #F1F5F9)",
    menuBorder: "#BFDBFE",
    cardBorder: "#E2E8F0",
    badgeBg: "#DBEAFE",
    badgeText: "#1E40AF",
  },
};

export default function ThemePreviewPage() {
  const [selectedThemeId, setSelectedThemeId] = useState<number>(1);
  const [compareMode, setCompareMode] = useState<boolean>(false);
  const [activeDropdown, setActiveDropdown] = useState<boolean>(false);

  const currentTheme = THEMES[selectedThemeId];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 font-sans space-y-8">
      {/* LOCALHOST DEMO HEADER BAR */}
      <header className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 shadow-2xl backdrop-blur space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-500/20 text-amber-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-500/30">
                🔒 LOCAL DEMO ONLY — KHÔNG AFFECT PRODUCTION
              </span>
              <span className="text-xs text-slate-400">Node ENV: {process.env.NODE_ENV}</span>
            </div>
            <h1 className="text-2xl font-black text-white mt-1">🎨 Xem Trước & So Sánh 4 Giao Diện (Theme Preview)</h1>
            <p className="text-sm text-slate-300">
              Chọn theme bên dưới để xem sự thay đổi màu sắc trên cùng một Layout chuẩn của Website Minh Dũng Land.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCompareMode(!compareMode)}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition shadow-lg flex items-center gap-2 cursor-pointer ${
                compareMode
                  ? "bg-amber-500 text-slate-950 hover:bg-amber-400"
                  : "bg-slate-700 text-slate-200 hover:bg-slate-600"
              }`}
            >
              <span>{compareMode ? "👁️ Xem Chi Tiết 1 Theme" : "⚡ So Sánh 4 Theme Side-by-Side"}</span>
            </button>
          </div>
        </div>

        {/* THEME SWITCHER BUTTONS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          {Object.values(THEMES).map((t) => {
            const isSelected = selectedThemeId === t.id && !compareMode;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setSelectedThemeId(t.id);
                  setCompareMode(false);
                }}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "bg-slate-700 border-amber-400 ring-2 ring-amber-400/30 shadow-xl"
                    : "bg-slate-800/60 border-slate-700 hover:border-slate-500 hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white">{t.name.split(":")[0]}</span>
                  <div className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: t.primary }} />
                    <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: t.accent }} />
                  </div>
                </div>
                <p className="text-[11px] text-slate-300 line-clamp-1 mt-1">{t.subtitle.split("—")[1] || t.subtitle}</p>
              </button>
            );
          })}
        </div>
      </header>

      {/* MODE 1: SIDE BY SIDE COMPARISON OF 4 THEMES */}
      {compareMode ? (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">⚡ So Sánh Trực Quan 4 Theme Cùng Lúc</h2>
            <span className="text-xs text-slate-400">Bấm vào bất kỳ card nào để chọn theme đó</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.values(THEMES).map((t) => (
              <div key={t.id} className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                  <div>
                    <h3 className="font-bold text-base text-white">{t.name}</h3>
                    <p className="text-xs text-slate-400">{t.subtitle}</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedThemeId(t.id);
                      setCompareMode(false);
                    }}
                    className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400"
                  >
                    Chọn Theme {t.id}
                  </button>
                </div>

                {/* THEME ITEM DEMO CONTAINER */}
                <div
                  className="rounded-xl p-4 space-y-4 border transition"
                  style={{ backgroundColor: t.background, borderColor: t.border }}
                >
                  {/* HEADER DEMO */}
                  <div
                    className="p-3 rounded-xl border flex items-center justify-between shadow-sm"
                    style={{ background: t.menuGradient, borderColor: t.menuBorder }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm" style={{ color: t.primary }}>
                        MINH DŨNG LAND
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-semibold" style={{ color: t.textPrimary }}>
                      <span className="px-2 py-1 rounded" style={{ backgroundColor: t.primary, color: "#fff" }}>
                        Trang chủ
                      </span>
                      <span>Mua bán</span>
                      <span>Dự án</span>
                      <span style={{ color: t.primary }}>Đặt phòng/Visa ▾</span>
                    </div>
                  </div>

                  {/* BUTTONS & BADGES */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow"
                      style={{ backgroundColor: t.primary }}
                    >
                      Nút Chính (Primary)
                    </button>
                    <button
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold border bg-white"
                      style={{ borderColor: t.border, color: t.textPrimary }}
                    >
                      Nút Phụ (Secondary)
                    </button>
                    <span
                      className="px-2.5 py-1 rounded text-[11px] font-bold"
                      style={{ backgroundColor: t.badgeBg, color: t.badgeText }}
                    >
                      Đã xác minh
                    </span>
                    <span
                      className="px-2.5 py-1 rounded text-[11px] font-bold text-white"
                      style={{ backgroundColor: t.accent }}
                    >
                      {t.accent}
                    </span>
                  </div>

                  {/* LISTING CARD SAMPLE */}
                  <div
                    className="bg-white rounded-xl border p-3 space-y-2 shadow-sm"
                    style={{ borderColor: t.cardBorder }}
                  >
                    <div className="aspect-[16/9] w-full rounded-lg bg-slate-200 flex items-center justify-center text-xs text-slate-500 font-medium overflow-hidden relative">
                      <div
                        className="absolute inset-0 opacity-15"
                        style={{ backgroundColor: t.primary }}
                      />
                      <span>[Ảnh căn hộ Altara Residences]</span>
                    </div>
                    <div className="text-base font-extrabold" style={{ color: t.primary }}>
                      2 tỷ 500 triệu VNĐ
                    </div>
                    <div className="text-xs font-bold line-clamp-1" style={{ color: t.textPrimary }}>
                      Căn hộ 2PN Altara Residences Quy Nhơn view biển tuyệt đẹp
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* MODE 2: SINGLE THEME DETAILED PREVIEW & PALETTE AUDIT */
        <div className="space-y-8">
          {/* THEME INFORMATION & PALETTE CODE BOX */}
          <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-700 pb-4">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Đang xem thử</span>
                <h2 className="text-xl font-bold text-white">{currentTheme.name}</h2>
                <p className="text-sm text-slate-300">{currentTheme.subtitle}</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono">ID: {currentTheme.id}</span>
              </div>
            </div>

            {/* COLOR PALETTE BREAKDOWN */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                🎨 Bảng Mã Màu Chi Tiết (Palette Specifications)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {[
                  { label: "Primary", color: currentTheme.primary },
                  { label: "Primary Hover", color: currentTheme.primaryHover },
                  { label: "Secondary / Accent", color: currentTheme.accent },
                  { label: "Background", color: currentTheme.background },
                  { label: "Surface", color: currentTheme.surface },
                  { label: "Border", color: currentTheme.border },
                  { label: "Text Primary", color: currentTheme.textPrimary },
                  { label: "Text Secondary", color: currentTheme.textSecondary },
                  { label: "Success", color: currentTheme.success },
                  { label: "Warning", color: currentTheme.warning },
                  { label: "Danger", color: currentTheme.danger },
                  { label: "Badge Bg", color: currentTheme.badgeBg },
                ].map((item, idx) => (
                  <div key={idx} className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-700/60 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-md border border-white/20" style={{ backgroundColor: item.color }} />
                      <span className="text-xs font-semibold text-white truncate">{item.label}</span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400">{item.color}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* LIVE SIMULATED WEBSITE INTERFACE */}
          <div
            className="rounded-3xl border p-6 md:p-8 space-y-8 transition shadow-2xl"
            style={{ backgroundColor: currentTheme.background, borderColor: currentTheme.border }}
          >
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider pb-2 border-b border-slate-300/40">
              <span>🖥️ Mô Phỏng Giao Diện Thực Tế Khi Áp Dụng {currentTheme.name}</span>
              <span className="text-slate-400">Xem trên thiết bị desktop & mobile</span>
            </div>

            {/* 1. HEADER & NAVIGATION SIMULATION */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-600">1. Header Navigation & Dropdown Menu</span>
              <header
                className="rounded-2xl p-4 border flex flex-wrap items-center justify-between gap-4 shadow-sm"
                style={{ background: currentTheme.menuGradient, borderColor: currentTheme.menuBorder }}
              >
                {/* LOGO */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-lg shadow-md" style={{ backgroundColor: currentTheme.primary }}>
                    MD
                  </div>
                  <div>
                    <span className="font-extrabold text-lg tracking-tight" style={{ color: currentTheme.textPrimary }}>
                      Minh Dũng Land
                    </span>
                    <span className="block text-[10px] font-medium" style={{ color: currentTheme.textSecondary }}>
                      Bất động sản Quy Nhơn
                    </span>
                  </div>
                </div>

                {/* NAVIGATION ITEMS */}
                <nav className="flex items-center gap-1 sm:gap-2 text-xs font-bold" style={{ color: currentTheme.textPrimary }}>
                  <span className="px-3 py-1.5 rounded-xl text-white shadow-sm" style={{ backgroundColor: currentTheme.primary }}>
                    Trang chủ
                  </span>
                  <span className="px-3 py-1.5 rounded-xl hover:bg-black/5 cursor-pointer">
                    Mua bán / Cho thuê
                  </span>
                  <span className="px-3 py-1.5 rounded-xl hover:bg-black/5 cursor-pointer">
                    Dự án
                  </span>

                  {/* INTERACTIVE DROPDOWN PREVIEW */}
                  <div className="relative">
                    <button
                      onClick={() => setActiveDropdown(!activeDropdown)}
                      className="px-3 py-1.5 rounded-xl border flex items-center gap-1 cursor-pointer bg-white/80 shadow-xs"
                      style={{ borderColor: currentTheme.border, color: currentTheme.primary }}
                    >
                      <span>Đặt phòng/Visa</span>
                      <span>{activeDropdown ? "▴" : "▾"}</span>
                    </button>

                    {activeDropdown && (
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border p-2 z-20 space-y-1" style={{ borderColor: currentTheme.border }}>
                        <div className="px-3 py-2 text-xs font-bold rounded-lg hover:bg-slate-50 cursor-pointer" style={{ color: currentTheme.textPrimary }}>
                          🏨 Đặt phòng / Book phòng
                        </div>
                        <div className="px-3 py-2 text-xs font-bold rounded-lg hover:bg-slate-50 cursor-pointer" style={{ color: currentTheme.textPrimary }}>
                          ✈️ Dịch vụ Visa
                        </div>
                      </div>
                    )}
                  </div>

                  <span className="px-3 py-1.5 rounded-xl hover:bg-black/5 cursor-pointer">
                    Ký gửi BĐS
                  </span>
                </nav>

                {/* ACTION USER */}
                <div className="flex items-center gap-2">
                  <button className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow" style={{ backgroundColor: currentTheme.primary }}>
                    Đăng tin
                  </button>
                </div>
              </header>
            </div>

            {/* 2. SEARCH FILTERS BAR */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-600">2. Thanh Tìm Kiếm & Bộ Lọc (Search & Filter Box)</span>
              <div className="bg-white p-5 rounded-2xl border shadow-sm space-y-4" style={{ borderColor: currentTheme.border }}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs font-bold block mb-1" style={{ color: currentTheme.textSecondary }}>Từ khóa tìm kiếm</label>
                    <input
                      className="w-full px-3 py-2 text-xs rounded-xl border outline-none bg-slate-50"
                      style={{ borderColor: currentTheme.border, color: currentTheme.textPrimary }}
                      defaultValue="Altara Residences Quy Nhơn"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold block mb-1" style={{ color: currentTheme.textSecondary }}>Loại BĐS</label>
                    <select
                      className="w-full px-3 py-2 text-xs rounded-xl border outline-none bg-slate-50"
                      style={{ borderColor: currentTheme.border, color: currentTheme.textPrimary }}
                    >
                      <option>Căn hộ chung cư</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold block mb-1" style={{ color: currentTheme.textSecondary }}>Khoảng giá</label>
                    <select
                      className="w-full px-3 py-2 text-xs rounded-xl border outline-none bg-slate-50"
                      style={{ borderColor: currentTheme.border, color: currentTheme.textPrimary }}
                    >
                      <option>2 tỷ - 3 tỷ VNĐ</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      className="w-full py-2.5 rounded-xl text-xs font-bold text-white shadow transition cursor-pointer"
                      style={{ backgroundColor: currentTheme.primary }}
                    >
                      🔍 Tìm kiếm BĐS
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. CARDS DISPLAY (PROJECT CARD & LISTING CARD) */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-600">3. Thẻ Dự Án & Thẻ Tin Đăng (Project & Listing Cards)</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* LISTING CARD */}
                <div className="bg-white rounded-2xl border overflow-hidden shadow-sm space-y-3 p-4" style={{ borderColor: currentTheme.cardBorder }}>
                  <div className="aspect-[16/10] w-full rounded-xl bg-slate-200 relative overflow-hidden flex items-center justify-center text-xs text-slate-500 font-bold">
                    <span>[Hình ảnh căn hộ BĐS thực tế]</span>
                    <span className="absolute top-2 left-2 px-2.5 py-1 rounded text-[11px] font-bold text-white" style={{ backgroundColor: currentTheme.primary }}>
                      BÁN
                    </span>
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold" style={{ backgroundColor: currentTheme.badgeBg, color: currentTheme.badgeText }}>
                      12 ảnh
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xl font-black" style={{ color: currentTheme.primary }}>
                      2 tỷ 850 triệu VNĐ
                    </div>
                    <h4 className="font-bold text-sm line-clamp-2" style={{ color: currentTheme.textPrimary }}>
                      Căn hộ 2PN Altara Residences Quy Nhơn full nội thất cao cấp view biển
                    </h4>
                    <p className="text-xs" style={{ color: currentTheme.textSecondary }}>
                      📍 Trần Hưng Đạo, P. Hải Cảng, Quy Nhơn · 71.5 m²
                    </p>
                  </div>
                </div>

                {/* PROJECT CARD */}
                <div className="bg-white rounded-2xl border overflow-hidden shadow-sm space-y-3 p-4" style={{ borderColor: currentTheme.cardBorder }}>
                  <div className="aspect-[16/10] w-full rounded-xl bg-slate-200 relative overflow-hidden flex items-center justify-center text-xs text-slate-500 font-bold">
                    <span>[Phối cảnh dự án The Sailing Quy Nhơn]</span>
                    <span className="absolute top-2 left-2 px-2.5 py-1 rounded text-[11px] font-bold text-white" style={{ backgroundColor: currentTheme.accent }}>
                      DỰ ÁN NỔI BẬT
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-extrabold text-base" style={{ color: currentTheme.textPrimary }}>
                      The Sailing Quy Nhơn
                    </h4>
                    <p className="text-xs" style={{ color: currentTheme.textSecondary }}>
                      Tổ hợp căn hộ 5 sao vị trí kim cương giữa trung tâm TP. Quy Nhơn
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t text-xs font-bold" style={{ borderColor: currentTheme.border, color: currentTheme.primary }}>
                      <span>48 căn đang bán</span>
                      <span>Từ 2.3 tỷ/căn ➔</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. CRM TABLE & BADGES */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-600">4. Bảng Dữ Liệu CRM & Trạng Thái</span>
              <div className="bg-white rounded-2xl border overflow-hidden shadow-sm p-4" style={{ borderColor: currentTheme.border }}>
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b" style={{ borderColor: currentTheme.border, color: currentTheme.textSecondary }}>
                      <th className="p-2.5 font-bold">KHÁCH HÀNG</th>
                      <th className="p-2.5 font-bold">NHU CẦU</th>
                      <th className="p-2.5 font-bold">TRẠNG THÁI</th>
                      <th className="p-2.5 font-bold">PHỤ TRÁCH</th>
                    </tr>
                  </thead>
                  <tbody style={{ color: currentTheme.textPrimary }}>
                    <tr className="border-b border-slate-100">
                      <td className="p-2.5 font-bold">Bùi Thị Trúc</td>
                      <td className="p-2.5">Mua căn hộ</td>
                      <td className="p-2.5">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold" style={{ backgroundColor: currentTheme.badgeBg, color: currentTheme.badgeText }}>
                          Mới
                        </span>
                      </td>
                      <td className="p-2.5 font-semibold text-slate-600">Admin</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 5. FOOTER SIMULATION */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-600">5. Chân Trang (Footer)</span>
              <footer className="rounded-2xl p-6 bg-slate-900 text-white space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div className="font-extrabold text-base text-amber-400">Minh Dũng Land</div>
                  <div className="text-xs text-slate-400 space-x-4 font-medium">
                    <span>Trang chủ</span>
                    <span>Mua bán</span>
                    <span>Đặt phòng/Visa</span>
                    <span>Chính sách bảo mật</span>
                  </div>
                </div>
                <div className="text-xs text-slate-400">
                  © 2026 Minh Dũng Land. Tất cả quyền được bảo lưu.
                </div>
              </footer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
