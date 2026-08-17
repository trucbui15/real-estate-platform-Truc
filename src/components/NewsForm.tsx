"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { slugify } from "@/lib/utils";
import NewsTiptapEditor from "@/components/NewsTiptapEditor";
import NewsPreviewModal from "@/components/NewsPreviewModal";

const DEFAULT_CATEGORIES = [
  "Quy hoạch",
  "Căn hộ tầng cao",
  "Căn hộ Quy Nhơn",
  "Tin thị trường",
  "Đầu tư căn hộ",
  "So sánh dự án",
  "Tư vấn BĐS",
];

interface NewsFormProps {
  initialData?: {
    id?: string;
    title: string;
    slug: string;
    thumbnail?: string | null;
    summary?: string | null;
    category?: string | null;
    tags?: string | null;
    metaTitle?: string | null;
    ogImage?: string | null;
    content: string;
    published: boolean;
    publishedAt?: string | Date | null;
    authorId?: string;
  };
  isEdit?: boolean;
}

export default function NewsForm({ initialData, isEdit = false }: NewsFormProps) {
  const router = useRouter();
  const { data: session } = useSession();

  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [editingSlug, setEditingSlug] = useState(false);
  const [thumbnail, setThumbnail] = useState(initialData?.thumbnail || "");
  const [summary, setSummary] = useState(initialData?.summary || "");
  const [category, setCategory] = useState(initialData?.category || "Tin thị trường");
  const [customCategory, setCustomCategory] = useState("");
  const [tags, setTags] = useState(initialData?.tags || "");
  const [metaTitle, setMetaTitle] = useState(initialData?.metaTitle || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [published, setPublished] = useState(initialData?.published ?? false);
  const [publishedAt, setPublishedAt] = useState<string | null>(
    initialData?.publishedAt ? new Date(initialData.publishedAt).toLocaleString("vi-VN") : null
  );

  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto generate slug from title when creating
  useEffect(() => {
    if (!isEdit && !editingSlug && title.trim()) {
      const generated = slugify(title);
      setSlug(generated);
      if (!metaTitle) setMetaTitle(title);
    }
  }, [title, isEdit, editingSlug]);

  async function handleThumbnailUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploadingThumbnail(true);
    setError("");

    const file = files[0];
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "h8s6hyxc";
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "minhdungland";
    let fileUrl = "";

    try {
      // 1. Direct Cloudinary Upload
      try {
        const cloudFd = new FormData();
        cloudFd.append("file", file);
        cloudFd.append("upload_preset", uploadPreset);

        const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: "POST",
          body: cloudFd,
        });

        if (cloudRes.ok) {
          const cloudData = await cloudRes.json();
          if (cloudData.secure_url) fileUrl = cloudData.secure_url;
        }
      } catch (e) {
        console.warn("Cloudinary upload failed, fallback /api/upload", e);
      }

      // 2. Fallback /api/upload
      if (!fileUrl) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (res.ok && data.url) fileUrl = data.url;
        else setError(data.error || "Tải ảnh đại diện thất bại.");
      }

      if (fileUrl) {
        setThumbnail(fileUrl);
      }
    } catch (e: any) {
      setError(e.message || "Lỗi kết nối khi tải ảnh");
    } finally {
      setUploadingThumbnail(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSave(targetPublishedStatus: boolean) {
    setError("");
    if (!title.trim()) {
      setError("Vui lòng nhập tiêu đề bài viết.");
      return;
    }
    if (!content.trim() || content === "<p></p>") {
      setError("Vui lòng nhập nội dung bài viết.");
      return;
    }

    setSaving(true);
    const finalCategory = category === "CUSTOM" ? customCategory.trim() : category;
    const finalSlug = slug.trim() ? slugify(slug) : slugify(title);

    const payload = {
      title: title.trim(),
      slug: finalSlug,
      thumbnail: thumbnail.trim() || null,
      summary: summary.trim() || null,
      category: finalCategory || null,
      tags: tags.trim() || null,
      metaTitle: metaTitle.trim() || null,
      content,
      published: targetPublishedStatus,
    };

    try {
      const url = isEdit ? `/api/news/${initialData?.id}` : "/api/news";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Không thể lưu bài viết.");
        setSaving(false);
        return;
      }

      setPublished(data.published);
      if (data.publishedAt) {
        setPublishedAt(new Date(data.publishedAt).toLocaleString("vi-VN"));
      }

      setSaving(false);
      router.push("/dashboard/news");
      router.refresh();
    } catch (err: any) {
      setSaving(false);
      setError(err.message || "Lỗi kết nối máy chủ.");
    }
  }

  // SEO COUNTERS & WARNINGS
  const seoTitleLen = metaTitle.trim().length || title.trim().length;
  const seoDescLen = summary.trim().length;

  return (
    <div className="space-y-6">
      {/* PREVIEW MODAL */}
      <NewsPreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        article={{
          title,
          slug,
          thumbnail,
          summary,
          category,
          tags,
          content,
          authorName: session?.user?.name || "Minh Dũng Land",
          published,
        }}
      />

      {/* TOP TITLE HEADER & ACTIONS BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="font-extrabold text-xl md:text-2xl text-slate-900">
            {isEdit ? "✏️ Chỉnh Sửa Bài Viết" : "📝 Viết Bài Tin Tức Mới"}
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            CMS biên tập tin tức bất động sản theo phong cách Gutenberg / Notion gọn nhẹ
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.push("/dashboard/news")}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 transition"
          >
            ← Danh sách bài
          </button>
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-sky-700 bg-sky-50 border border-sky-200 hover:bg-sky-100 transition flex items-center gap-1 cursor-pointer"
          >
            <span>👁️</span>
            <span>Xem trước</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl font-bold flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* MAIN 2-COLUMN DESKTOP LAYOUT (LEFT 70% - RIGHT 30%) */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-[1fr_320px]">
        {/* LEFT COLUMN (~70% MAIN CONTENT CANVAS) */}
        <div className="space-y-6">
          {/* 1. TITLE (H1 EQUIVALENT FOR ARTICLE) */}
          <div className="card p-5 space-y-3 bg-white">
            <input
              type="text"
              placeholder="Nhập tiêu đề bài viết tại đây..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xl sm:text-2xl md:text-3xl font-extrabold font-display text-slate-900 placeholder:text-slate-300 focus:outline-none border-0 p-0"
            />

            {/* SLUG URL EDITABLE BAR */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex-wrap">
              <span className="font-bold text-slate-700">Permalink:</span>
              <span className="text-slate-400">minhdungland.com.vn/news/</span>
              {editingSlug ? (
                <div className="flex items-center gap-1 flex-1">
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="px-2 py-0.5 rounded border border-sky-400 text-slate-900 bg-white font-bold text-xs outline-none flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => setEditingSlug(false)}
                    className="px-2 py-0.5 bg-slate-900 text-white rounded text-[11px] font-bold"
                  >
                    OK
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 font-bold text-sky-700">
                  <span>{slug || "chua-co-slug"}</span>
                  <button
                    type="button"
                    onClick={() => setEditingSlug(true)}
                    className="text-[11px] text-slate-500 hover:text-sky-700 underline font-semibold cursor-pointer"
                  >
                    ✏️ Sửa
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 2. FEATURED THUMBNAIL IMAGE */}
          <div className="card p-5 space-y-3 bg-white">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              🖼️ Ảnh Đại Diện Bài Viết (Featured Image)
            </label>

            <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 flex items-center justify-center group">
              {thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={thumbnail}
                  alt={title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/logo.png";
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400">
                  <svg className="w-12 h-12 stroke-slate-300 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v16m14 0h2" />
                  </svg>
                  <span className="text-xs font-bold text-slate-600">Chưa có ảnh đại diện</span>
                  <span className="text-[11px] text-slate-400">Khuyên dùng tỷ lệ 16:9 (1200x675px)</span>
                </div>
              )}

              {thumbnail && (
                <button
                  type="button"
                  onClick={() => setThumbnail("")}
                  className="absolute top-2 right-2 bg-slate-900/80 hover:bg-rose-600 text-white text-xs font-bold px-2.5 py-1 rounded-xl transition cursor-pointer shadow-md"
                >
                  ✕ Xóa ảnh
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingThumbnail}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <span>📤</span>
                <span>{uploadingThumbnail ? "Đang tải ảnh..." : "Chọn ảnh từ máy"}</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleThumbnailUpload(e.target.files)}
              />

              <input
                type="url"
                placeholder="Hoặc dán URL ảnh ngoài..."
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
                className="input text-xs font-mono flex-1"
              />
            </div>
          </div>

          {/* 3. SUMMARY / SAPO TEXTAREA */}
          <div className="card p-5 space-y-2 bg-white">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              📑 Mô Tả Ngắn / Sa-pô Bài Viết (Summary)
            </label>
            <textarea
              rows={3}
              placeholder="Tóm tắt ngắn gọn 2-3 câu làm sa-pô mở đầu bài viết..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 focus:outline-none focus:border-sky-500 leading-relaxed"
            />
          </div>

          {/* 4. TIPTAP RICH TEXT EDITOR */}
          <div className="card p-5 space-y-3 bg-white">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              ✍️ Nội Dung Chi Tiết (Tiptap Gutenberg Editor)
            </label>
            <NewsTiptapEditor value={content} onChange={setContent} />
          </div>
        </div>

        {/* RIGHT COLUMN (~30% SIDEBAR PANELS) */}
        <div className="space-y-6">
          {/* PANEL 1: PUBLISH ACTIONS & STATUS */}
          <div className="card p-5 space-y-4 bg-white border-sky-100 shadow-md">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                ⚙️ TRẠNG THÁI & HÀNH ĐỘNG
              </span>
              <span
                className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                  published
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}
              >
                {published ? "🟢 ĐÃ XUẤT BẢN" : "🟡 BẢN NHÁP"}
              </span>
            </div>

            {publishedAt && (
              <div className="text-[11px] text-slate-500 font-mono">
                📅 Ngày xuất bản: <span className="font-bold text-slate-700">{publishedAt}</span>
              </div>
            )}

            <div className="space-y-2 pt-1">
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSave(false)}
                className="w-full py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs transition shadow-2xs disabled:opacity-50 cursor-pointer"
              >
                {saving ? "Đang lưu..." : "💾 Lưu Bản Nháp (Draft)"}
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={() => handleSave(true)}
                className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs transition shadow-md disabled:opacity-50 cursor-pointer"
              >
                {saving
                  ? "Đang lưu..."
                  : published
                  ? "🔄 Cập Nhật Bài Viết"
                  : "🚀 XUẤT BẢN BÀI VIẾT (PUBLISH)"}
              </button>
            </div>
          </div>

          {/* PANEL 2: CATEGORY & TAGS */}
          <div className="card p-5 space-y-4 bg-white">
            <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block border-b border-slate-100 pb-2">
              📂 PHÂN LOẠI & THẺ
            </span>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Danh mục tin tức</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input text-xs font-semibold cursor-pointer"
              >
                {DEFAULT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
                <option value="CUSTOM">+ Nhập danh mục mới...</option>
              </select>

              {category === "CUSTOM" && (
                <input
                  type="text"
                  placeholder="Nhập tên danh mục..."
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="input text-xs mt-2"
                />
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Tác giả bài viết</label>
              <input
                type="text"
                disabled
                value={session?.user?.name || "Minh Dũng Land"}
                className="input text-xs bg-slate-50 font-bold text-slate-600"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Thẻ từ khóa (Tags)</label>
              <input
                type="text"
                placeholder="căn hộ, quy nhơn, simona heights..."
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="input text-xs"
              />
              <span className="text-[10px] text-slate-400">Phân cách nhau bằng dấu phẩy</span>
            </div>
          </div>

          {/* PANEL 3: SEO CONFIG & GOOGLE PREVIEW */}
          <div className="card p-5 space-y-4 bg-white">
            <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block border-b border-slate-100 pb-2">
              🔍 TỐI ƯU HÓA SEO
            </span>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">SEO Title (Tiêu đề Google)</label>
                <span
                  className={`text-[10px] font-bold ${
                    seoTitleLen > 60 ? "text-rose-600 font-extrabold" : "text-slate-400"
                  }`}
                >
                  {seoTitleLen}/60 ký tự {seoTitleLen > 60 ? "(Quá dài)" : ""}
                </span>
              </div>
              <input
                type="text"
                placeholder="Mặc định dùng Tiêu đề bài viết..."
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                className="input text-xs"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">Meta Description</label>
                <span
                  className={`text-[10px] font-bold ${
                    seoDescLen > 160 ? "text-rose-600 font-extrabold" : "text-slate-400"
                  }`}
                >
                  {seoDescLen}/160 ký tự {seoDescLen > 160 ? "(Quá dài)" : ""}
                </span>
              </div>
              <textarea
                rows={3}
                placeholder="Mặc định dùng Mô tả ngắn Sa-pô..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* GOOGLE SEARCH SNIPPET PREVIEW */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1 select-none">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                🌐 Xem trước kết quả Google Search
              </div>
              <div className="text-sky-700 text-xs font-bold truncate">
                {metaTitle.trim() || title.trim() || "Tiêu đề bài viết hiển thị Google"}
              </div>
              <div className="text-[11px] text-emerald-700 font-mono truncate">
                https://minhdungland.com.vn/news/{slug || "slug-bai-viet"}
              </div>
              <div className="text-[11px] text-slate-600 line-clamp-2 leading-tight">
                {summary.trim() || "Mô tả ngắn của bài viết sẽ hiển thị dưới đây trên kết quả tìm kiếm Google..."}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
