"use client";

import { getOptimizedCloudinaryUrl } from "@/lib/cloudinaryImage";

interface NewsPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: {
    title: string;
    slug: string;
    thumbnail?: string | null;
    summary?: string | null;
    category?: string | null;
    tags?: string | null;
    content: string;
    authorName?: string;
    published?: boolean;
  };
}

export default function NewsPreviewModal({
  isOpen,
  onClose,
  article,
}: NewsPreviewModalProps) {
  if (!isOpen) return null;

  const tagsList = article.tags
    ? article.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 md:p-8 shadow-2xl border border-slate-200 my-8 space-y-6 relative max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* BANNER THÔNG BÁO MODE XEM TRƯỚC */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-4 sticky top-0 z-20 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-amber-600 text-lg">👁️</span>
            <div>
              <div className="font-extrabold text-xs text-amber-900">
                CHẾ ĐỘ XEM TRƯỚC (PREVIEW DRAFT)
              </div>
              <p className="text-[11px] text-amber-700">
                Bài viết chưa hiển thị công khai. Đây là giao diện thực tế khi người đọc truy cập bài viết.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 font-extrabold text-xs text-slate-950 transition cursor-pointer shrink-0"
          >
            Đóng xem trước ✕
          </button>
        </div>

        {/* BREADCRUMB MÔ PHỎNG */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium overflow-x-auto">
          <span>Trang chủ</span>
          <span>/</span>
          <span>Tin tức</span>
          <span>/</span>
          <span className="text-slate-900 font-bold truncate max-w-[240px]">
            {article.title || "Tiêu đề bài viết"}
          </span>
        </div>

        <div className="mx-auto max-w-3xl space-y-6">
          {/* CATEGORY & DATE */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {article.category && (
              <span className="rounded-full bg-blue-50 border border-blue-200 px-3 py-1 font-bold text-blue-700">
                {article.category}
              </span>
            )}
            <span className="text-slate-500">
              📅 Ngày đăng: {new Date().toLocaleDateString("vi-VN")} (Xem trước)
            </span>
            <span className="text-slate-500">
              ✍️ Tác giả: {article.authorName || "Minh Dũng Land"}
            </span>
          </div>

          {/* TITLE */}
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
            {article.title || "Chưa nhập tiêu đề"}
          </h1>

          {/* EXCERPT / SUMMARY */}
          {article.summary && (
            <div className="bg-slate-50 border-l-4 border-sky-600 p-4 rounded-r-xl text-sm font-semibold text-slate-700 leading-relaxed italic">
              &ldquo;{article.summary}&rdquo;
            </div>
          )}

          {/* THUMBNAIL */}
          {article.thumbnail && (
            <div className="overflow-hidden rounded-2xl border border-slate-200 aspect-[16/9] w-full bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getOptimizedCloudinaryUrl(article.thumbnail, "GALLERY")}
                alt={article.title}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* HTML CONTENT */}
          <article
            className="prose prose-slate max-w-none text-sm sm:text-base leading-relaxed text-slate-800 space-y-4 pt-2 border-t border-slate-100"
            dangerouslySetInnerHTML={{ __html: article.content || "<p>Chưa có nội dung...</p>" }}
          />

          {/* TAGS */}
          {tagsList.length > 0 && (
            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500">🏷️ Tags từ khóa:</span>
              {tagsList.map((tag, idx) => (
                <span
                  key={idx}
                  className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-full font-medium border border-slate-200"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
