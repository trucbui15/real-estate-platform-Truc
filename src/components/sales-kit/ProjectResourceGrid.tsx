import React from "react";

interface ResourceItem {
  id: string;
  type: string;
  title: string;
  url: string;
  description?: string | null;
  isPublic: boolean;
  isActive: boolean;
  sortOrder: number;
}

interface ProjectResourceGridProps {
  resources: ResourceItem[];
  projectName: string;
}

export function ProjectResourceGrid({ resources, projectName }: ProjectResourceGridProps) {
  // Lọc chỉ lấy các tài nguyên có URL hợp lệ
  const validResources = resources.filter(
    (res) => res.url && res.url.trim() !== ""
  );

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-4 gap-2">
        <div>
          <h3 className="font-display text-lg font-extrabold text-dark flex items-center gap-2">
            <span>📁</span>
            <span>KHO TÀI LIỆU & SALES KIT BÁN HÀNG</span>
          </h3>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Danh mục tài liệu nghiệp vụ, bảng hàng, chính sách bán hàng và hồ sơ pháp lý dự án {projectName}.
          </p>
        </div>
        <span className="text-xs font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-full border border-primary-100 w-fit">
          {validResources.length} tài liệu sẵn sàng
        </span>
      </div>

      {validResources.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 pt-2">
          {validResources.map((res) => {
            let icon = "📄";
            let defaultLabel = res.title;
            let badgeColor = "bg-white text-gray-800 border-gray-200 hover:border-primary-500 hover:text-primary-600";

            if (res.type === "PRICE_LIST") {
              icon = "📊";
              badgeColor = "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20";
              if (!defaultLabel.toLowerCase().includes("bảng hàng") && !defaultLabel.toLowerCase().includes("tính giá")) {
                defaultLabel = `Mở Bảng hàng ${res.title}`;
              }
            } else if (res.type === "LEGAL") {
              icon = "⚖️";
              badgeColor = "bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-600 hover:text-white";
            } else if (res.type === "FLOOR_PLAN") {
              icon = "📐";
              badgeColor = "bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-800 hover:text-white";
            } else if (res.type === "SALES_POLICY") {
              icon = "📋";
              badgeColor = "bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-500 hover:text-white";
            } else if (res.type === "BROCHURE") {
              icon = "📘";
              badgeColor = "bg-indigo-50 text-indigo-900 border-indigo-200 hover:bg-indigo-600 hover:text-white";
            } else if (res.type === "VIDEO") {
              icon = "🎬";
              badgeColor = "bg-rose-50 text-rose-900 border-rose-200 hover:bg-rose-600 hover:text-white";
            } else if (res.type === "IMAGE" || res.type === "DESIGN_FILE") {
              icon = "🖼️";
            } else if (res.type === "GOOGLE_DRIVE") {
              icon = "📁";
            } else if (res.type === "WEBSITE") {
              icon = "🌐";
            } else if (res.type === "TOUR_360") {
              icon = "🔄";
              badgeColor = "bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-600 hover:text-white";
            }

            const isPrivate = !res.isPublic;

            return (
              <a
                key={res.id}
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 ${badgeColor}`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <span className="text-xl shrink-0">{icon}</span>
                  <div className="overflow-hidden">
                    <div className="font-extrabold text-xs truncate group-hover:underline">
                      {defaultLabel}
                    </div>
                    {res.description && (
                      <div className="text-[10px] opacity-75 truncate mt-0.5 font-medium">
                        {res.description}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-2">
                  {isPrivate && (
                    <span className="text-xs" title="Tài liệu Sales Kit khóa nội bộ">
                      🔒
                    </span>
                  )}
                  <span className="text-xs group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                    ↗
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl bg-slate-50 border border-dashed border-gray-200 p-8 text-center text-xs text-gray-400 font-medium">
          Dự án chưa gắn liên kết tài liệu. Vui lòng vào Dashboard để bổ sung đường dẫn.
        </div>
      )}
    </div>
  );
}
