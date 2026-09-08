"use client";

import { useState } from "react";
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
  const [deviceMode, setDeviceMode] = useState<"DESKTOP" | "MOBILE">("DESKTOP");

  if (!isOpen) return null;

  const tagsList = article.tags
    ? article.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div
        className={`bg-white rounded-3xl w-full shadow-2xl border border-slate-200 my-auto relative max-h-[92vh] flex flex-col transition-all duration-300 ${
          deviceMode === "MOBILE" ? "max-w-[420px] p-4 sm:p-5" : "max-w-4xl p-6 md:p-8"
        }`}
      >
        {/* TOP CONTROLS & DEVICE TOGGLE */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-xs mb-4">
          <div className="flex items-center gap-2">
            <span className="text-amber-600 text-lg">👁️</span>
            <div>
              <div className="font-extrabold text-xs text-amber-900">CHẾ ĐỘ XEM TRƯỚC (PREVIEW)</div>
              <p className="text-[11px] text-amber-700 hidden sm:block">
                Giao diện thực tế hiển thị khi độc giả truy cập bài viết.
              </p>
            </div>
          </div>

          {/* DEVICE SWITCHER BUTTONS */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-amber-200/60 p-0.5 rounded-xl text-xs font-bold text-slate-800">
              <button
                type="button"
                onClick={() => setDeviceMode("DESKTOP")}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                  deviceMode === "DESKTOP"
                    ? "bg-white text-slate-950 shadow-2xs font-extrabold"
                    : "text-amber-900 hover:text-black"
                }`}
              >
                <span>🖥️</span>
                <span className="hidden sm:inline">Desktop</span>
              </button>
              <button
                type="button"
                onClick={() => setDeviceMode("MOBILE")}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                  deviceMode === "MOBILE"
                    ? "bg-white text-slate-950 shadow-2xs font-extrabold"
                    : "text-amber-900 hover:text-black"
                }`}
              >
                <span>📱</span>
                <span className="hidden sm:inline">Mobile</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 font-extrabold text-xs text-slate-950 transition cursor-pointer shrink-0"
            >
              Đóng ✕
            </button>
          </div>
        </div>

        {/* SCROLLABLE ARTICLE CANVAS */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-6">
          {/* BREADCRUMB */}
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium overflow-x-auto">
            <span>Trang chủ</span>
            <span>/</span>
            <span>Tin tức</span>
            <span>/</span>
            <span className="text-slate-900 font-bold truncate max-w-[240px]">
              {article.title || "Tiêu đề bài viết"}
            </span>
          </div>

          <div className="space-y-5">
            {/* CATEGORY & METADATA */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
              {article.category && (
                <span className="rounded-full bg-blue-50 border border-blue-200 px-3 py-0.5 font-bold text-blue-700">
                  {article.category}
                </span>
              )}
              <span className="text-slate-500">📅 {new Date().toLocaleDateString("vi-VN")}</span>
              <span className="text-slate-500">✍️ {article.authorName || "Minh Dũng Land"}</span>
            </div>

            {/* TITLE (H1) */}
            <h1 className={`font-display font-extrabold text-slate-900 leading-snug ${
              deviceMode === "MOBILE" ? "text-xl" : "text-2xl sm:text-3xl"
            }`}>
              {article.title || "Chưa nhập tiêu đề bài viết"}
            </h1>

            {/* EXCERPT / SUMMARY SAPO */}
            {article.summary && (
              <div className="bg-slate-50 border-l-4 border-sky-600 p-3.5 sm:p-4 rounded-r-xl text-xs sm:text-sm font-semibold text-slate-700 leading-relaxed italic">
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
              className="prose prose-slate max-w-none text-xs sm:text-base leading-relaxed text-slate-800 space-y-4 pt-2 border-t border-slate-100"
              dangerouslySetInnerHTML={{ __html: article.content || "<p>Chưa có nội dung bài viết...</p>" }}
            />

            {/* TAGS */}
            {tagsList.length > 0 && (
              <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-bold text-slate-500">🏷️ Tags:</span>
                {tagsList.map((tag, idx) => (
                  <span
                    key={idx}
                    className="bg-slate-100 text-slate-700 text-xs px-2.5 py-0.5 rounded-full font-medium border border-slate-200"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
