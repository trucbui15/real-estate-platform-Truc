"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { getOptimizedCloudinaryUrl } from "@/lib/cloudinaryImage";

interface ProjectItem {
  id: string;
  name: string;
  slug: string;
  developer?: string | null;
  description?: string | null;
  address?: string | null;
  thumbnail?: string | null;
  province?: { name: string } | null;
  district?: { name: string } | null;
  resources?: { id: string; title: string; url: string; description?: string | null }[];
}

interface WebsiteListClientProps {
  projects: ProjectItem[];
}

export default function WebsiteListClient({ projects }: WebsiteListClientProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    const q = searchQuery.toLowerCase().trim();
    return projects.filter((p) => {
      const nameMatch = p.name.toLowerCase().includes(q);
      const devMatch = p.developer ? p.developer.toLowerCase().includes(q) : false;
      const addrMatch = p.address ? p.address.toLowerCase().includes(q) : false;
      return nameMatch || devMatch || addrMatch;
    });
  }, [projects, searchQuery]);

  return (
    <div className="space-y-6">
      {/* SEARCH BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Tìm kiếm dự án hoặc chủ đầu tư..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition"
          />
          <span className="absolute left-3 top-2.5 text-xs text-slate-400">🔍</span>
        </div>

        <div className="text-xs font-semibold text-slate-500 shrink-0">
          Hiển thị: <strong className="text-slate-900">{filteredProjects.length}</strong> / {projects.length} dự án
        </div>
      </div>

      {/* PROJECT CARDS GRID */}
      {filteredProjects.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center text-slate-500 text-xs bg-white space-y-2">
          <div>🔍 Không tìm thấy dự án phù hợp với từ khóa &ldquo;{searchQuery}&rdquo;.</div>
          <button
            onClick={() => setSearchQuery("")}
            className="text-blue-600 font-bold hover:underline"
          >
            Bỏ tìm kiếm
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => {
            const locationStr =
              project.address ||
              [project.district?.name, project.province?.name].filter(Boolean).join(", ") ||
              "Quy Nhơn, Bình Định";

            // Filter valid external website links (starting with http/https and not matching internal route)
            const externalWebsites = (project.resources || []).filter(
              (res) => res.url && res.url.startsWith("http") && !res.url.includes(`/du-an/${project.slug}`)
            );

            return (
              <div
                key={project.id}
                className="group flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white overflow-hidden shadow-xs hover:shadow-md hover:border-amber-400 transition duration-300"
              >
                {/* THUMBNAIL IMAGE */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
                  {project.thumbnail ? (
                    <img
                      src={getOptimizedCloudinaryUrl(project.thumbnail, "CARD")}
                      srcSet={`${getOptimizedCloudinaryUrl(project.thumbnail, "THUMBNAIL")} 300w, ${getOptimizedCloudinaryUrl(project.thumbnail, "CARD")} 600w`}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
                      alt={project.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/logo.png";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-900 to-indigo-950 flex items-center justify-center p-4 text-center">
                      <span className="text-white font-bold text-sm">🏢 {project.name}</span>
                    </div>
                  )}
                  <div className="absolute top-3 left-3 bg-slate-950/75 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-full border border-white/20">
                    🏢 Dự án BĐS
                  </div>
                </div>

                {/* CONTENT */}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <h2 className="font-extrabold text-base text-slate-900 line-clamp-1 group-hover:text-blue-600 transition">
                      {project.name}
                    </h2>

                    {project.developer && (
                      <p className="text-xs text-slate-500 font-medium truncate">
                        Chủ đầu tư: <span className="font-bold text-slate-800">{project.developer}</span>
                      </p>
                    )}

                    <p className="text-xs text-slate-500 flex items-center gap-1 font-medium truncate pt-0.5">
                      <span>📍</span>
                      <span>{locationStr}</span>
                    </p>

                    {project.description && (
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 pt-1 font-normal">
                        {project.description}
                      </p>
                    )}
                  </div>

                  {/* CTAS */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    {/* PRIMARY CTA -> INTERNAL MICROSITE */}
                    <Link
                      href={`/du-an/${project.slug}`}
                      className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs py-3 rounded-xl shadow-xs transition flex items-center justify-center gap-2 min-h-[42px]"
                    >
                      <span>Xem website dự án</span>
                      <span>→</span>
                    </Link>

                    {/* SECONDARY EXTERNAL LINKS */}
                    {externalWebsites.map((res) => (
                      <a
                        key={res.id}
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-2 rounded-xl transition flex items-center justify-center gap-1.5"
                      >
                        <span>🔗</span>
                        <span className="truncate">Website tham khảo ({res.title})</span>
                        <span>↗</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
