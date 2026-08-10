import React from "react";

interface OverviewSection {
  title: string;
  icon?: string;
  content: string[];
}

interface ProjectOverviewContentProps {
  projectName: string;
  developer?: string | null;
  address?: string | null;
  sections?: OverviewSection[];
}

export function ProjectOverviewContent({
  projectName,
  developer,
  address,
  sections,
}: ProjectOverviewContentProps) {
  // Mặc định nội dung tổng quan chuẩn hóa cho Simona Heights / Dự án tiêu chuẩn nếu không có custom sections
  const defaultSections: OverviewSection[] = [
    {
      title: "Tọa độ kim cương trung tâm",
      icon: "📍",
      content: [
        `Vị trí đắc địa tại ${address || "trung tâm TP. Quy Nhơn"}, thuận tiện kết nối trực tiếp đến bãi biển, đại lộ chính và các khu dịch vụ thương mại trọng điểm.`,
        "Kết nối giao thông hoàn hảo: 3 phút tới Bãi biển Quy Nhơn, 5 phút tới Quảng trường Nguyễn Tất Thành, 35 phút tới Sân bay Phù Cát.",
      ],
    },
    {
      title: "Quy mô kiến trúc & Sản phẩm phát triển",
      icon: "🏗️",
      content: [
        `Phát triển bởi chủ đầu tư ${developer || "uy tín"}, quy hoạch theo phong cách kiến trúc hiện đại tối ưu công năng sử dụng và tầm nhìn view biển/thành phố.`,
        "Cơ cấu sản phẩm đa dạng: Căn hộ 1PN, 2PN, 3PN, Shophouse khối đế thương mại và các dòng căn hộ cao cấp Penthouse & Duplex.",
      ],
    },
    {
      title: "Hệ thống tiện ích nội khu chuẩn 5 sao",
      icon: "✨",
      content: [
        "Hệ sinh thái tiện ích đẳng cấp khép kín: Bể bơi vô cực trên cao, Sky Bar & Lounge, Trung tâm thương mại sầm uất, Gym & Spa hiện đại, Khu vui chơi trẻ em và Công viên cảnh quan xanh.",
        "Hệ thống an ninh đa lớp 24/7, bãi đỗ xe thông minh 2 tầng hầm và dịch vụ quản lý vận hành chuyên nghiệp.",
      ],
    },
  ];

  const displaySections = sections && sections.length > 0 ? sections : defaultSections;

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6">
      <div className="border-b border-gray-100 pb-4">
        <h3 className="font-display text-lg font-extrabold text-dark flex items-center gap-2">
          <span>🏛️</span>
          <span>TỔNG QUAN VÀ ĐẶC ĐIỂM DỰ ÁN</span>
        </h3>
        <p className="text-xs text-gray-500 font-medium mt-0.5">
          Thông tin chi tiết về vị trí, chủ đầu tư, mặt bằng và hệ tiện ích cư dân dự án {projectName}.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {displaySections.map((sec, idx) => (
          <div
            key={idx}
            className="flex flex-col justify-between rounded-2xl bg-slate-50/70 p-5 border border-gray-100 space-y-3 hover:bg-slate-50 transition"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-display text-sm font-extrabold text-dark">
                <span>{sec.icon || "💡"}</span>
                <span>{sec.title}</span>
              </div>
              <div className="space-y-2 text-xs text-gray-600 leading-relaxed font-medium">
                {sec.content.map((pText, pIdx) => (
                  <p key={pIdx}>• {pText}</p>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
