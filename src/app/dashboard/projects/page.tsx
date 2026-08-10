"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { LABELS } from "@/lib/utils";

export default function DashboardProjectsPage() {
  const { data: session } = useSession();
  const [items, setItems] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"projects" | "resources">("projects");

  // State form dự án
  const [form, setForm] = useState({
    id: "",
    name: "",
    developer: "",
    address: "",
    description: "",
    isActive: true,
    featured: false,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // State quản lý tài liệu (ProjectResource)
  const [resourceForm, setResourceForm] = useState({
    id: "",
    projectId: "",
    type: "WEBSITE",
    title: "",
    url: "",
    description: "",
    isPublic: true,
    isActive: true,
    sortOrder: 0,
  });
  const [editingResourceId, setEditingResourceId] = useState<string | null>(null);
  const [resourceError, setResourceError] = useState("");
  const [resourceSuccess, setResourceSuccess] = useState("");
  const [resourceLoading, setResourceLoading] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState(false);

  // Filter tài liệu
  const [resourceFilter, setResourceFilter] = useState({
    search: "",
    projectId: "",
    type: "",
    isPublic: "",
    isActive: "",
  });

  const role = (session?.user as any)?.role;
  const canEdit = role === "ADMIN" || role === "MANAGER";

  async function loadProjects() {
    const res = await fetch("/api/projects");
    setItems(res.ok ? await res.json() : []);
  }

  async function loadResources() {
    const qs = new URLSearchParams();
    if (resourceFilter.search) qs.set("search", resourceFilter.search);
    if (resourceFilter.projectId) qs.set("projectId", resourceFilter.projectId);
    if (resourceFilter.type) qs.set("type", resourceFilter.type);
    if (resourceFilter.isPublic) qs.set("isPublic", resourceFilter.isPublic);
    if (resourceFilter.isActive) qs.set("isActive", resourceFilter.isActive);

    const res = await fetch(`/api/project-resources?${qs.toString()}`);
    setResources(res.ok ? await res.json() : []);
  }

  useEffect(() => {
    loadProjects();
    loadResources();
  }, []);

  useEffect(() => {
    loadResources();
  }, [resourceFilter]);

  function resetForm() {
    setForm({ id: "", name: "", developer: "", address: "", description: "", isActive: true, featured: false });
    setEditingId(null);
    setError("");
  }

  async function saveProject(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const url = editingId ? `/api/projects/${editingId}` : "/api/projects";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Có lỗi xảy ra");
      return;
    }

    setSuccess(editingId ? "Đã cập nhật dự án thành công!" : "Đã thêm dự án mới thành công!");
    setShowProjectModal(false);
    resetForm();
    loadProjects();
  }


  async function toggleStatus(item: any) {
    if (!canEdit) return;
    const res = await fetch(`/api/projects/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !item.isActive }),
    });
    if (res.ok) loadProjects();
  }

  async function toggleFeatured(item: any) {
    if (!canEdit) return;
    const res = await fetch(`/api/projects/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ featured: !item.featured }),
    });
    if (res.ok) loadProjects();
  }

  async function deleteProject(item: any) {
    if (!canEdit) return;
    if (item._count?.listings > 0) {
      alert(
        `Không thể xóa trực tiếp dự án đang có ${item._count.listings} tin đăng. Vui lòng chuyển các sản phẩm sang dự án khác hoặc chuyển trạng thái sang Tạm ngưng.`
      );
      return;
    }

    if (!confirm(`Bạn có chắc chắn muốn xóa dự án "${item.name}"?`)) return;

    const res = await fetch(`/api/projects/${item.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Không thể xóa dự án.");
      return;
    }
    loadProjects();
  }

  // Quản lý Resource Form Handlers
  function openAddResource(defaultProjectId?: string) {
    setResourceForm({
      id: "",
      projectId: defaultProjectId || (items[0]?.id || ""),
      type: "WEBSITE",
      title: "",
      url: "",
      description: "",
      isPublic: true,
      isActive: true,
      sortOrder: 0,
    });
    setEditingResourceId(null);
    setResourceError("");
    setResourceSuccess("");
    setShowResourceModal(true);
  }

  function startEditResource(resItem: any) {
    setResourceForm({
      id: resItem.id,
      projectId: resItem.projectId,
      type: resItem.type,
      title: resItem.title || "",
      url: resItem.url || "",
      description: resItem.description || "",
      isPublic: resItem.isPublic ?? true,
      isActive: resItem.isActive ?? true,
      sortOrder: resItem.sortOrder ?? 0,
    });
    setEditingResourceId(resItem.id);
    setResourceError("");
    setResourceSuccess("");
    setShowResourceModal(true);
  }

  async function saveResource(e: React.FormEvent) {
    e.preventDefault();
    setResourceError("");
    setResourceSuccess("");

    if (!resourceForm.title.trim()) {
      setResourceError("Vui lòng nhập tên tài liệu.");
      return;
    }
    if (!resourceForm.url.trim() || !/^https?:\/\/.+/i.test(resourceForm.url.trim())) {
      setResourceError("Vui lòng nhập đường dẫn hợp lệ (bắt đầu bằng http:// hoặc https://).");
      return;
    }
    if (!resourceForm.projectId) {
      setResourceError("Vui lòng chọn dự án.");
      return;
    }

    setResourceLoading(true);
    const url = editingResourceId ? `/api/project-resources/${editingResourceId}` : "/api/project-resources";
    const method = editingResourceId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(resourceForm),
    });

    setResourceLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setResourceError(data.error || "Có lỗi xảy ra khi lưu tài liệu.");
      return;
    }

    setResourceSuccess(editingResourceId ? "Đã cập nhật tài liệu thành công!" : "Đã thêm tài liệu mới!");
    setTimeout(() => {
      setShowResourceModal(false);
    }, 1000);
    loadResources();
  }

  async function toggleResourcePublic(resItem: any) {
    if (!canEdit) return;
    const res = await fetch(`/api/project-resources/${resItem.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublic: !resItem.isPublic }),
    });
    if (res.ok) loadResources();
  }

  async function toggleResourceActive(resItem: any) {
    if (!canEdit) return;
    const res = await fetch(`/api/project-resources/${resItem.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !resItem.isActive }),
    });
    if (res.ok) loadResources();
  }

  async function deleteResource(resItem: any) {
    if (!canEdit) return;
    if (!confirm(`Bạn có chắc muốn xóa tài liệu "${resItem.title}"?`)) return;

    const res = await fetch(`/api/project-resources/${resItem.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Không thể xóa tài liệu.");
      return;
    }
    loadResources();
  }

  // Project modal state
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projectSearch, setProjectSearch] = useState("");

  function openAddProject() {
    resetForm();
    setSuccess("");
    setError("");
    setShowProjectModal(true);
  }

  function startEdit(item: any) {
    setForm({
      id: item.id,
      name: item.name || "",
      developer: item.developer || "",
      address: item.address || "",
      description: item.description || "",
      isActive: item.isActive ?? true,
      featured: item.featured ?? false,
    });
    setEditingId(item.id);
    setError("");
    setSuccess("");
    setShowProjectModal(true);
  }

  const filteredProjects = items.filter((p) => {
    if (!projectSearch.trim()) return true;
    const q = projectSearch.toLowerCase().trim();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.developer?.toLowerCase().includes(q) ||
      p.address?.toLowerCase().includes(q) ||
      p.slug?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* HEADER ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
        <div>
          <h1 className="text-[22px] font-bold text-[#0F172A]">Quản lý dự án & Tài liệu</h1>
          <p className="mt-1 text-[14px] text-[#64748B]">
            Quản lý danh sách dự án, cập nhật trạng thái và tài nguyên (Website, Link 360°, Driver TT, Bảng giá...)
          </p>
        </div>

        {canEdit && (
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => openAddResource()}
              className="btn-outline text-[14px] flex items-center gap-1.5"
            >
              <span>+</span> Thêm tài liệu
            </button>
            <button
              onClick={openAddProject}
              className="btn-primary text-[14px] flex items-center gap-1.5"
            >
              <span>+</span> Thêm dự án mới
            </button>
          </div>
        )}
      </div>

      {/* NOTIFICATION NOTICES */}
      {success && (
        <div className="rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] p-4 text-[14px] font-medium text-[#065F46] flex justify-between items-center shadow-sm">
          <span>✓ {success}</span>
          <button onClick={() => setSuccess("")} className="text-[#065F46] hover:underline font-bold">✕</button>
        </div>
      )}

      {/* TABS HEADER */}
      <div className="flex border-b border-[#E2E8F0] gap-2">
        <button
          onClick={() => setActiveTab("projects")}
          className={`px-5 py-3 text-[14px] font-bold border-b-2 transition ${
            activeTab === "projects"
              ? "border-[#4F46E5] text-[#4F46E5] bg-[#EEF2FF]/60"
              : "border-transparent text-[#64748B] hover:text-[#0F172A]"
          }`}
        >
          Danh sách Dự án ({items.length})
        </button>
        <button
          onClick={() => setActiveTab("resources")}
          className={`px-5 py-3 text-[14px] font-bold border-b-2 transition ${
            activeTab === "resources"
              ? "border-[#4F46E5] text-[#4F46E5] bg-[#EEF2FF]/60"
              : "border-transparent text-[#64748B] hover:text-[#0F172A]"
          }`}
        >
          Tài liệu Dự án ({resources.length})
        </button>
      </div>

      {/* TAB 1: DỰ ÁN */}
      {activeTab === "projects" && (
        <div className="space-y-4">
          {/* SEARCH CONTROL BAR */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#E2E8F0] shadow-sm">
            <div className="relative flex-1 w-full max-w-md">
              <input
                type="text"
                value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
                placeholder="Tìm dự án theo tên, chủ đầu tư, địa chỉ..."
                className="input !h-[42px] pl-9"
              />
              <svg className="w-4 h-4 text-[#94A3B8] absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <span className="text-[13px] font-semibold text-[#64748B] bg-[#F8FAFC] px-3 py-2 rounded-xl border border-[#E2E8F0]">
              Hiển thị: {filteredProjects.length} / {items.length} dự án
            </span>
          </div>

          {/* FULL-WIDTH PROJECTS LIST CARDS */}
          <div className="space-y-3">
            {filteredProjects.length === 0 ? (
              <div className="card p-8 text-center text-[14px] text-[#94A3B8]">
                Không tìm thấy dự án nào phù hợp.
              </div>
            ) : (
              filteredProjects.map((p) => (
                <div
                  key={p.id}
                  className="card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#E2E8F0] hover:border-[#CBD5E1] transition shadow-sm bg-white"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-bold text-[#0F172A] text-[16px]">{p.name}</span>
                      {p.featured && (
                        <span className="rounded-lg bg-[#FEF3C7] border border-[#FDE68A] px-2.5 py-0.5 text-[11px] font-bold text-[#B45309]">
                          ⭐ Nổi bật
                        </span>
                      )}
                      <span
                        className={`rounded-lg px-2.5 py-0.5 text-[11px] font-bold ${
                          p.isActive
                            ? "bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46]"
                            : "bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B]"
                        }`}
                      >
                        {p.isActive ? "● Hoạt động" : "🔒 Tạm ngưng"}
                      </span>
                    </div>

                    {p.developer && (
                      <div className="text-[13px] text-[#64748B]">
                        Chủ đầu tư: <span className="font-medium text-[#0F172A]">{p.developer}</span>
                      </div>
                    )}
                    {p.address && <div className="text-[13px] text-[#64748B]">📍 {p.address}</div>}
                    
                    <div className="text-[13px] font-medium text-[#4F46E5] pt-1 flex flex-wrap items-center gap-4">
                      <span>Slug: <code className="font-mono text-[12px] bg-[#F1F5F9] px-1.5 py-0.5 rounded text-[#334155]">{p.slug}</code></span>
                      <Link href={`/listings?project=${p.slug}`} target="_blank" className="hover:underline flex items-center gap-1 font-semibold">
                        {p._count?.listings ?? 0} bất động sản →
                      </Link>
                    </div>
                  </div>

                  {canEdit && (
                    <div className="flex flex-wrap items-center gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0">
                      <button
                        onClick={() => openAddResource(p.id)}
                        className="text-[13px] font-semibold px-3 py-1.5 rounded-xl bg-[#EEF2FF] text-[#4F46E5] border border-[#C7D2FE] hover:bg-[#4F46E5] hover:text-white transition"
                        title="Thêm tài liệu cho dự án này"
                      >
                        + Thêm tài liệu
                      </button>
                      <button
                        onClick={() => toggleFeatured(p)}
                        className={`text-[13px] font-semibold px-3 py-1.5 rounded-xl border transition ${
                          p.featured
                            ? "border-[#FDE68A] bg-[#FEF3C7] text-[#B45309]"
                            : "border-[#E2E8F0] bg-white text-[#64748B] hover:bg-[#F8FAFC]"
                        }`}
                      >
                        {p.featured ? "Bỏ nổi bật" : "⭐ Nổi bật"}
                      </button>
                      <button
                        onClick={() => toggleStatus(p)}
                        className={`text-[13px] font-semibold px-3 py-1.5 rounded-xl border transition ${
                          p.isActive
                            ? "border-[#FDE68A] bg-white text-[#D97706] hover:bg-[#FEF3C7]"
                            : "border-[#A7F3D0] bg-white text-[#10B981] hover:bg-[#ECFDF5]"
                        }`}
                      >
                        {p.isActive ? "Tạm ngưng" : "Kích hoạt"}
                      </button>
                      <button
                        onClick={() => startEdit(p)}
                        className="btn-primary text-[13px] px-3.5 py-1.5"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => deleteProject(p)}
                        className="text-[13px] font-semibold text-[#EF4444] hover:underline px-2"
                      >
                        Xóa
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* PROJECT EDIT / CREATE MODAL DIALOG */}
      {showProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-3">
              <h3 className="text-[18px] font-bold text-[#0F172A]">
                {editingId ? "Chỉnh sửa dự án" : "+ Thêm dự án mới"}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowProjectModal(false);
                  resetForm();
                }}
                className="text-[#64748B] hover:text-[#0F172A] text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {error && <div className="rounded-xl bg-[#FEF2F2] border border-[#FCA5A5] p-3.5 text-[13px] text-[#991B1B] font-medium">{error}</div>}

            <form onSubmit={saveProject} className="space-y-4">
              <div>
                <label className="label">Tên dự án *</label>
                <input
                  className="input"
                  placeholder="VD: Simona Heights Quy Nhơn"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Chủ đầu tư</label>
                <input
                  className="input"
                  placeholder="VD: Hưng Thịnh Land / Phú Sơn Thuận"
                  value={form.developer}
                  onChange={(e) => setForm({ ...form, developer: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Địa chỉ</label>
                <input
                  className="input"
                  placeholder="VD: 145 Trần Hưng Đạo, Quy Nhơn"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Mô tả dự án</label>
                <textarea
                  className="input"
                  placeholder="Thông tin quy mô, tiện ích dự án..."
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 text-[14px] font-medium text-[#0F172A] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-[#4F46E5]"
                  />
                  Đang hoạt động
                </label>

                <label className="flex items-center gap-2 text-[14px] font-medium text-[#0F172A] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                    className="w-4 h-4 rounded text-[#4F46E5]"
                  />
                  Dự án nổi bật ⭐
                </label>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowProjectModal(false);
                    resetForm();
                  }}
                  className="btn-outline flex-1 text-[14px]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1 text-[14px]"
                >
                  {loading ? "Đang lưu..." : editingId ? "Cập nhật dự án" : "Thêm dự án mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* TAB 2: QUẢN LÝ TÀI LIỆU DỰ ÁN */}
      {activeTab === "resources" && (
        <div className="mt-6 space-y-4">
          {/* Thanh Filter Tài liệu */}
          <div className="card p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5 text-xs">
            <div>
              <label className="label text-[11px]">Tìm kiếm tài liệu</label>
              <input
                className="input text-xs"
                placeholder="Tìm tên, dự án..."
                value={resourceFilter.search}
                onChange={(e) => setResourceFilter({ ...resourceFilter, search: e.target.value })}
              />
            </div>

            <div>
              <label className="label text-[11px]">Dự án</label>
              <select
                className="input text-xs"
                value={resourceFilter.projectId}
                onChange={(e) => setResourceFilter({ ...resourceFilter, projectId: e.target.value })}
              >
                <option value="">-- Tất cả Dự án --</option>
                {items.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label text-[11px]">Loại tài liệu</label>
              <select
                className="input text-xs"
                value={resourceFilter.type}
                onChange={(e) => setResourceFilter({ ...resourceFilter, type: e.target.value })}
              >
                <option value="">-- Tất cả Loại --</option>
                {Object.entries(LABELS.projectResourceType).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label text-[11px]">Quyền xem</label>
              <select
                className="input text-xs"
                value={resourceFilter.isPublic}
                onChange={(e) => setResourceFilter({ ...resourceFilter, isPublic: e.target.value })}
              >
                <option value="">-- Tất cả --</option>
                <option value="true">Công khai (Public)</option>
                <option value="false">Nội bộ (Private)</option>
              </select>
            </div>

            <div>
              <label className="label text-[11px]">Trạng thái</label>
              <select
                className="input text-xs"
                value={resourceFilter.isActive}
                onChange={(e) => setResourceFilter({ ...resourceFilter, isActive: e.target.value })}
              >
                <option value="">-- Tất cả --</option>
                <option value="true">Hoạt động</option>
                <option value="false">Tạm ẩn</option>
              </select>
            </div>
          </div>

          {/* Table hiển thị danh sách Tài liệu */}
          <div className="overflow-x-auto rounded-lg border border-sand-100 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-sand-100 text-xs uppercase text-brand-700">
                <tr>
                  <th className="px-4 py-3">Loại</th>
                  <th className="px-4 py-3">Tên tài liệu</th>
                  <th className="px-4 py-3">Dự án</th>
                  <th className="px-4 py-3">Đường dẫn (URL)</th>
                  <th className="px-4 py-3">Phạm vi</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3">Thứ tự</th>
                  <th className="px-4 py-3">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {resources.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-brand-300">
                      Chưa có tài liệu dự án nào phù hợp với bộ lọc.
                    </td>
                  </tr>
                ) : (
                  resources.map((resItem) => (
                    <tr key={resItem.id} className="border-t border-sand-100 text-xs hover:bg-sand-50">
                      <td className="px-4 py-3 font-semibold text-brand-700 shrink-0">
                        <span className="rounded bg-brand-50 px-2 py-1 text-[11px] text-brand-700 border border-brand-200">
                          {LABELS.projectResourceType[resItem.type as keyof typeof LABELS.projectResourceType] || resItem.type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-brand-900">{resItem.title}</div>
                        {resItem.description && (
                          <div className="text-[11px] text-brand-400 mt-0.5">{resItem.description}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium text-brand-600">
                        {resItem.project?.name || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={resItem.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-500 hover:underline max-w-[180px] truncate block font-mono text-[11px]"
                          title={resItem.url}
                        >
                          🔗 {resItem.url}
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            resItem.isPublic ? "bg-emerald-100 text-emerald-800" : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {resItem.isPublic ? "Công khai" : "Nội bộ 🔒"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            resItem.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {resItem.isActive ? "Hoạt động" : "Tạm ẩn"}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono">{resItem.sortOrder}</td>
                      <td className="px-4 py-3">
                        {canEdit && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleResourcePublic(resItem)}
                              className="text-xs text-brand-500 hover:underline"
                              title="Thay đổi quyền xem công khai / nội bộ"
                            >
                              {resItem.isPublic ? "Khóa nội bộ" : "Công khai"}
                            </button>
                            <button
                              onClick={() => toggleResourceActive(resItem)}
                              className="text-xs text-brand-600 hover:underline"
                            >
                              {resItem.isActive ? "Ẩn" : "Hiện"}
                            </button>
                            <button
                              onClick={() => startEditResource(resItem)}
                              className="text-xs font-semibold text-brand-700 hover:underline"
                            >
                              Sửa
                            </button>
                            <button
                              onClick={() => deleteResource(resItem)}
                              className="text-xs text-red-600 hover:underline"
                            >
                              Xóa
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL THÊM / SỬA TÀI LIỆU DỰ ÁN */}
      {showResourceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-900/60 p-4 backdrop-blur-sm">
          <div className="card w-full max-w-lg p-6 space-y-4 bg-white shadow-xl animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b pb-3 font-display text-lg font-bold text-brand-900">
              <span>{editingResourceId ? "Chỉnh sửa tài liệu dự án" : "+ Thêm tài liệu dự án mới"}</span>
              <button
                type="button"
                onClick={() => setShowResourceModal(false)}
                className="text-brand-400 hover:text-brand-900 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {resourceError && (
              <div className="rounded bg-red-50 p-3 text-xs text-red-600 border border-red-200">
                {resourceError}
              </div>
            )}
            {resourceSuccess && (
              <div className="rounded bg-green-50 p-3 text-xs text-green-700 border border-green-200">
                {resourceSuccess}
              </div>
            )}

            <form onSubmit={saveResource} className="space-y-3.5 text-xs">
              <div>
                <label className="label">Thuộc Dự án *</label>
                <select
                  className="input"
                  required
                  value={resourceForm.projectId}
                  onChange={(e) => setResourceForm({ ...resourceForm, projectId: e.target.value })}
                >
                  <option value="">-- Chọn dự án --</option>
                  {items.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Loại tài liệu *</label>
                <select
                  className="input"
                  required
                  value={resourceForm.type}
                  onChange={(e) => setResourceForm({ ...resourceForm, type: e.target.value })}
                >
                  {Object.entries(LABELS.projectResourceType).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v} ({k})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Tên tài liệu *</label>
                <input
                  className="input"
                  placeholder="VD: Website Simona Heights / Căn mẫu 2PN 360°"
                  required
                  value={resourceForm.title}
                  onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Đường dẫn thực tế (URL) *</label>
                <input
                  className="input font-mono"
                  placeholder="https://..."
                  required
                  value={resourceForm.url}
                  onChange={(e) => setResourceForm({ ...resourceForm, url: e.target.value })}
                />
                <p className="text-[11px] text-brand-400 mt-1">Bắt buộc bắt đầu bằng http:// hoặc https://</p>
              </div>

              <div>
                <label className="label">Mô tả ngắn (Optional)</label>
                <textarea
                  className="input"
                  placeholder="Ghi chú chi tiết về tài liệu..."
                  rows={2}
                  value={resourceForm.description}
                  onChange={(e) => setResourceForm({ ...resourceForm, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="label">Thứ tự hiển thị</label>
                  <input
                    type="number"
                    min={0}
                    className="input"
                    value={resourceForm.sortOrder}
                    onChange={(e) => setResourceForm({ ...resourceForm, sortOrder: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-xs font-semibold text-brand-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={resourceForm.isPublic}
                      onChange={(e) => setResourceForm({ ...resourceForm, isPublic: e.target.checked })}
                      className="rounded text-brand-500"
                    />
                    Công khai (Public)
                  </label>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-xs font-semibold text-brand-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={resourceForm.isActive}
                      onChange={(e) => setResourceForm({ ...resourceForm, isActive: e.target.checked })}
                      className="rounded text-brand-500"
                    />
                    Hoạt động
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowResourceModal(false)}
                  className="btn-secondary text-xs px-4 py-2"
                >
                  Hủy
                </button>
                <button disabled={resourceLoading} className="btn-primary text-xs px-5 py-2">
                  {resourceLoading ? "Đang lưu..." : editingResourceId ? "Cập nhật tài liệu" : "Lưu tài liệu mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


