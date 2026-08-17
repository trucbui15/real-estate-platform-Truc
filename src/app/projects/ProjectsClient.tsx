"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

interface ProjectItem {
  id: string;
  name: string;
  slug: string;
  developer?: string | null;
  address?: string | null;
  bannerImage?: string | null;
  inventoryCount: number;
  saleCount: number;
  rentCount: number;
}

interface ProjectsClientProps {
  projects: ProjectItem[];
}

const FALLBACK_PROJECT_IMAGES: Record<string, string> = {
  simona: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
  cadia: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80",
  ocean: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80",
  flc: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
  nhon: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
  richmond: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
  melody: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
  altara: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
  sailing: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
};

function getCoverPhoto(project: ProjectItem): string {
  if (project.bannerImage && project.bannerImage.length > 5 && !project.bannerImage.includes("placeholder")) {
    return project.bannerImage;
  }
  const nameLower = project.name.toLowerCase();
  for (const [key, url] of Object.entries(FALLBACK_PROJECT_IMAGES)) {
    if (nameLower.includes(key)) return url;
  }
  return "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80";
}

export default function ProjectsClient({ projects: initialProjects }: ProjectsClientProps) {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;
  const canEdit = role === "ADMIN" || role === "MANAGER" || role === "STAFF";

  const [projectsList, setProjectsList] = useState<ProjectItem[]>(initialProjects);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal Sửa dự án dành cho Quản trị viên
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    developer: "",
    address: "",
    thumbnail: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projectsList;
    const q = searchQuery.trim().toLowerCase();
    return projectsList.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.address && p.address.toLowerCase().includes(q)) ||
        (p.developer && p.developer.toLowerCase().includes(q))
    );
  }, [projectsList, searchQuery]);

  function openEditModal(e: React.MouseEvent, p: ProjectItem) {
    e.preventDefault();
    e.stopPropagation();
    setEditingProject(p);
    setEditForm({
      name: p.name,
      developer: p.developer || "",
      address: p.address || "",
      thumbnail: p.bannerImage || "",
    });
  }

  async function handleFileUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", files[0]);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        setEditForm((prev) => ({ ...prev, thumbnail: data.url }));
      } else {
        alert("Tải ảnh thất bại. Vui lòng thử lại!");
      }
    } catch (err) {
      alert("Lỗi tải tệp ảnh");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSaveProject(e: React.FormEvent) {
    e.preventDefault();
    if (!editingProject) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/projects/${editingProject.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name,
          developer: editForm.developer,
          address: editForm.address,
          thumbnail: editForm.thumbnail,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setProjectsList((prev) =>
          prev.map((p) =>
            p.id === editingProject.id
              ? {
                  ...p,
                  name: updated.name || editForm.name,
                  developer: updated.developer || editForm.developer,
                  address: updated.address || editForm.address,
                  bannerImage: editForm.thumbnail || p.bannerImage,
                }
              : p
          )
        );
        setEditingProject(null);
        alert("Đã cập nhật thông tin & hình ảnh dự án thành công!");
      } else {
        const err = await res.json();
        alert(err.error || "Không thể cập nhật dự án");
      }
    } catch (err) {
      alert("Lỗi kết nối máy chủ");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="container-page py-8 space-y-8">
      {/* 1. LUXURY HERO BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 p-8 sm:p-10 text-white shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-60 h-60 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-amber-300 backdrop-blur-md border border-white/10">
              <span>💎</span>
              <span>Bảng Hàng Bất Động Sản Quy Nhơn & Bình Định</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight font-display">
              Khám Phá Các Dự Án Trọng Điểm
            </h1>
            <p className="text-sm text-slate-300 font-medium leading-relaxed">
              Tra cứu nhanh thông tin dự án, mặt bằng căn hộ, tiến độ thanh toán và bảng hàng giá gốc từ Chủ đầu tư.
            </p>
          </div>

          {/* LUXURY SEARCH BAR */}
          <div className="relative w-full md:w-80 shrink-0">
            <input
              type="text"
              placeholder="Tìm dự án, CĐT, vị trí..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-3 text-sm rounded-2xl border border-white/20 bg-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:bg-slate-950/80 backdrop-blur-md transition shadow-inner"
            />
            <span className="absolute left-3.5 top-3.5 text-base text-slate-400">🔍</span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-3.5 text-xs font-bold text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. PROJECT CARDS GRID */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 space-y-3 shadow-2xs">
          <div className="text-4xl">🔍</div>
          <div className="font-bold text-slate-800 text-base">
            Không tìm thấy dự án phù hợp với từ khóa "{searchQuery}"
          </div>
          <button
            onClick={() => setSearchQuery("")}
            className="btn-outline text-xs py-2 px-5 rounded-xl font-bold cursor-pointer"
          >
            Xem tất cả dự án
          </button>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((p) => {
            const photoUrl = getCoverPhoto(p);
            const hasInventory = p.inventoryCount > 0;

            return (
              <div
                key={p.id}
                className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white shadow-2xs hover:shadow-lg hover:border-blue-300 transition-all duration-300 ease-out overflow-hidden"
              >
                <Link href={`/projects/${p.slug}`} className="block space-y-4">
                  {/* COVER IMAGE CONTAINER WITH GRADIENT OVERLAY & GLASS BADGES */}
                  <div className="relative w-full h-52 bg-slate-950 overflow-hidden">
                    <img
                      src={photoUrl}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent opacity-90" />

                    {/* TOP BADGES */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
                      {p.developer ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/80 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-white border border-white/10 shadow-xs">
                          🏢 {p.developer}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-600/90 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-white shadow-xs">
                          💎 Dự án cao cấp
                        </span>
                      )}

                      {canEdit && (
                        <button
                          onClick={(e) => openEditModal(e, p)}
                          className="inline-flex items-center gap-1 rounded-full bg-white/90 hover:bg-white text-slate-900 px-2.5 py-1 text-[11px] font-extrabold shadow-md backdrop-blur-md transition cursor-pointer border border-white"
                          title="Sửa hình ảnh & thông tin dự án"
                        >
                          ✏️ Sửa ảnh
                        </button>
                      )}
                    </div>

                    {/* BOTTOM OVERLAY INFO */}
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <div className="text-xs font-medium text-slate-200 flex items-center gap-1">
                        <span>📍</span>
                        <span className="truncate">{p.address || "Quy Nhơn, Bình Định"}</span>
                      </div>
                    </div>
                  </div>

                  {/* CARD BODY CONTENT */}
                  <div className="px-5 space-y-2.5">
                    <h2 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors duration-200 leading-snug font-display">
                      {p.name}
                    </h2>

                    {/* STATS BADGES */}
                    <div className="flex flex-wrap items-center gap-2 pt-0.5">
                      {p.inventoryCount > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-xl bg-indigo-50 border border-indigo-100 px-2.5 py-1 text-xs font-bold text-indigo-800">
                          📊 {p.inventoryCount} căn Bảng hàng
                        </span>
                      )}

                      {p.saleCount > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 border border-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
                          🏷️ {p.saleCount} rao bán
                        </span>
                      )}

                      {p.rentCount > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-xl bg-blue-50 border border-blue-100 px-2.5 py-1 text-xs font-bold text-blue-800">
                          🔑 {p.rentCount} cho thuê
                        </span>
                      )}

                      {!hasInventory && p.saleCount === 0 && p.rentCount === 0 && (
                        <span className="inline-flex items-center gap-1 rounded-xl bg-slate-100 border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-600">
                          ℹ️ Đang cập nhật bảng hàng
                        </span>
                      )}
                    </div>
                  </div>
                </Link>

                {/* PREMIUM CTA BUTTON */}
                <Link
                  href={`/projects/${p.slug}`}
                  className="p-4 mt-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs font-extrabold text-slate-700 hover:text-blue-600 transition-colors duration-200"
                >
                  <span className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                    {hasInventory ? "Xem Chi Tiết Bảng Hàng" : "Khám Phá Dự Án"}
                  </span>
                  <span className="text-base text-blue-600 transition-transform duration-300 group-hover:translate-x-1.5">
                    →
                  </span>
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL CẬP NHẬT ẢNH & THÔNG TIN DỰ ÁN (CHỈ DÀNH CHO BỘ PHẬN QUẢN TRỊ) */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-5 border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🖼️</span>
                <h3 className="text-lg font-bold text-slate-900">
                  Cập nhật ảnh & thông tin dự án
                </h3>
              </div>
              <button
                onClick={() => setEditingProject(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên dự án
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Chủ đầu tư (CĐT)
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Hưng Thịnh, Phát Đạt..."
                    value={editForm.developer}
                    onChange={(e) => setEditForm({ ...editForm, developer: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Vị trí (Địa chỉ)
                  </label>
                  <input
                    type="text"
                    placeholder="VD: TP. Quy Nhơn"
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Hình ảnh bìa dự án (URL ảnh hoặc Tải ảnh mới)
                </label>
                <div className="space-y-2">
                  <input
                    type="url"
                    placeholder="Dán link ảnh https://..."
                    value={editForm.thumbnail}
                    onChange={(e) => setEditForm({ ...editForm, thumbnail: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />

                  <div className="flex items-center gap-2">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition">
                      <span>📤 Tải ảnh từ máy tính</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e.target.files)}
                        className="hidden"
                      />
                    </label>
                    {isUploading && (
                      <span className="text-xs text-blue-600 font-bold animate-pulse">
                        Đang tải ảnh...
                      </span>
                    )}
                  </div>
                </div>

                {editForm.thumbnail && (
                  <div className="mt-2.5 relative w-full h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
                    <img
                      src={editForm.thumbnail}
                      alt="Xem trước ảnh bìa"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 rounded-xl bg-slate-100 transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSaving || isUploading}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#0284C7] hover:bg-blue-700 rounded-xl shadow-2xs transition disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
