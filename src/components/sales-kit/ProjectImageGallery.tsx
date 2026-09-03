import React from "react";
import { getOptimizedCloudinaryUrl } from "@/lib/cloudinaryImage";

interface ProjectImageGalleryProps {
  projectName: string;
  images: string[];
}

export function ProjectImageGallery({ projectName, images }: ProjectImageGalleryProps) {
  if (!images || images.length === 0) return null;

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-5">
      <div className="border-b border-gray-100 pb-4 flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-extrabold text-dark flex items-center gap-2">
            <span>🖼️</span>
            <span>HÌNH ẢNH & THỰC TẾ DỰ ÁN</span>
          </h3>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Bộ sưu tập phối cảnh 3D kiến trúc, tiện ích và hình ảnh thực tế {projectName}.
          </p>
        </div>
        <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {images.length} hình ảnh
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((imgUrl, idx) => (
          <a
            key={idx}
            href={getOptimizedCloudinaryUrl(imgUrl, "NEWS_HERO")}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100 border border-gray-100 shadow-sm"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getOptimizedCloudinaryUrl(imgUrl, "CARD")}
              srcSet={`${getOptimizedCloudinaryUrl(imgUrl, "THUMBNAIL")} 300w, ${getOptimizedCloudinaryUrl(imgUrl, "CARD")} 600w`}
              sizes="(max-width: 768px) 50vw, 25vw"
              alt={`${projectName} - ${idx + 1}`}
              loading="lazy"
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3 text-white text-[11px] font-bold">
              <span>Xem ảnh phóng to ↗</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
