"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { parseImages, getProjectCoverImage } from "@/lib/utils";
import { getOptimizedCloudinaryUrl } from "@/lib/cloudinaryImage";
import ProjectImageEditorModal from "@/components/ProjectImageEditorModal";

interface ProjectOverviewListClientProps {
  projects: any[];
  canEdit: boolean;
}

export default function ProjectOverviewListClient({
  projects,
  canEdit,
}: ProjectOverviewListClientProps) {
  const router = useRouter();
  const [editingProject, setEditingProject] = useState<any | null>(null);

  if (projects.length === 0) {
    return (
      <div className="card-glass p-12 text-center text-sm text-gray-400">
        Chưa có dự án nào trong hệ thống.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* MODAL CẬP NHẬT ẢNH DỰ ÁN CHO ADMIN/MANAGER */}
      {canEdit && (
        <ProjectImageEditorModal
          project={editingProject}
          isOpen={Boolean(editingProject)}
          onClose={() => setEditingProject(null)}
        />
      )}

      {projects.map((project) => {
        const imageCover = getProjectCoverImage(project);
        const validResources = project.resources.filter(
          (res: any) => res.url && res.url.trim() !== ""
        );
        const nativeRoute = `/tai-lieu-du-an/tong-thong-tin/${project.slug}`;

        return (
          <div
            key={project.id}
            onClick={() => router.push(nativeRoute)}
            className="group card-glass p-6 md:p-8 rounded-3xl border border-gray-100 shadow-glass space-y-5 transition-all hover:shadow-xl hover:-translate-y-0.5 relative cursor-pointer"
          >
            <div className="flex flex-col md:flex-row gap-6">
              {/* Ảnh đại diện dự án */}
              <div className="relative aspect-[16/10] w-full md:w-72 shrink-0 overflow-hidden rounded-2xl bg-slate-50 border border-slate-200">
                <div className="block w-full h-full">
                  {imageCover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={getOptimizedCloudinaryUrl(imageCover, "CARD")}
                      srcSet={`${getOptimizedCloudinaryUrl(imageCover, "THUMBNAIL")} 300w, ${getOptimizedCloudinaryUrl(imageCover, "CARD")} 600w`}
                      sizes="(max-width: 768px) 100vw, 300px"
                      alt={project.name}
                      loading="lazy"
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
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
                </div>

                {project.featured && (
                  <span className="absolute left-3 top-3 rounded-full bg-amber-400 px-3 py-0.5 text-[10px] font-extrabold text-slate-950 uppercase shadow pointer-events-none">
                    ★ NỔI BẬT
                  </span>
                )}

                {/* NÚT CHỈNH ẢNH DÀNH CHO ADMIN / MANAGER */}
                {canEdit && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingProject(project);
                    }}
                    className="absolute right-2.5 top-2.5 bg-slate-900/85 hover:bg-sky-600 text-white font-bold text-[11px] px-2.5 py-1 rounded-xl shadow-lg transition backdrop-blur flex items-center gap-1 z-10 cursor-pointer"
                    title="Chỉnh sửa ảnh đại diện dự án"
                  >
                    <span>📷</span>
                    <span>Sửa ảnh</span>
                  </button>
                )}
              </div>

              {/* Nội dung thông tin dự án */}
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display text-xl font-extrabold text-dark group-hover:text-primary-600 transition">
                      {project.name}
                    </h3>
                    {project.listings.length > 0 && (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        {project.listings.length} căn đang rao
                      </span>
                    )}
                  </div>

                  {project.address && (
                    <div className="mt-1 text-xs text-gray-500 font-semibold flex items-center gap-1">
                      <span>📍</span>
                      <span>{project.address}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50/80 p-4 rounded-2xl border border-gray-100">
                  <div>
                    <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                      Chủ đầu tư:
                    </span>
                    <div className="font-bold text-dark mt-0.5">
                      {project.developer || "Minh Dũng Land"}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                      Khu vực:
                    </span>
                    <div className="font-bold text-dark mt-0.5">
                      {[project.district?.name, project.province?.name]
                        .filter(Boolean)
                        .join(", ") || "Quy Nhơn"}
                    </div>
                  </div>
                </div>

                {project.description && (
                  <p className="text-xs text-gray-600 leading-relaxed font-medium line-clamp-2">
                    {project.description}
                  </p>
                )}

                {/* RESOURCE SUMMARY */}
                {validResources.length > 0 && (
                  <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center gap-2">
                    {validResources.slice(0, 4).map((res: any) => (
                      <a
                        key={res.id}
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-2.5 py-1 text-[11px] font-bold text-gray-700 hover:bg-primary-600 hover:text-white transition"
                      >
                        <span>🔗 {res.title}</span>
                        <span className="text-[9px]">↗</span>
                      </a>
                    ))}
                    {validResources.length > 4 && (
                      <span className="text-[11px] font-bold text-gray-400">
                        +{validResources.length - 4} tài liệu
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
