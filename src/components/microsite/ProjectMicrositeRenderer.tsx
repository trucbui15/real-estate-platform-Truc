"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { isBackofficeRole } from "@/lib/permissions";
import { CONTACT_CONFIG } from "@/config/contact";

interface ProjectMicrositeRendererProps {
  projectId: string;
  projectSlug: string;
  projectName: string;
  developer?: string | null;
  address?: string | null;
  sectionsConfig: any[];
  contentJson: any;
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
  isPreview?: boolean;
}

// Bảng ánh xạ tên hiển thị menu chuẩn tiếng Việt, loại bỏ từ viết tắt & "Hero"
const MENU_LABEL_MAP: Record<string, string> = {
  overview: "Tổng quan",
  location: "Vị trí",
  amenities: "Tiện ích",
  floor_plans: "Mặt bằng",
  unit_types: "Căn hộ",
  gallery: "Thư viện",
  video: "Video 360°",
  progress: "Tiến độ",
  sales_policy: "Chính sách",
  documents: "Tài liệu",
};

export default function ProjectMicrositeRenderer({
  projectId,
  projectSlug,
  projectName,
  developer,
  address,
  sectionsConfig,
  contentJson,
  metaTitle,
  metaDescription,
  ogImage,
  isPreview = false,
}: ProjectMicrositeRendererProps) {
  const { data: session } = useSession();
  const isBackoffice = session?.user && isBackofficeRole((session.user as any).role);

  // Form Lead Contact Modal, Mobile Menu & Explore Dropdown State
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [exploreDropdownOpen, setExploreDropdownOpen] = useState(false);

  const [leadForm, setLeadForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    note: "Đăng ký nhận báo giá & thông tin dự án " + projectName,
  });
  const [submittingLead, setSubmittingLead] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);
  const [leadError, setLeadError] = useState("");

  // Tab State cho Floor Plans
  const [activeFloorBlock, setActiveFloorBlock] = useState(0);

  // Lọc các Section enabled, loại bỏ "hero" khỏi menu và sắp xếp theo order
  const activeSections = (sectionsConfig || [])
    .filter((s: any) => s.enabled)
    .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

  const navSections = activeSections.filter((s: any) => s.id !== "hero" && MENU_LABEL_MAP[s.id]);

  // Phân chia Menu chính (6 mục đầu) và Menu Dropdown "Khám phá"
  const PRIMARY_SECTION_IDS = ["overview", "location", "amenities", "floor_plans", "unit_types", "progress"];
  const primaryNavSections = navSections.filter((s: any) => PRIMARY_SECTION_IDS.includes(s.id));
  const exploreNavSections = navSections.filter((s: any) => !PRIMARY_SECTION_IDS.includes(s.id));

  // Thao tác gửi Form đăng ký
  async function handleLeadSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmittingLead(true);
    setLeadError("");
    setLeadSuccess(false);

    try {
      const res = await fetch("/api/contact-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: leadForm.fullName,
          phone: leadForm.phone,
          email: leadForm.email,
          note: leadForm.note,
          projectId: projectId,
          source: "WEBSITE",
          demandType: "TU_VAN",
          pageUrl: typeof window !== "undefined" ? window.location.href : `/du-an/${projectSlug}`,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Không thể gửi yêu cầu");
      }

      setLeadSuccess(true);
      setLeadForm({ fullName: "", phone: "", email: "", note: "" });
    } catch (err: any) {
      setLeadError(err.message || "Lỗi gửi thông tin. Vui lòng liên hệ Hotline.");
    } finally {
      setSubmittingLead(false);
    }
  }

  const hero = contentJson?.hero || {};
  const overview = contentJson?.overview || {};
  const location = contentJson?.location || {};
  const amenities = contentJson?.amenities || {};
  const floorPlans = contentJson?.floor_plans || {};
  const unitTypes = contentJson?.unit_types || {};
  const gallery = contentJson?.gallery || {};
  const video = contentJson?.video || {};
  const progress = contentJson?.progress || {};
  const salesPolicy = contentJson?.sales_policy || {};
  const documents = contentJson?.documents || {};
  const contact = contentJson?.contact || {};

  return (
    <div className="w-full overflow-x-hidden min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-amber-400 selection:text-slate-950 pb-28 sm:pb-16 relative">
      {/* 1. MỎNG & GỌN: BANNER DRAFT PREVIEW NỘI BỘ (ĐÃ ĐƯỢC CHUYỂN NÚT EDIT VÀO ĐÂY) */}
      {isPreview && (
        <div className="bg-amber-500/90 backdrop-blur-md text-slate-950 px-4 py-1 text-[11px] font-bold sticky top-0 z-50 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>⚠️ DRAFT PREVIEW</span>
            <span className="bg-slate-950/20 text-slate-950 px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase">Bản nháp nội bộ</span>
          </div>

          {/* NÚT CHỈNH SỬA CHO ADMIN/MANAGER NẰM GỌN TRONG THANH DRAFT PREVIEW */}
          {isBackoffice && (
            <Link
              href={`/dashboard/projects/${projectId}/website`}
              className="bg-slate-950 text-amber-300 hover:bg-slate-900 text-[11px] font-extrabold px-2.5 py-0.5 rounded transition flex items-center gap-1 shadow-xs"
            >
              <span>✏️</span> Chỉnh sửa trang
            </Link>
          )}
        </div>
      )}

      {/* 2. DYNAMIC SECTION RENDERER */}
      <main className="space-y-16 sm:space-y-24">
        {activeSections.map((sec: any) => {
          switch (sec.id) {
            // --- SECTION 1: HERO BANNER & PROJECT SECTION NAVIGATOR ---
            case "hero":
              return (
                <div key="hero-wrapper" className="space-y-0">
                  <section id="hero" className="relative h-[380px] sm:h-[460px] lg:h-[500px] flex items-center overflow-hidden py-6 sm:py-8">
                    {/* BACKGROUND IMAGE SÁNG TỰ NHIÊN NGUYÊN NÉT */}
                    {hero.bgImage ? (
                      <div className="absolute inset-0 z-0">
                        <img
                          src={hero.bgImage}
                          alt={hero.title || projectName}
                          loading="eager"
                          className="w-full h-full object-cover opacity-100"
                        />
                        {/* VỆT GRADIENT MỎNG NHẸ GÓC TRÁI HỖ TRỢ ĐỌC CHỮ - BÊN PHẢI HOÀN TOÀN TRONG SUỐT */}
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/75 via-slate-950/25 to-transparent"></div>
                      </div>
                    ) : (
                      <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-900"></div>
                    )}

                    <div className="container-page relative z-10 px-4">
                      {/* KHỐI NỘI DUNG NỀN TRANSPARENT HOÀN TOÀN - KHÔNG DÙNG NỀN MỜ KHUNG Ô */}
                      <div className="max-w-lg sm:max-w-xl space-y-3.5 bg-transparent p-0 border-none shadow-none text-white">
                        {hero.tagLine && (
                          <span className="inline-block rounded-full bg-amber-400 text-slate-950 px-3.5 py-1 text-xs font-black shadow-md">
                            {hero.tagLine}
                          </span>
                        )}

                        <h1 className="text-xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] line-clamp-3">
                          {hero.title || projectName}
                        </h1>

                        <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] line-clamp-2">
                          {hero.subtitle || address || "Tổ hợp căn hộ cao cấp sang trọng chuẩn 5 sao view biển trực diện."}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 pt-1">
                          <button
                            onClick={() => setShowInquiryModal(true)}
                            className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm px-5 py-3 rounded-xl shadow-xl transition transform hover:-translate-y-0.5 flex items-center gap-2 min-h-[44px]"
                          >
                            <span>✨</span> {hero.ctaText || "Đăng ký nhận Bảng giá"}
                          </button>

                          {hero.videoUrl && (
                            <a
                              href={hero.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-white/25 hover:bg-white/40 text-white font-bold text-xs sm:text-sm px-4 py-3 rounded-xl border border-white/40 backdrop-blur-xs transition flex items-center gap-2 min-h-[44px] drop-shadow-md"
                            >
                              <span>▶</span> Xem Video
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* PROJECT SECTION NAVIGATOR - ĐẶT NGAY SAU HERO, STICKY KHI SCROLL */}
                  <div className="sticky top-[68px] md:top-[72px] z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs transition-all">
                    <div className="container-page px-4">
                      {/* DESKTOP NAV ITEMS */}
                      <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-700 h-12">
                        {primaryNavSections.map((sec: any) => (
                          <a
                            key={sec.id}
                            href={`#${sec.id}`}
                            className="hover:text-blue-600 transition tracking-tight py-3 border-b-2 border-transparent hover:border-blue-600 -mb-[1px]"
                          >
                            {MENU_LABEL_MAP[sec.id]}
                          </a>
                        ))}

                        {/* DROPDOWN KHÁM PHÁ ▾ */}
                        {exploreNavSections.length > 0 && (
                          <div
                            className="relative py-3"
                            onMouseEnter={() => setExploreDropdownOpen(true)}
                            onMouseLeave={() => setExploreDropdownOpen(false)}
                          >
                            <button
                              type="button"
                              onClick={() => setExploreDropdownOpen(!exploreDropdownOpen)}
                              className="flex items-center gap-1 hover:text-blue-600 transition font-semibold text-slate-700 cursor-pointer"
                            >
                              <span>Khám phá</span>
                              <span className={`text-[10px] transition-transform duration-200 ${exploreDropdownOpen ? "rotate-180" : ""}`}>▾</span>
                            </button>

                            {exploreDropdownOpen && (
                              <div className="absolute top-full left-0 mt-1 w-44 bg-white border border-slate-200 shadow-lg rounded-xl p-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                                {exploreNavSections.map((sec: any) => (
                                  <a
                                    key={sec.id}
                                    href={`#${sec.id}`}
                                    onClick={() => setExploreDropdownOpen(false)}
                                    className="block px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition"
                                  >
                                    {MENU_LABEL_MAP[sec.id]}
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </nav>

                      {/* MOBILE NAV BUTTON & DROPDOWN (< 768px) */}
                      <div className="md:hidden flex items-center justify-between h-11 py-1">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mục lục dự án</span>
                        <button
                          type="button"
                          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                          className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 rounded-lg hover:bg-slate-200 transition cursor-pointer"
                        >
                          <span>Khám phá dự án</span>
                          <span className={`text-[10px] transition-transform duration-200 ${mobileMenuOpen ? "rotate-180" : ""}`}>▾</span>
                        </button>
                      </div>

                      {/* MOBILE DROPDOWN DRAWER */}
                      {mobileMenuOpen && (
                        <div className="md:hidden bg-white border-t border-slate-200 p-3 space-y-1 text-xs font-bold shadow-lg animate-in slide-in-from-top-2 duration-200 rounded-b-2xl">
                          {navSections.map((sec: any) => (
                            <a
                              key={sec.id}
                              href={`#${sec.id}`}
                              onClick={() => setMobileMenuOpen(false)}
                              className="block py-2 px-3 rounded-lg text-slate-800 hover:bg-slate-50 hover:text-blue-600 transition"
                            >
                              {MENU_LABEL_MAP[sec.id]}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );

            // --- SECTION 2: OVERVIEW (NỀN SÁNG ELEGANT) ---
            case "overview":
              return (
                <section key="overview" id="overview" className="container-page px-4">
                  <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-12 shadow-sm space-y-8">
                    <div className="max-w-3xl space-y-3">
                      <span className="text-xs font-extrabold text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full border border-amber-200/60 inline-block">
                        Tổng Quan
                      </span>
                      <h2 className="text-xl sm:text-3xl font-black text-slate-900">
                        {overview.headline || `Thông quan tổng thể dự án ${projectName}`}
                      </h2>
                      {overview.summary && <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">{overview.summary}</p>}
                    </div>

                    {/* SPECS GRID */}
                    {overview.specs && overview.specs.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-2">
                        {overview.specs.map((spec: any, idx: number) => (
                          <div key={idx} className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70 space-y-1">
                            <span className="text-[11px] font-bold text-slate-500 block">{spec.label}</span>
                            <span className="text-xs sm:text-sm font-black text-slate-900 block truncate">{spec.value || "—"}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              );

            // --- SECTION 3: LOCATION ---
            case "location":
              return (
                <section key="location" id="location" className="container-page px-4 space-y-8">
                  <div className="max-w-3xl space-y-2">
                    <span className="text-xs font-extrabold text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full border border-amber-200/60 inline-block">
                      Vị Trí Đắt Giá
                    </span>
                    <h2 className="text-xl sm:text-3xl font-black text-slate-900">Tâm điểm kết nối giao thông</h2>
                    {location.address && <p className="text-xs sm:text-sm text-slate-600">📍 Địa chỉ: <span className="font-bold text-slate-900">{location.address}</span></p>}
                  </div>

                  <div className="grid gap-6 lg:grid-cols-2 items-center">
                    {location.googleMapUrl ? (
                      <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-md h-[300px] sm:h-[340px]">
                        <iframe src={location.googleMapUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy"></iframe>
                      </div>
                    ) : location.mapImage ? (
                      <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-md aspect-[16/10]">
                        <img src={location.mapImage} alt="Sơ đồ vị trí" loading="lazy" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="rounded-3xl bg-slate-100 border border-slate-200 p-8 text-center text-xs text-slate-500 h-[280px] flex items-center justify-center">
                        Sơ đồ bản đồ vị trí dự án
                      </div>
                    )}

                    <div className="space-y-4">
                      <h3 className="font-bold text-sm sm:text-base text-slate-900">Khả năng kết nối thuận tiện</h3>
                      <div className="space-y-2.5">
                        {location.connectivity && location.connectivity.length > 0 ? (
                          location.connectivity.map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs text-xs">
                              <span className="font-medium text-slate-700">{item.title}</span>
                              <span className="font-bold text-amber-600">{item.distance}</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-xs text-slate-500">Cách biển Quy Nhơn 150m, di chuyển trung tâm 3 phút.</div>
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              );

            // --- SECTION 4: AMENITIES ---
            case "amenities":
              return (
                <section key="amenities" id="amenities" className="container-page px-4 space-y-8">
                  <div className="max-w-3xl space-y-2">
                    <span className="text-xs font-extrabold text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full border border-amber-200/60 inline-block">
                      Tiện Ích 5 Sao
                    </span>
                    <h2 className="text-xl sm:text-3xl font-black text-slate-900">{amenities.title || "Trải nghiệm sống đẳng cấp vượt trội"}</h2>
                    {amenities.description && <p className="text-xs sm:text-sm text-slate-600">{amenities.description}</p>}
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {(amenities.items || []).map((item: any, idx: number) => (
                      <div key={idx} className="rounded-3xl bg-white border border-slate-200/80 overflow-hidden shadow-sm hover:border-amber-400 hover:shadow-md transition group space-y-3 p-4">
                        {item.image ? (
                          <div className="aspect-[16/10] overflow-hidden rounded-2xl bg-slate-100">
                            <img src={item.image} alt={item.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                          </div>
                        ) : (
                          <div className="aspect-[16/10] bg-slate-100 rounded-2xl flex items-center justify-center text-2xl">🏊</div>
                        )}
                        <h3 className="font-bold text-sm sm:text-base text-slate-900">{item.name || `Tiện ích #${idx + 1}`}</h3>
                      </div>
                    ))}
                  </div>
                </section>
              );

            // --- SECTION 5: FLOOR PLANS ---
            case "floor_plans":
              return (
                <section key="floor_plans" id="floor_plans" className="container-page px-4 space-y-8">
                  <div className="max-w-3xl space-y-2">
                    <span className="text-xs font-extrabold text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full border border-amber-200/60 inline-block">
                      Mặt Bằng Kiến Trúc
                    </span>
                    <h2 className="text-xl sm:text-3xl font-black text-slate-900">{floorPlans.title || "Thiết kế mặt bằng kiến trúc độc đáo"}</h2>
                  </div>

                  {floorPlans.blocks && floorPlans.blocks.length > 0 && (
                    <div className="space-y-6">
                      <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                        {floorPlans.blocks.map((block: any, idx: number) => (
                          <button
                            key={idx}
                            onClick={() => setActiveFloorBlock(idx)}
                            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition shrink-0 min-h-[40px] ${
                              activeFloorBlock === idx
                                ? "bg-amber-400 text-slate-950 shadow-sm"
                                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                            }`}
                          >
                            {block.name || `Khối / Mặt bằng #${idx + 1}`}
                          </button>
                        ))}
                      </div>

                      <div className="bg-white border border-slate-200/80 rounded-3xl p-4 sm:p-6 flex flex-col items-center shadow-sm space-y-4">
                        {floorPlans.blocks[activeFloorBlock]?.image ? (
                          <img
                            src={floorPlans.blocks[activeFloorBlock].image}
                            alt={floorPlans.blocks[activeFloorBlock].name}
                            loading="lazy"
                            className="max-h-[450px] w-auto object-contain rounded-xl"
                          />
                        ) : (
                          <div className="h-64 flex items-center justify-center text-slate-400 text-xs">Chưa cập nhật sơ đồ mặt bằng</div>
                        )}
                        <p className="text-xs text-slate-600 font-medium text-center">{floorPlans.blocks[activeFloorBlock]?.desc}</p>
                      </div>
                    </div>
                  )}
                </section>
              );

            // --- SECTION 6: UNIT TYPES ---
            case "unit_types":
              return (
                <section key="unit_types" id="unit_types" className="container-page px-4 space-y-8">
                  <div className="max-w-3xl space-y-2">
                    <span className="text-xs font-extrabold text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full border border-amber-200/60 inline-block">
                      Căn Hộ Mẫu
                    </span>
                    <h2 className="text-xl sm:text-3xl font-black text-slate-900">{unitTypes.title || "Các loại diện tích & thiết kế căn hộ"}</h2>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {(unitTypes.units || []).map((unit: any, idx: number) => (
                      <div key={idx} className="rounded-3xl bg-white border border-slate-200/80 p-5 space-y-4 shadow-sm hover:shadow-md transition">
                        {unit.image && (
                          <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-slate-100">
                            <img src={unit.image} alt={unit.name} loading="lazy" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-bold text-sm sm:text-base text-slate-900">{unit.name}</h3>
                          {unit.area && <span className="text-xs text-slate-500">Diện tích: {unit.area}</span>}
                        </div>
                        {unit.priceFrom && (
                          <div className="text-sm font-black text-amber-600">Từ {unit.priceFrom}</div>
                        )}
                        <button
                          onClick={() => setShowInquiryModal(true)}
                          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-xl transition min-h-[40px]"
                        >
                          Nhận thông báo giá căn này
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              );

            // --- SECTION 7: GALLERY (THƯ VIỆN ẢNH) ---
            case "gallery":
              return (
                <section key="gallery" id="gallery" className="container-page px-4 space-y-8">
                  <div className="max-w-3xl space-y-2">
                    <span className="text-xs font-extrabold text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full border border-amber-200/60 inline-block">
                      Thư Viện Ảnh
                    </span>
                    <h2 className="text-xl sm:text-3xl font-black text-slate-900">{gallery.title || "Bộ sưu tập hình ảnh thực tế"}</h2>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                    {(gallery.images || []).map((img: any, idx: number) => (
                      <div key={idx} className="rounded-2xl overflow-hidden border border-slate-200 aspect-[4/3] group relative bg-slate-100">
                        {img.url ? (
                          <img src={img.url} alt={img.caption || "Gallery image"} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">📷</div>
                        )}
                        {img.caption && (
                          <div className="absolute inset-x-0 bottom-0 bg-slate-900/80 p-2 text-[11px] text-white font-medium text-center truncate">
                            {img.caption}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              );

            // --- SECTION 8: VIDEO & 360 ---
            case "video":
              return (
                <section key="video" id="video" className="container-page px-4 space-y-8">
                  <div className="max-w-3xl space-y-2">
                    <span className="text-xs font-extrabold text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full border border-amber-200/60 inline-block">
                      Video & Tour 360°
                    </span>
                    <h2 className="text-xl sm:text-3xl font-black text-slate-900">{video.title || "Trải nghiệm hình ảnh chân thực"}</h2>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    {video.tour360Url && (
                      <a
                        href={video.tour360Url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-amber-400 text-slate-950 font-black text-xs px-5 py-3.5 rounded-2xl shadow-md hover:bg-amber-300 transition flex items-center gap-2 min-h-[44px]"
                      >
                        <span>🌐</span> Mở Tour 360° Thực tế ảo
                      </a>
                    )}
                  </div>
                </section>
              );

            // --- SECTION 9: PROGRESS ---
            case "progress":
              return (
                <section key="progress" id="progress" className="container-page px-4 space-y-8">
                  <div className="max-w-3xl space-y-2">
                    <span className="text-xs font-extrabold text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full border border-amber-200/60 inline-block">
                      Tiến Độ
                    </span>
                    <h2 className="text-xl sm:text-3xl font-black text-slate-900">{progress.title || "Cập nhật tiến độ xây dựng công trình"}</h2>
                  </div>

                  <div className="space-y-4">
                    {(progress.items || []).map((p: any, idx: number) => (
                      <div key={idx} className="bg-white border border-slate-200/80 rounded-3xl p-5 flex flex-col sm:flex-row gap-4 items-start shadow-sm">
                        {p.image && <img src={p.image} alt={p.title} loading="lazy" className="w-full sm:w-48 aspect-[16/10] object-cover rounded-2xl" />}
                        <div className="space-y-1.5">
                          {p.date && <span className="text-xs font-bold text-amber-600">{p.date}</span>}
                          <h3 className="font-bold text-base text-slate-900">{p.title}</h3>
                          <p className="text-xs text-slate-600 leading-relaxed">{p.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );

            // --- SECTION 10: SALES POLICY ---
            case "sales_policy":
              return (
                <section key="sales_policy" id="sales_policy" className="container-page px-4 space-y-8">
                  <div className="bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-white border border-amber-300/80 rounded-3xl p-6 sm:p-10 space-y-6 shadow-sm">
                    <div className="max-w-3xl space-y-2">
                      <span className="text-xs font-extrabold text-amber-600 uppercase tracking-widest bg-amber-100/80 px-3 py-1 rounded-full border border-amber-200 inline-block">
                        Chính Sách Bán Hàng
                      </span>
                      <h2 className="text-xl sm:text-3xl font-black text-slate-900">{salesPolicy.title || "Ưu đãi thanh toán độc quyền"}</h2>
                      {salesPolicy.summary && <p className="text-xs sm:text-sm text-slate-600">{salesPolicy.summary}</p>}
                    </div>

                    <div className="flex flex-wrap gap-4 pt-2">
                      <button
                        onClick={() => setShowInquiryModal(true)}
                        className="bg-amber-400 text-slate-950 font-black text-xs px-6 py-3.5 rounded-2xl shadow-md hover:bg-amber-300 transition min-h-[44px]"
                      >
                        Tải chính sách chi tiết & Bảng tính dòng tiền
                      </button>
                    </div>
                  </div>
                </section>
              );

            // --- SECTION 11: DOCUMENTS ---
            case "documents":
              return (
                <section key="documents" id="documents" className="container-page px-4 space-y-6">
                  <div className="max-w-3xl space-y-2">
                    <span className="text-xs font-extrabold text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full border border-amber-200/60 inline-block">
                      Tài Liệu
                    </span>
                    <h2 className="text-xl sm:text-3xl font-black text-slate-900">{documents.title || "Tài liệu & Hồ sơ pháp lý dự án"}</h2>
                  </div>

                  <div className="bg-white border border-slate-200/80 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                    <div className="space-y-1">
                      <h3 className="font-bold text-sm text-slate-900">Xem trọn bộ tài liệu dự án {projectName}</h3>
                      <p className="text-xs text-slate-500">Bao gồm Brochure, Pháp lý, Bảng giá & Thiết kế căn hộ.</p>
                    </div>
                    <Link
                      href={`/listings?project=${projectSlug}`}
                      className="bg-slate-900 hover:bg-slate-800 text-amber-300 text-xs font-bold px-5 py-3 rounded-2xl transition shrink-0 min-h-[44px] flex items-center"
                    >
                      Xem sản phẩm đang bán →
                    </Link>
                  </div>
                </section>
              );

            // --- SECTION 12: CONTACT ---
            case "contact":
              return null;

            default:
              return null;
          }
        })}
      </main>



      {/* 5. FLOATING MOBILE CONTACT BAR */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 border-t border-slate-200 p-3 sm:hidden backdrop-blur-md flex items-center justify-around gap-2 shadow-2xl">
        <button
          onClick={() => setShowInquiryModal(true)}
          className="flex-1 bg-amber-400 text-slate-950 font-black text-xs py-3 rounded-xl text-center min-h-[44px] flex items-center justify-center gap-1.5 shadow-md"
        >
          <span>📞</span> Nhận Bảng Giá Chi Tiết
        </button>
      </div>

      {/* 6. INQUIRY MODAL */}
      {showInquiryModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative text-slate-900">
            <button
              onClick={() => setShowInquiryModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 font-bold text-sm p-1"
            >
              ✕
            </button>
            <h3 className="font-extrabold text-lg text-slate-900">Đăng Ký Tư Vấn {projectName}</h3>

            {leadSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-xl text-center space-y-2">
                <div>✓ Cảm ơn bạn. Chúng tôi sẽ liên hệ sớm nhất!</div>
                <button onClick={() => setShowInquiryModal(false)} className="btn-primary text-xs !py-1">Đóng</button>
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit} className="space-y-3 text-xs">
                {leadError && <div className="p-2 bg-red-50 text-red-700 rounded">{leadError}</div>}
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Họ tên *</label>
                  <input
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                    required
                    value={leadForm.fullName}
                    onChange={(e) => setLeadForm({ ...leadForm, fullName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Số điện thoại *</label>
                  <input
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono"
                    required
                    value={leadForm.phone}
                    onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                  />
                </div>
                <button
                  type="submit"
                  disabled={submittingLead}
                  className="w-full bg-amber-400 text-slate-950 font-black py-3 rounded-xl shadow min-h-[44px]"
                >
                  {submittingLead ? "Đang gửi..." : "Gửi Đăng Ký"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
