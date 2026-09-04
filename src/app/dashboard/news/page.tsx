"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardNewsListPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "DRAFT" | "PUBLISHED">("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadNews() {
    setLoading(true);
    try {
      const res = await fetch("/api/news?all=1", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (e) {
      console.error("Lỗi lấy danh sách bài viết:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (session) loadNews();
  }, [session]);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Bạn có chắc chắn muốn xóa bài viết "${title}"?`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/news/${id}`, { method: "DELETE" });
      if (res.ok) {
        setItems((prev) => prev.filter((item) => item.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || "Không thể xóa bài viết");
      }
    } catch (e) {
      alert("Lỗi kết nối máy chủ");
    } finally {
      setDeletingId(null);
    }
  }

  const categoriesList = Array.from(
    new Set(items.map((i) => i.category).filter(Boolean))
  );

  const filteredItems = items.filter((item) => {
    // 1. Status Filter
    if (statusFilter === "DRAFT" && item.published) return false;
    if (statusFilter === "PUBLISHED" && !item.published) return false;

    // 2. Category Filter
    if (categoryFilter !== "ALL" && item.category !== categoryFilter) return false;

    // 3. Search Keyword
    if (search.trim()) {
      const kw = search.toLowerCase().trim();
      const matchTitle = (item.title || "").toLowerCase().includes(kw);
      const matchSummary = (item.summary || "").toLowerCase().includes(kw);
      const matchSlug = (item.slug || "").toLowerCase().includes(kw);
      return matchTitle || matchSummary || matchSlug;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* TOP HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="font-extrabold text-xl md:text-2xl text-slate-900">
            📰 Quản Lý Bài Viết Tin Tức
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Quản lý, tìm kiếm và xuất bản các bài viết tin tức, quy hoạch, tư vấn BĐS Quy Nhơn
          </p>
        </div>

        <Link
          href="/dashboard/news/new"
          className="btn-primary text-xs font-bold px-5 py-2.5 shadow-md flex items-center gap-1.5 shrink-0"
        >
          <span>➕</span>
          <span>Viết bài mới</span>
        </Link>
      </div>

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="card p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* SEARCH INPUT */}
          <div className="w-full md:w-64">
            <input
              type="text"
              placeholder="Tìm kiếm bài viết..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input text-xs"
            />
          </div>

          {/* STATUS FILTER */}
          <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-1 rounded-lg transition ${
                statusFilter === "ALL"
                  ? "bg-white text-slate-900 shadow-2xs font-extrabold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Tất cả ({items.length})
            </button>
            <button
              onClick={() => setStatusFilter("PUBLISHED")}
              className={`px-3 py-1 rounded-lg transition ${
                statusFilter === "PUBLISHED"
                  ? "bg-white text-emerald-700 shadow-2xs font-extrabold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              🟢 Đã xuất bản ({items.filter((i) => i.published).length})
            </button>
            <button
              onClick={() => setStatusFilter("DRAFT")}
              className={`px-3 py-1 rounded-lg transition ${
                statusFilter === "DRAFT"
                  ? "bg-white text-amber-700 shadow-2xs font-extrabold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              🟡 Bản nháp ({items.filter((i) => !i.published).length})
            </button>
          </div>

          {/* CATEGORY FILTER */}
          {categoriesList.length > 0 && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input text-xs font-semibold w-auto cursor-pointer"
            >
              <option value="ALL">Tất cả danh mục</option>
              {categoriesList.map((cat: any) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          )}
        </div>

        <button
          onClick={loadNews}
          className="text-xs font-bold text-slate-600 hover:text-sky-600 flex items-center gap-1 cursor-pointer shrink-0"
        >
          <span>🔄</span>
          <span>Làm mới</span>
        </button>
      </div>

      {/* ARTICLES DATA TABLE */}
      {loading ? (
        <div className="card p-12 text-center text-xs font-bold text-slate-400">
          ⏳ Đang tải danh sách bài viết...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="card p-12 text-center text-xs font-bold text-slate-400 bg-white">
          Chưa có bài viết nào phù hợp với bộ lọc.
        </div>
      ) : (
        <div className="card p-0 overflow-hidden bg-white shadow-xs border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Ảnh</th>
                  <th className="p-3.5">Tiêu đề bài viết</th>
                  <th className="p-3.5">Danh mục</th>
                  <th className="p-3.5">Tác giả</th>
                  <th className="p-3.5">Trạng thái</th>
                  <th className="p-3.5">Ngày cập nhật</th>
                  <th className="p-3.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    {/* THUMBNAIL */}
                    <td className="p-3">
                      <div className="w-14 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                        {item.thumbnail ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.thumbnail}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/logo.png";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400 font-bold">
                            No img
                          </div>
                        )}
                      </div>
                    </td>

                    {/* TITLE */}
                    <td className="p-3 max-w-xs">
                      <Link
                        href={`/dashboard/news/${item.id}`}
                        className="font-bold text-slate-900 hover:text-sky-600 line-clamp-2 leading-snug"
                      >
                        {item.title}
                      </Link>
                      <div className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
                        /news/{item.slug}
                      </div>
                    </td>

                    {/* CATEGORY */}
                    <td className="p-3">
                      {item.category ? (
                        <span className="bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-lg text-[11px] border border-slate-200">
                          {item.category}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* AUTHOR */}
                    <td className="p-3 font-semibold text-slate-700">
                      {item.author?.name || "Minh Dũng Land"}
                    </td>

                    {/* STATUS */}
                    <td className="p-3">
                      <span
                        className={`font-extrabold px-2.5 py-1 rounded-full text-[10px] border ${
                          item.published
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {item.published ? "🟢 Đã xuất bản" : "🟡 Bản nháp"}
                      </span>
                    </td>

                    {/* UPDATED AT / PUBLISHED AT */}
                    <td className="p-3 text-slate-500 font-mono text-[11px]">
                      {new Date(item.updatedAt).toLocaleDateString("vi-VN")}
                    </td>

                    {/* ACTIONS */}
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {item.published && (
                          <a
                            href={`/news/${item.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px]"
                            title="Xem bài viết public"
                          >
                            👁️ Xem
                          </a>
                        )}
                        <Link
                          href={`/dashboard/news/${item.id}`}
                          className="p-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-[11px] border border-sky-200"
                          title="Chỉnh sửa bài viết"
                        >
                          ✏️ Sửa
                        </Link>
                        <button
                          onClick={() => handleDelete(item.id, item.title)}
                          disabled={deletingId === item.id}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] border border-rose-200 cursor-pointer disabled:opacity-50"
                          title="Xóa bài viết"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
