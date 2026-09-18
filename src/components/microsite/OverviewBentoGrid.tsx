import React from "react";

interface SpecItem {
  label: string;
  value: string;
}

interface OverviewBentoGridProps {
  specs: SpecItem[];
}

// Helper icons (Heroicons style)
function BuildingIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}

function MapPinIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function ScaleIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  );
}

function HomeIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

function CalendarIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function PaletteIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4 8.001 8.001 0 0115.357-2m-4.57 6A5.002 5.002 0 0112 18a5.002 5.002 0 01-4.787 3.528A4 4 0 017 21zm10-10a2 2 0 11-4 0 2 2 0 014 0zm-7 2a2 2 0 11-4 0 2 2 0 014 0zm2-5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}

function HandshakeIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}

function SparklesIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}

function DocumentCheckIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function TagIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  );
}

function getSpecMeta(label: string) {
  const norm = (label || "").toLowerCase().trim().replace(/:\s*$/, "");

  if (norm.includes("đối tác") || norm.includes("đồng hành") || norm.includes("đơn vị phát triển")) {
    return {
      icon: HandshakeIcon,
      accentColor: "text-amber-600 bg-amber-50 border-amber-200/80",
      badgeText: "Hệ sinh thái đối tác",
      isPartner: true,
      isAmenity: false,
    };
  }
  if (norm.includes("tiện ích") || norm.includes("đặc quyền")) {
    return {
      icon: SparklesIcon,
      accentColor: "text-amber-600 bg-amber-50 border-amber-200/80",
      badgeText: "Phân tầng tiện ích",
      isPartner: false,
      isAmenity: true,
    };
  }
  if (norm.includes("chủ đầu tư") || norm.includes("cđt") || norm.includes("phát triển")) {
    return {
      icon: BuildingIcon,
      accentColor: "text-amber-600 bg-amber-50 border-amber-200/80",
      badgeText: null,
      isPartner: false,
      isAmenity: false,
    };
  }
  if (norm.includes("địa chỉ") || norm.includes("vị trí")) {
    return {
      icon: MapPinIcon,
      accentColor: "text-rose-600 bg-rose-50 border-rose-200/80",
      badgeText: null,
      isPartner: false,
      isAmenity: false,
    };
  }
  if (norm.includes("quy mô") || norm.includes("diện tích") || norm.includes("mặt bằng")) {
    return {
      icon: ScaleIcon,
      accentColor: "text-sky-600 bg-sky-50 border-sky-200/80",
      badgeText: null,
      isPartner: false,
      isAmenity: false,
    };
  }
  if (norm.includes("sản phẩm") || norm.includes("căn hộ") || norm.includes("loại hình") || norm.includes("số lượng")) {
    return {
      icon: HomeIcon,
      accentColor: "text-indigo-600 bg-indigo-50 border-indigo-200/80",
      badgeText: null,
      isPartner: false,
      isAmenity: false,
    };
  }
  if (norm.includes("tiến độ") || norm.includes("bàn giao") || norm.includes("thời gian")) {
    return {
      icon: CalendarIcon,
      accentColor: "text-emerald-600 bg-emerald-50 border-emerald-200/80",
      badgeText: null,
      isPartner: false,
      isAmenity: false,
    };
  }
  if (norm.includes("kiến trúc") || norm.includes("phong cách") || norm.includes("thiết kế")) {
    return {
      icon: PaletteIcon,
      accentColor: "text-purple-600 bg-purple-50 border-purple-200/80",
      badgeText: null,
      isPartner: false,
      isAmenity: false,
    };
  }
  if (norm.includes("pháp lý") || norm.includes("sổ")) {
    return {
      icon: DocumentCheckIcon,
      accentColor: "text-teal-600 bg-teal-50 border-teal-200/80",
      badgeText: null,
      isPartner: false,
      isAmenity: false,
    };
  }

  return {
    icon: TagIcon,
    accentColor: "text-slate-600 bg-slate-100 border-slate-200/80",
    badgeText: null,
    isPartner: false,
    isAmenity: false,
  };
}

// Tách các dòng bullet text
function parseBulletLines(text: string): string[] {
  if (!text) return [];
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
    .map((l) => l.replace(/^[•*–-]\s*/, ""));
}

export default function OverviewBentoGrid({ specs }: OverviewBentoGridProps) {
  if (!specs || specs.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
      {specs.map((spec, idx) => {
        const cleanLabel = (spec.label || "").replace(/:\s*$/, "").trim();
        const meta = getSpecMeta(cleanLabel);
        const IconComponent = meta.icon;
        const rawValue = spec.value || "—";
        const bulletLines = parseBulletLines(rawValue);

        // Xác định thẻ dài (Full-width 3 cột)
        const isMultiLine = bulletLines.length >= 3;
        const isFullWidth =
          meta.isPartner ||
          (meta.isAmenity && isMultiLine) ||
          (isMultiLine && rawValue.length > 220);

        // Xác định thẻ Địa chỉ dài (ưu tiên chiếm 2 cột để đọc thoáng)
        const isAddress =
          !isFullWidth &&
          (cleanLabel.toLowerCase().includes("địa chỉ") || cleanLabel.toLowerCase().includes("vị trí")) &&
          rawValue.length > 70;

        // 1. THẺ FULL-WIDTH (ĐỐI TÁC CHIẾN LƯỢC HOẶC TIỆN ÍCH PHÂN TẦNG)
        if (isFullWidth) {
          return (
            <div
              key={idx}
              className="col-span-1 md:col-span-2 lg:col-span-3 rounded-2xl bg-gradient-to-br from-slate-50 via-white to-amber-50/20 border border-slate-200/90 hover:border-amber-400/80 p-5 sm:p-7 shadow-xs hover:shadow-md transition-all duration-300 space-y-4"
            >
              {/* Header của thẻ Full-width */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200/70">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shadow-2xs ${meta.accentColor}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800">
                      {cleanLabel}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {meta.isPartner
                        ? "Hệ sinh thái đơn vị tư vấn, tổng thầu xây dựng và đối tác tài chính"
                        : "Hệ thống dịch vụ & trải nghiệm sống đặc quyền theo tầng"}
                    </p>
                  </div>
                </div>

                {meta.badgeText && (
                  <span className="inline-flex items-center text-[10px] font-bold text-amber-700 bg-amber-100/70 px-3 py-1 rounded-full border border-amber-200">
                    {meta.badgeText}
                  </span>
                )}
              </div>

              {/* Nội dung chia 2 cột thoáng đãng */}
              {isMultiLine ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {bulletLines.map((line, bIdx) => {
                    const colonIdx = line.indexOf(":");
                    const isLastOdd = bIdx === bulletLines.length - 1 && bulletLines.length % 2 !== 0;

                    if (colonIdx > 0 && colonIdx < 50) {
                      const role = line.slice(0, colonIdx).trim();
                      const name = line.slice(colonIdx + 1).trim();

                      // Format riêng cho tiện ích phân tầng
                      if (meta.isAmenity) {
                        return (
                          <div
                            key={bIdx}
                            className={`flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-3 p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs hover:border-amber-400/60 transition-all ${
                              isLastOdd ? "md:col-span-2" : ""
                            }`}
                          >
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-100/75 text-amber-800 text-[11px] font-extrabold uppercase tracking-wider shrink-0 w-fit">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0" />
                              {role}
                            </span>
                            <span className="text-xs sm:text-[13px] font-semibold text-slate-800 leading-snug">
                              {name}
                            </span>
                          </div>
                        );
                      }

                      // Format cho Đối tác đồng hành
                      return (
                        <div
                          key={bIdx}
                          className={`flex flex-col sm:flex-row sm:items-baseline justify-between gap-1.5 sm:gap-3 p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs hover:border-amber-400/60 hover:shadow-xs transition-all ${
                            isLastOdd ? "md:col-span-2" : ""
                          }`}
                        >
                          <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5 shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                            {role}
                          </span>
                          <span className="text-xs sm:text-[13px] font-bold text-slate-900 text-left sm:text-right leading-snug">
                            {name}
                          </span>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={bIdx}
                        className={`flex items-start gap-2.5 p-3.5 rounded-xl bg-white border border-slate-200/80 text-xs sm:text-[13px] text-slate-800 font-semibold shadow-2xs ${
                          isLastOdd ? "md:col-span-2" : ""
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                        <span>{line}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-800 font-medium leading-relaxed break-words whitespace-pre-line">
                  {rawValue}
                </p>
              )}
            </div>
          );
        }

        // 2. THẺ TIÊU CHUẨN (1 HOẶC 2 CỘT)
        return (
          <div
            key={idx}
            className={`group relative bg-slate-50/75 hover:bg-white rounded-2xl p-5 border border-slate-200/85 hover:border-amber-400/80 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between ${
              isAddress ? "col-span-1 md:col-span-2 lg:col-span-2" : "col-span-1"
            }`}
          >
            {/* Header: Icon + Label */}
            <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-200/60">
              <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform duration-300 ${meta.accentColor}`}>
                <IconComponent className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider line-clamp-1">
                {cleanLabel}
              </span>
            </div>

            {/* Value Body */}
            <div className="pt-2.5 flex-1 flex flex-col justify-center">
              {bulletLines.length > 1 ? (
                <div className="space-y-1.5">
                  {bulletLines.map((line, bIdx) => (
                    <div key={bIdx} className="flex items-start gap-2 text-xs sm:text-[13px] font-semibold text-slate-800 leading-snug">
                      <span className="text-amber-500 text-xs mt-0.5">•</span>
                      <span>{line}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs sm:text-[14px] font-semibold text-slate-800 leading-relaxed break-words whitespace-pre-line">
                  {rawValue}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
