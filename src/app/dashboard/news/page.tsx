"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { slugify } from "@/lib/utils";
import WordPressEditor from "@/components/WordPressEditor";

const CATEGORIES = [
  "Quy hoạch",
  "Căn hộ tầng cao",
  "Căn hộ Quy Nhơn",
  "Tin thị trường",
  "Đầu tư căn hộ",
  "So sánh dự án",
  "Tư vấn BĐS",
];

const initialForm = {
  title: "",
  slug: "",
  thumbnail: "",
  summary: "",
  category: "Tin thị trường",
  tags: "",
  metaTitle: "",
  ogImage: "",
  content: "",
  published: true,
};

export default function DashboardNewsPage() {
  const { data: session } = useSession();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"LIST" | "EDITOR">("LIST");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [editingSlug, setEditingSlug] = useState(false);
  const [showHtml, setShowHtml] = useState(false);
  const [seoOpen, setSeoOpen] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const ogInputRef = useRef<HTMLInputElement>(null);
  const contentInputRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/news?all=1", { cache: "no-store" });
    if (res.ok) setItems(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    if (session) load();
  }, [session]);

  function startNewArticle() {
    setEditingId(null);
    setForm(initialForm);
    setError("");
    setMode("EDITOR");
  }

  function editArticle(item: any) {
    setEditingId(item.id);
    setForm({
      title: item.title || "",
      slug: item.slug || "",
      thumbnail: item.thumbnail || "",
      summary: item.summary || "",
      category: item.category || "Tin thị trường",
      tags: item.tags || "",
      metaTitle: item.metaTitle || "",
      ogImage: item.ogImage || "",
      content: item.content || "",
      published: item.published ?? true,
    });
    setError("");
    setMode("EDITOR");
  }

  function updateForm(k: keyof typeof initialForm, v: any) {
    setForm((f) => {
      const next = { ...f, [k]: v };
      if (k === "title" && !editingId && !editingSlug) {
        next.slug = slugify(v);
        if (!next.metaTitle) next.metaTitle = v;
      }
      return next;
    });
  }

  async function handleThumbnailUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", files[0]);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok && data.url) {
        updateForm("thumbnail", data.url);
      } else {
        setError(data.error || "Tải ảnh đại diện thất bại");
      }
    } catch (e) {
      setError("Lỗi kết nối khi tải ảnh");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleOgUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    try {
      const fd = new FormData();
      fd.append("file", files[0]);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok && data.url) {
        updateForm("ogImage", data.url);
      }
    } catch (e) {
      alert("Tải ảnh chia sẻ thất bại");
    } finally {
      if (ogInputRef.current) ogInputRef.current.value = "";
    }
  }

  async function handleInsertContentImage(files: FileList | null) {
    if (!files || files.length === 0) return;
    try {
      const fd = new FormData();
      fd.append("file", files[0]);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok && data.url) {
        const imgTag = `<img src="${data.url}" alt="${form.title || 'Ảnh bài viết'}" class="my-4 rounded-xl max-w-full h-auto shadow-sm" />`;
        insertAtCursor(imgTag);
      }
    } catch (e) {
      alert("Không thể chèn ảnh vào nội dung");
    } finally {
      if (contentInputRef.current) contentInputRef.current.value = "";
    }
  }

  function insertAtCursor(text: string) {
    setForm((f) => ({ ...f, content: f.content + text }));
  }

  async function saveArticle(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      setError("Vui lòng nhập Tiêu đề và Nội dung bài viết!");
      return;
    }

    setSaving(true);
    setError("");

    const payload = {
      ...form,
      title: form.title.trim(),
      slug: form.slug ? slugify(form.slug) : slugify(form.title),
      category: customCategory.trim() || form.category,
    };

    try {
      const url = editingId ? `/api/news/${editingId}` : "/api/news";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setSaving(false);
      if (res.ok) {
        await load();
        setMode("LIST");
      } else {
        const data = await res.json();
        setError(data.error || "Không thể lưu bài viết.");
      }
    } catch (err) {
      setSaving(false);
      setError("Lỗi kết nối khi lưu bài viết.");
    }
  }

  async function deleteArticle(id: string, title: string) {
    if (!confirm(`⚠️ Bạn có chắc chắn muốn XÓA VĨNH VIỄN bài viết:\n"${title}"?`)) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/news/${id}`, { method: "DELETE" });
      setDeleting(false);
      if (res.ok) {
        if (editingId === id) setMode("LIST");
        await load();
      } else {
        const data = await res.json();
        alert(data.error || "Không thể xóa bài viết này.");
      }
    } catch (err) {
      setDeleting(false);
      alert("Lỗi kết nối khi xóa bài viết.");
    }
  }

  const publicUrl = typeof window !== "undefined" ? window.location.origin : "https://minhdungland.com.vn";

  return (
    <div className="space-y-6">
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-slate-200">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 flex items-center gap-2">
            <span>📰</span>
            <span>Quản lý Bài viết & Tin tức</span>
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Tối ưu nội dung chuẩn SEO Google, quản lý danh mục và đăng bài truyền thông.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {mode === "EDITOR" ? (
            <>
              <button
                type="button"
                onClick={() => setMode("LIST")}
                className="btn-secondary text-xs font-semibold px-3 py-2 flex items-center gap-1 cursor-pointer"
              >
                <span>← Quay lại danh sách</span>
              </button>
              <button
                type="button"
                onClick={() => saveArticle()}
                disabled={saving}
                className="btn-primary text-xs font-bold px-4 py-2 flex items-center gap-1.5 cursor-pointer bg-blue-600 hover:bg-blue-700 shadow-xs"
              >
                <span>💾</span>
                <span>{saving ? "Đang lưu..." : "Lưu bài viết"}</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={startNewArticle}
              className="btn-primary text-xs sm:text-sm font-bold px-4 py-2 flex items-center gap-1.5 cursor-pointer bg-blue-600 hover:bg-blue-700 shadow-xs"
            >
              <span>✏️</span>
              <span>Tạo bài viết mới</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700">
          ⚠️ {error}
        </div>
      )}

      {/* MODE 1: LIST OF ARTICLES */}
      {mode === "LIST" && (
        <div className="space-y-4">
          <div className="overflow-x-auto custom-scrollbar rounded-2xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5">Bài viết</th>
                  <th className="px-4 py-3.5">Danh mục</th>
                  <th className="px-4 py-3.5">Người viết</th>
                  <th className="px-4 py-3.5">Trạng thái</th>
                  <th className="px-4 py-3.5">Ngày tạo</th>
                  <th className="px-4 py-3.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                      Đang tải danh sách bài viết...
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                      Chưa có bài viết nào. Hãy bấm &quot;Tạo bài viết mới&quot; để viết bài SEO!
                    </td>
                  </tr>
                ) : (
                  items.map((n) => (
                    <tr key={n.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          {n.thumbnail ? (
                            <img
                              src={n.thumbnail}
                              alt={n.title}
                              className="h-12 w-20 object-cover rounded-lg border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="h-12 w-20 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center text-[10px] text-slate-400 shrink-0">
                              No image
                            </div>
                          )}
                          <div>
                            <button
                              onClick={() => editArticle(n)}
                              className="font-bold text-slate-900 hover:text-blue-600 text-left line-clamp-2"
                            >
                              {n.title}
                            </button>
                            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                              /news/{n.slug}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-block text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                          {n.category || "Tin tức"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-600 font-medium">
                        👤 {n.author?.name || "BQT"}
                      </td>
                      <td className="px-4 py-3.5">
                        {n.published ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                            🟢 Đã xuất bản
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 border border-amber-200">
                            🟡 Bản nháp
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-500 font-mono">
                        {new Date(n.createdAt).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => editArticle(n)}
                            className="px-2.5 py-1 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          >
                            ✏️ Sửa
                          </button>
                          <button
                            onClick={() => deleteArticle(n.id, n.title)}
                            className="px-2.5 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          >
                            🗑️ Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODE 2: FULL LADIPAGE-STYLE SEO EDITOR */}
      {mode === "EDITOR" && (
        <form onSubmit={saveArticle} className="grid gap-6 lg:grid-cols-[1fr_340px] items-start">
          {/* MAIN WRITING AREA */}
          <div className="space-y-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            {/* TITLE INPUT */}
            <div>
              <input
                type="text"
                required
                placeholder="Nhập tiêu đề bài viết tại đây..."
                value={form.title}
                onChange={(e) => updateForm("title", e.target.value)}
                className="w-full border-b border-slate-200 py-2 text-2xl sm:text-3xl font-extrabold text-slate-900 placeholder:text-slate-300 focus:border-blue-600 focus:outline-none transition"
              />
            </div>

            {/* EDITABLE SLUG URL */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs font-mono flex items-center justify-between gap-2">
              <div className="truncate text-slate-600">
                <span className="text-slate-400">URL: </span>
                <span className="text-blue-700 font-bold">{publicUrl}/news/</span>
                {editingSlug ? (
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => updateForm("slug", e.target.value)}
                    className="border border-blue-400 rounded px-1.5 py-0.5 text-xs font-mono text-slate-900"
                    onBlur={() => setEditingSlug(false)}
                  />
                ) : (
                  <span className="font-bold text-slate-900">{form.slug || "duong-dan-bai-viet"}</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setEditingSlug(!editingSlug)}
                className="text-slate-500 hover:text-blue-600 font-sans font-bold text-xs shrink-0"
              >
                ✏️ {editingSlug ? "Xong" : "Sửa URL"}
              </button>
            </div>

            {/* SHORT EXCERPT / META DESCRIPTION (UNDER 160 CHARS FOR SEO) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">
                  📝 Mô tả ngắn bài viết (SEO Meta Description)
                </label>
                <span
                  className={`text-[11px] font-mono font-bold ${
                    form.summary.length > 160 ? "text-rose-600" : "text-slate-400"
                  }`}
                >
                  {form.summary.length}/160 ký tự
                </span>
              </div>
              <textarea
                rows={2}
                maxLength={200}
                placeholder="Nhập mô tả ngắn (dưới 160 ký tự) phục vụ hiển thị kết quả tìm kiếm Google & chia sẻ mạng xã hội..."
                value={form.summary}
                onChange={(e) => updateForm("summary", e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* WORDPRESS CLASSIC STYLE RICH TEXT EDITOR */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">✍️ Nội dung bài viết chi tiết (Trình soạn thảo kiểu WordPress)</label>
              <WordPressEditor
                value={form.content}
                onChange={(val) => updateForm("content", val)}
                placeholder="Nhập nội dung bài viết phong phú tại đây..."
              />
            </div>
          </div>

          {/* RIGHT SIDEBAR OPTIONS (LIKE LADIPAGE CMS) */}
          <div className="space-y-5">
            {/* THUMBNAIL UPLOAD */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs">
              <label className="block text-xs font-bold text-slate-900">🖼️ Ảnh đại diện bài viết (Thumbnail)</label>
              
              {form.thumbnail ? (
                <div className="space-y-2">
                  <img
                    src={form.thumbnail}
                    alt="Thumbnail preview"
                    className="w-full aspect-[16/9] object-cover rounded-xl border border-slate-200 shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => updateForm("thumbnail", "")}
                    className="w-full py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 transition"
                  >
                    🗑️ Xóa ảnh này
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-6 text-center cursor-pointer bg-slate-50 hover:bg-blue-50/50 transition space-y-2"
                >
                  <div className="text-2xl">📤</div>
                  <div className="text-xs font-bold text-slate-700">Chọn ảnh đại diện</div>
                  <div className="text-[11px] text-slate-400">Kích thước gợi ý: 1200x600px (.jpg, .png)</div>
                </div>
              )}

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={(e) => handleThumbnailUpload(e.target.files)}
              />
              {uploading && <div className="text-xs text-blue-600 font-semibold animate-pulse">Đang tải ảnh lên...</div>}
            </div>

            {/* PUBLISH STATUS TOGGLE */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs">
              <label className="block text-xs font-bold text-slate-900">🟢 Trạng thái xuất bản</label>
              
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-800">
                  {form.published ? "🟢 Xuất bản (Công khai)" : "🟡 Bản nháp (Ẩn)"}
                </span>
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) => updateForm("published", e.target.checked)}
                  className="h-5 w-5 accent-blue-600 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* CATEGORIES (DANH MỤC) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs">
              <label className="block text-xs font-bold text-slate-900">📂 Danh mục bài viết</label>
              
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {CATEGORIES.map((cat) => (
                  <label
                    key={cat}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 cursor-pointer text-xs font-medium text-slate-700"
                  >
                    <input
                      type="radio"
                      name="categorySelect"
                      checked={form.category === cat}
                      onChange={() => {
                        updateForm("category", cat);
                        setCustomCategory("");
                      }}
                      className="accent-blue-600 cursor-pointer"
                    />
                    <span>{cat}</span>
                  </label>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100">
                <input
                  type="text"
                  placeholder="Hoặc nhập danh mục khác..."
                  value={customCategory}
                  onChange={(e) => {
                    setCustomCategory(e.target.value);
                    updateForm("category", e.target.value);
                  }}
                  className="input text-xs w-full"
                />
              </div>
            </div>

            {/* SEO & SOCIALS COLLAPSIBLE BOX MATCHING EXACT SCREENSHOT */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <button
                type="button"
                onClick={() => setSeoOpen(!seoOpen)}
                className="w-full p-4 flex items-center justify-between font-bold text-xs text-slate-900 bg-slate-50 hover:bg-slate-100 transition cursor-pointer border-b border-slate-100"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">📷</span>
                  <span>SEO & Socials</span>
                </div>
                <span className="text-slate-400 font-mono text-[10px]">{seoOpen ? "▲" : "▼"}</span>
              </button>

              {seoOpen && (
                <div className="p-4 space-y-4 text-xs">
                  {/* 1. TIÊU ĐỀ */}
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-800">Tiêu đề</label>
                    <input
                      type="text"
                      placeholder="vd: Bài viết mới"
                      value={form.metaTitle}
                      onChange={(e) => updateForm("metaTitle", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  {/* 2. TỪ KHÓA VỀ BÀI VIẾT */}
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-800">Từ khoá về bài viết</label>
                    <input
                      type="text"
                      placeholder="vd: Ladichat, Hướng dẫn sử dụng..."
                      value={form.tags}
                      onChange={(e) => updateForm("tags", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  {/* 3. MÔ TẢ */}
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-800">Mô tả</label>
                    <textarea
                      rows={3}
                      maxLength={180}
                      placeholder="Hãy viết mô tả khoảng 120 ký tự sẽ giúp bạn tối ưu nhất"
                      value={form.summary}
                      onChange={(e) => updateForm("summary", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  {/* 4. HÌNH ẢNH KHI CHIA SẺ */}
                  <div className="space-y-2">
                    <label className="block font-bold text-slate-800">Hình ảnh khi chia sẻ</label>
                    
                    {form.ogImage ? (
                      <div className="space-y-2">
                        <img
                          src={form.ogImage}
                          alt="OG Share Preview"
                          className="w-full aspect-[16/9] object-cover rounded-xl border border-slate-200"
                        />
                        <button
                          type="button"
                          onClick={() => updateForm("ogImage", "")}
                          className="w-full py-1 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 transition"
                        >
                          🗑️ Đổi ảnh chia sẻ khác
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => ogInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-5 text-center cursor-pointer bg-slate-50 hover:bg-blue-50/50 transition space-y-1.5"
                      >
                        <div className="text-xl">📤</div>
                        <div className="text-xs font-bold text-blue-600">Chọn ảnh từ thư viện</div>
                        <div className="text-[11px] text-slate-400">Định dạng JPG, PNG</div>
                      </div>
                    )}

                    <input
                      type="file"
                      ref={ogInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleOgUpload(e.target.files)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* GOOGLE SEARCH PREVIEW BOX */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2 shadow-xs">
              <label className="block text-xs font-bold text-slate-900">🔍 Xem trước kết quả Google Search</label>
              
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                <div className="text-[11px] text-slate-500 font-mono truncate">
                  {publicUrl} › news › {form.slug || "duong-dan"}
                </div>
                <div className="text-sm font-bold text-blue-700 line-clamp-1 hover:underline cursor-pointer">
                  {form.metaTitle || form.title || "Tiêu đề bài viết SEO Google"}
                </div>
                <div className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {form.summary || "Mô tả ngắn của bài viết sẽ hiển thị tại đây khi người dùng tìm kiếm trên Google..."}
                </div>
              </div>
            </div>

            {/* DELETE ARTICLE BUTTON (IF EDITING EXISTING ARTICLE) */}
            {editingId && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => deleteArticle(editingId, form.title)}
                  disabled={deleting}
                  className="w-full py-2.5 px-4 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>🗑️</span>
                  <span>{deleting ? "Đang xóa..." : "Xóa bài viết này"}</span>
                </button>
              </div>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
