"use client";

import React, { useRef, useState } from "react";
import { compressImage, revokePreviewUrl, ImagePreset } from "@/lib/imageCompression";

interface ImageUploadFieldProps {
  label?: string;
  value?: string;
  onChange: (url: string) => void;
  altValue?: string;
  onAltChange?: (alt: string) => void;
  preset?: ImagePreset;
  disabled?: boolean;
  aspectRatio?: string;
  placeholder?: string;
  suggestedAlt?: string;
  showAltField?: boolean;
}

export default function ImageUploadField({
  label = "Hình ảnh",
  value = "",
  onChange,
  altValue = "",
  onAltChange,
  preset = "DEFAULT",
  disabled = false,
  aspectRatio = "aspect-[16/10]",
  placeholder = "https://... hoặc chọn file tải lên",
  suggestedAlt = "",
  showAltField = true,
}: ImageUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [errorText, setErrorText] = useState("");

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrorText("");
    setStatusText("Đang nén tối ưu ảnh...");

    try {
      const optResult = await compressImage(file, preset);
      setStatusText(`Đang tải ảnh (${optResult.formattedOriginalSize} → ${optResult.formattedOptimizedSize})...`);

      const formData = new FormData();
      formData.append("file", optResult.file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Tải ảnh thất bại");
      }

      onChange(data.url);
      revokePreviewUrl(optResult.previewUrl);

      // Nếu chưa có alt text và có suggestedAlt, tự điền gợi ý alt
      if (onAltChange && !altValue && suggestedAlt) {
        onAltChange(suggestedAlt);
      }
    } catch (err: any) {
      setErrorText(err.message || "Lỗi tải ảnh");
    } finally {
      setUploading(false);
      setStatusText("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  return (
    <div className="space-y-2 text-xs">
      {label && <label className="font-bold text-slate-700 block">{label}</label>}

      {/* INPUT FILE ẨN */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        disabled={disabled || uploading}
        className="hidden"
        onChange={handleFileChange}
      />

      {/* DÒNG NHẬP URL + NÚT CHỌN ẢNH */}
      <div className="flex gap-2 items-center">
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || uploading}
          placeholder={placeholder}
          className="input font-mono flex-1 text-xs py-1.5"
        />

        <button
          type="button"
          disabled={disabled || uploading}
          onClick={() => fileInputRef.current?.click()}
          className="btn-outline !py-1.5 !px-3 text-xs shrink-0 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          title="Chọn ảnh từ thiết bị"
        >
          {uploading ? (
            <span className="animate-spin">⏳</span>
          ) : (
            <span>📁</span>
          )}
          <span>{uploading ? "Đang tải..." : value ? "Đổi ảnh" : "Chọn ảnh"}</span>
        </button>

        {value && !disabled && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer shrink-0"
            title="Xóa ảnh"
            aria-label="Xóa ảnh"
          >
            ✕
          </button>
        )}
      </div>

      {/* STATUS & ERROR */}
      {statusText && (
        <p className="text-[11px] text-sky-600 font-semibold flex items-center gap-1">
          <span className="animate-pulse">●</span> {statusText}
        </p>
      )}
      {errorText && (
        <p className="text-[11px] text-rose-600 font-bold">{errorText}</p>
      )}

      {/* PREVIEW KHUNG ẢNH */}
      {value && (
        <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group max-w-sm">
          <div className={`${aspectRatio} w-full overflow-hidden flex items-center justify-center`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt={altValue || suggestedAlt || "Xem trước ảnh"}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          </div>

          {!disabled && (
            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-white text-slate-800 text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-sm hover:bg-slate-50 transition cursor-pointer"
              >
                🔄 Thay ảnh khác
              </button>
              <button
                type="button"
                onClick={() => onChange("")}
                className="bg-rose-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-sm hover:bg-rose-700 transition cursor-pointer"
              >
                🗑️ Xóa
              </button>
            </div>
          )}
        </div>
      )}

      {/* TRƯỜNG ALT TEXT */}
      {showAltField && onAltChange && (
        <div className="pt-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Mô tả ảnh cho SEO (Alt text):</span>
            {!altValue && suggestedAlt && (
              <button
                type="button"
                onClick={() => onAltChange(suggestedAlt)}
                className="text-[10px] text-sky-600 hover:underline font-bold"
              >
                Dùng gợi ý: &ldquo;{suggestedAlt.slice(0, 30)}...&rdquo;
              </button>
            )}
          </div>
          <input
            type="text"
            value={altValue || ""}
            onChange={(e) => onAltChange(e.target.value)}
            disabled={disabled}
            placeholder={suggestedAlt || "Mô tả hình ảnh cho công cụ tìm kiếm"}
            className="input text-xs py-1 text-slate-700"
          />
        </div>
      )}
    </div>
  );
}
