"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LABELS } from "@/lib/utils";

interface ResourceViewClientProps {
  projects: any[];
  initialType?: string;
  initialSearch?: string;
}

export default function ResourceViewClient({
  projects,
  initialType = "",
  initialSearch = "",
}: ResourceViewClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);

  function handleFilterType(typeKey: string) {
    const params = new URLSearchParams();
    if (typeKey) params.set("type", typeKey);
    if (search) params.set("search", search);
    router.push(`/tai-lieu-du-an?${params.toString()}`);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (initialType) params.set("type", initialType);
    if (search) params.set("search", search);
    router.push(`/tai-lieu-du-an?${params.toString()}`);
  }

  const categoryTypes = [
    { key: "", label: "Tất cả tài liệu" },
    { key: "WEBSITE", label: "Website" },
    { key: "TOUR_360", label: "360°" },
    { key: "DRIVER_TT", label: "Driver TT" },
    { key: "PRICE_LIST", label: "Bảng giá" },
    { key: "SALES_POLICY", label: "Chính sách bán hàng" },
    { key: "FLOOR_PLAN", label: "Mặt bằng" },
    { key: "BROCHURE", label: "Brochure" },
    { key: "LEGAL", label: "Pháp lý" },
    { key: "PROGRESS", label: "Tiến độ" },
    { key: "VIDEO", label: "Video" },
    { key: "OTHER", label: "Khác" },
  ];

  return (
    <div className="mt-8 space-y-8">
      {/* Ô tìm kiếm & Filter Bar */}
      <div className="flex flex-col gap-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-lg">
          <input
            type="text"
            placeholder="Tìm dự án hoặc tài liệu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input flex-1 text-sm"
          />
          <button type="submit" className="btn-primary text-xs px-5">
            Tìm kiếm
          </button>
        </form>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2 pt-2">
          {categoryTypes.map((cat) => (
            <button
              key={cat.key}
              onClick={() => handleFilterType(cat.key)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                initialType === cat.key
                  ? "bg-brand-900 text-white shadow-sm"
                  : "bg-sand-100 text-brand-700 hover:bg-brand-50 hover:text-brand-900"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Danh sách Tài liệu theo Dự án */}
      {projects.length === 0 ? (
        <div className="rounded-lg border border-dashed border-sand-200 p-12 text-center text-brand-400 text-sm">
          {search || initialType
            ? "Không tìm thấy tài liệu phù hợp."
            : "Chưa có tài liệu dự án."}
        </div>
      ) : (
        <div className="space-y-8">
          {projects.map((project) => (
            <div key={project.id} className="card p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 gap-2">
                <div>
                  <h2 className="font-display text-xl font-bold text-brand-900">
                    🏢 {project.name}
                  </h2>
                  {project.developer && (
                    <div className="text-xs text-brand-400 mt-0.5">
                      Chủ đầu tư: {project.developer}
                    </div>
                  )}
                </div>
                <Link
                  href={`/listings?project=${project.slug}`}
                  className="text-xs font-semibold text-brand-500 hover:underline shrink-0"
                >
                  Xem sản phẩm dự án →
                </Link>
              </div>

              {/* Grid hiển thị tài nguyên */}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {project.resources.map((res: any) => (
                  <div
                    key={res.id}
                    className="flex flex-col justify-between rounded-lg border border-sand-200 bg-sand-50/60 p-4 hover:border-brand-300 hover:bg-white transition"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="rounded bg-brand-100 px-2 py-0.5 text-[10px] font-bold text-brand-800 uppercase tracking-wider">
                          {LABELS.projectResourceType[res.type as keyof typeof LABELS.projectResourceType] || res.type}
                        </span>
                      </div>

                      <div className="font-semibold text-sm text-brand-900 line-clamp-2">
                        {res.title}
                      </div>

                      {res.description && (
                        <p className="mt-1 text-xs text-brand-600 line-clamp-2 leading-relaxed">
                          {res.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-sand-200/80 flex items-center justify-between">
                      <span className="text-[11px] font-mono text-brand-400 truncate max-w-[150px]">
                        {res.url.replace(/^https?:\/\//, "")}
                      </span>
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded bg-brand-900 px-3 py-1 text-xs font-semibold text-white hover:bg-brand-700 transition shrink-0"
                      >
                        Mở ↗
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
