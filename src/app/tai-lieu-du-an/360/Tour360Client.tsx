"use client";

import { useState } from "react";
import Link from "next/link";
import { parseImages } from "@/lib/utils";

interface Tour360ClientProps {
  cityResource: any | null;
  projects: any[];
}

export default function Tour360Client({ cityResource, projects }: Tour360ClientProps) {
  const [search, setSearch] = useState("");

  const filteredProjects = projects.filter((p) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    const matchProjectName = p.name.toLowerCase().includes(term);
    const matchDeveloper = p.developer?.toLowerCase().includes(term);
    const matchResourceTitle = p.resources?.some((r: any) =>
      r.title.toLowerCase().includes(term)
    );
    return matchProjectName || matchDeveloper || matchResourceTitle;
  });

  return (
    <div className="mt-8 space-y-10">
      {/* 1. TOP FEATURED BANNER: TOÀN CẢNH QUY NHƠN CITY */}
      {cityResource && (
        <a
          href={cityResource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative block overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-xl transition hover:shadow-2xl md:p-8 border border-slate-800"
        >
          {/* Background Gradient Decorative circles */}
          <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-primary-600/30 blur-3xl group-hover:bg-primary-600/40 transition"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/20 px-3.5 py-1 text-xs font-bold text-amber-300 border border-amber-400/30">
                <span>🌐</span>
                <span>TOÀN CẢNH KHU VỰC QUY NHƠN</span>
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight text-white group-hover:text-amber-200 transition">
                {cityResource.title}
              </h2>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                {cityResource.description ||
                  "Khám phá góc nhìn thực tế ảo 360° toàn cảnh bờ biển, quy hoạch và không gian đô thị TP. Quy Nhơn từ trên cao."}
              </p>
            </div>

            <div className="shrink-0">
              <span className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-xs font-extrabold text-slate-950 shadow-md group-hover:bg-amber-300 transition transform group-hover:scale-105">
                <span>Trải nghiệm sa bàn 360°</span>
                <span className="text-base">↗</span>
              </span>
            </div>
          </div>
        </a>
      )}

      {/* 2. SEARCH & HEADER TOOLBAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h2 className="font-display text-xl font-extrabold text-dark">
            Dự án 360° Virtual Tour ({filteredProjects.length})
          </h2>
          <p className="text-xs text-muted font-medium mt-0.5">
            Chọn dự án để trải nghiệm sa bàn ảo và căn hộ mẫu 360°
          </p>
        </div>

        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Tìm dự án 360°..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input text-xs"
          />
        </div>
      </div>

      {/* 3. GALLERY GRID */}
      {filteredProjects.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-200 p-12 text-center text-muted text-sm bg-white">
          {search ? `Không tìm thấy dự án 360° phù hợp với từ khóa "${search}".` : "Chưa có dữ liệu 360° dự án."}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => {
            const projectImages = parseImages(project.images);
            const imageCover = project.thumbnail || projectImages[0] || null;
            const primaryResource = project.resources[0];

            if (!primaryResource) return null;

            return (
              <div
                key={project.id}
                className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-gray-100 bg-white p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl transition duration-300"
              >
                <div className="space-y-4">
                  {/* IMAGE CONTAINER WITH 360 BADGE */}
                  <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-slate-100">
                    {imageCover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imageCover}
                        alt={project.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-slate-900 text-white text-xs font-bold p-4 text-center">
                        🏢 {project.name}
                      </div>
                    )}

                    {/* OVERLAY BADGE */}
                    <div className="absolute left-3 top-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/90 backdrop-blur px-3 py-1 text-[10px] font-extrabold text-amber-300 shadow">
                        <span className="animate-pulse text-xs">🔄</span> 360° TOUR
                      </span>
                    </div>
                  </div>

                  {/* CONTENT */}
                  <div className="space-y-2">
                    <h3 className="font-display text-lg font-bold text-dark group-hover:text-primary-600 transition line-clamp-1">
                      {project.name}
                    </h3>

                    {project.developer && (
                      <div className="text-xs text-gray-500 font-medium">
                        Chủ đầu tư: <span className="font-semibold text-dark">{project.developer}</span>
                      </div>
                    )}

                    {/* All 360 Links under this project */}
                    <div className="space-y-2 pt-2">
                      {project.resources.map((res: any) => (
                        <a
                          key={res.id}
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between rounded-xl bg-surface p-2.5 text-xs text-dark border border-gray-100 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600 transition font-bold"
                        >
                          <span className="truncate mr-2">{res.title}</span>
                          <span className="shrink-0 text-primary-600 text-[11px]">Mở 360° ↗</span>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>

                {/* FOOTER ACTION */}
                <div className="pt-4 border-t border-gray-100 mt-4 flex items-center justify-between text-xs font-semibold text-gray-500">
                  <Link
                    href={`/listings?project=${project.slug}`}
                    className="hover:text-primary-600 hover:underline"
                  >
                    Xem sản phẩm →
                  </Link>
                  <span className="text-[11px] text-gray-400 font-mono">{project.resources.length} link 360°</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
