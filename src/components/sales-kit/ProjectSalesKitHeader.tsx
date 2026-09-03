import React from "react";
import Link from "next/link";
import { getOptimizedCloudinaryUrl } from "@/lib/cloudinaryImage";

interface ProjectSalesKitHeaderProps {
  name: string;
  slug: string;
  developer?: string | null;
  address?: string | null;
  description?: string | null;
  coverImage?: string | null;
  featured?: boolean;
  districtName?: string | null;
  provinceName?: string | null;
  listingsCount?: number;
  isInternalUser?: boolean;
  userRole?: string;
}

export function ProjectSalesKitHeader({
  name,
  slug,
  developer,
  address,
  description,
  coverImage,
  featured,
  districtName,
  provinceName,
  listingsCount = 0,
  isInternalUser = false,
  userRole,
}: ProjectSalesKitHeaderProps) {
  const locationText = [districtName, provinceName].filter(Boolean).join(", ") || "Quy Nhơn, Gia Lai";

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-bold text-primary-600">
        <Link href="/tai-lieu-du-an" className="hover:underline">
          Tài liệu dự án
        </Link>
        <span>/</span>
        <Link href="/tai-lieu-du-an/tong-thong-tin" className="hover:underline">
          Tổng thông tin
        </Link>
        <span>/</span>
        <span className="text-dark font-extrabold">{name}</span>
      </div>

      {/* Main Hero Header Card */}
      <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6">
        <div className="flex flex-col lg:flex-row gap-6 lg:items-center justify-between">
          {/* Cover Photo */}
          <div className="relative aspect-[16/10] w-full lg:w-96 shrink-0 overflow-hidden rounded-2xl bg-slate-900 shadow-md">
            {coverImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={getOptimizedCloudinaryUrl(coverImage, "MOBILE")}
                srcSet={`${getOptimizedCloudinaryUrl(coverImage, "CARD")} 600w, ${getOptimizedCloudinaryUrl(coverImage, "MOBILE")} 800w, ${getOptimizedCloudinaryUrl(coverImage, "GALLERY")} 1200w`}
                sizes="(max-width: 1024px) 100vw, 400px"
                alt={name}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-white text-sm font-bold p-6 text-center">
                🏢 {name}
              </div>
            )}
            {featured && (
              <span className="absolute left-3 top-3 rounded-full bg-amber-400 px-3 py-1 text-[10px] font-extrabold text-slate-950 uppercase shadow">
                ★ DỰ ÁN NỔI BẬT
              </span>
            )}
          </div>

          {/* Project Header Info */}
          <div className="flex-1 space-y-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-2xl md:text-3xl font-extrabold text-dark tracking-tight">
                  {name}
                </h1>
                {isInternalUser && (
                  <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-bold text-purple-800 border border-purple-200">
                    🔒 QUYỀN SALES KIT ({userRole})
                  </span>
                )}
              </div>

              {address && (
                <div className="text-xs text-gray-500 font-semibold flex items-center gap-1.5">
                  <span className="text-primary-600">📍</span>
                  <span>{address}</span>
                </div>
              )}
            </div>

            {/* Quick Metadata Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50/80 p-4 rounded-2xl border border-gray-100">
              <div>
                <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Chủ đầu tư:</span>
                <div className="font-bold text-dark mt-0.5 truncate">
                  {developer || "Minh Dũng Land"}
                </div>
              </div>
              <div>
                <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Khu vực:</span>
                <div className="font-bold text-dark mt-0.5 truncate">
                  {locationText}
                </div>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">BĐS Đang rao:</span>
                <div className="font-bold text-primary-600 mt-0.5">
                  {listingsCount > 0 ? `${listingsCount} sản phẩm` : "Sắp mở bán"}
                </div>
              </div>
            </div>

            {description && (
              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                {description}
              </p>
            )}

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href={`/listings?project=${slug}`}
                className="btn-primary !px-5 !py-2.5 text-xs shadow-md shadow-primary-500/20"
              >
                Xem sản phẩm mở bán / cho thuê ➔
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
