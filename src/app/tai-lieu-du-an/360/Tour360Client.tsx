"use client";

import { useState } from "react";
import Link from "next/link";
import { parseImages, getProjectCoverImage } from "@/lib/utils";
import ProjectImageEditorModal from "@/components/ProjectImageEditorModal";

interface Tour360ClientProps {
  cityResource: any | null;
  projects: any[];
  canEdit?: boolean;
}

export default function Tour360Client({ cityResource, projects, canEdit = false }: Tour360ClientProps) {
  const [search, setSearch] = useState("");
  const [editingProject, setEditingProject] = useState<any | null>(null);

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
      {/* MODAL CẬP NHẬT ẢNH DỰ ÁN CHO ADMIN/MANAGER */}
      {canEdit && (
        <ProjectImageEditorModal
          project={editingProject}
          isOpen={Boolean(editingProject)}
          onClose={() => setEditingProject(null)}
        />
      )}

      {/* 1. TOP FEATURED BANNER: TOÀN CẢNH QUY NHƠN CITY */}
      {cityResource && (
        <a
          href={cityResource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative block overflow-hidden rounded-3xl p-6 text-white shadow-xl transition hover:shadow-2xl md:p-8 border border-white/30"
        >
          {/* Full Brightness Background Image - NO DARK OVERLAY */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cityResource.thumbnail || "/quynhon_panorama_360_banner.jpg"}
              alt="Toàn cảnh 360° Quy Nhơn"
              className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
            />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl bg-slate-950/40 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/20 shadow-lg">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-3.5 py-1 text-xs font-extrabold text-slate-950 shadow-sm">
                <span>🌐</span>
                <span>TOÀN CẢNH KHU VỰC QUY NHƠN</span>
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight text-white drop-shadow-md">
                {cityResource.title}
              </h2>
              <p className="text-xs md:text-sm text-slate-100 leading-relaxed font-medium drop-shadow-sm">
                {cityResource.description ||
                  "Khám phá góc nhìn thực tế ảo 360° toàn cảnh bờ biển, quy hoạch và không gian đô thị TP. Quy Nhơn từ trên cao."}
              </p>
            </div>

            <div className="shrink-0">
              <span className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 py-3.5 text-xs font-extrabold text-slate-950 shadow-xl group-hover:bg-amber-300 transition transform group-hover:scale-105 border border-amber-300">
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
            const imageCover = getProjectCoverImage(project);
            const primaryResource = project.resources[0];

            if (!primaryResource) return null;

            return (
              <div
                key={project.id}
                className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-gray-100 bg-white p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl transition duration-300 relative"
              >
                <div className="space-y-4">
                  {/* IMAGE CONTAINER WITH 360 BADGE */}
                  <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-slate-50 border border-slate-100">
                    {imageCover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imageCover}
                        alt={project.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/logo.png";
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full p-4 text-center bg-slate-50 text-slate-400">
                        <svg className="w-10 h-10 stroke-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span className="text-xs font-bold text-slate-700 mt-1">{project.name}</span>
                        <span className="text-[11px] text-slate-400">Chưa tải ảnh đại diện</span>
                      </div>
                    )}

                    {/* OVERLAY BADGE 360° */}
                    <div className="absolute left-3 top-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/90 backdrop-blur px-3 py-1 text-[10px] font-extrabold text-amber-300 shadow">
                        <span className="animate-pulse text-xs">🔄</span> 360° TOUR
                      </span>
                    </div>

                    {/* NÚT CHỈNH ẢNH DÀNH CHO ADMIN / MANAGER */}
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => setEditingProject(project)}
                        className="absolute right-2.5 top-2.5 bg-slate-900/85 hover:bg-sky-600 text-white font-bold text-[11px] px-2.5 py-1 rounded-xl shadow-lg transition backdrop-blur flex items-center gap-1 z-10 cursor-pointer"
                        title="Chỉnh sửa ảnh đại diện dự án"
                      >
                        <span>📷</span>
                        <span>Sửa ảnh</span>
                      </button>
                    )}
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
