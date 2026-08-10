"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatVND, parseImages, LABELS } from "@/lib/utils";

export default function ListingCard({ listing }: { listing: any }) {
  const router = useRouter();
  const images = parseImages(listing.images);
  const coverImage = images[0] || null;
  const price = listing.transactionType === "RENT" ? listing.rentPrice : listing.salePrice;

  function handleProjectClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (listing.project?.slug) {
      router.push(`/listings?project=${listing.project.slug}`);
    }
  }

  return (
    <Link
      href={`/listings/${listing.slug}`}
      className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white hover:border-[#2563EB] hover:shadow-md transition-all duration-200"
    >
      {/* 1. COVER IMAGE CONTAINER */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
        {coverImage ? (
          <img
            src={coverImage}
            alt={listing.title}
            className="h-full w-full object-cover group-hover:scale-103 transition-transform duration-300"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400 text-[13px] bg-slate-50">
            Chưa có hình ảnh
          </div>
        )}

        {/* BADGES */}
        <div className="absolute left-2.5 top-2.5 flex items-center gap-1.5 z-10">
          <span className="rounded bg-slate-900/80 backdrop-blur px-2 py-0.5 text-[11px] font-bold text-white">
            {LABELS.transactionType[listing.transactionType as "SALE" | "RENT"] || listing.transactionType}
          </span>
          {listing.verified && (
            <span className="rounded bg-emerald-700 px-2 py-0.5 text-[11px] font-bold text-white">
              Đã xác minh
            </span>
          )}
        </div>

        {/* IMAGE COUNT */}
        {images.length > 0 && (
          <div className="absolute right-2.5 bottom-2.5 rounded bg-black/60 backdrop-blur px-2 py-0.5 text-[11px] font-medium text-white">
            {images.length} ảnh
          </div>
        )}
      </div>

      {/* 2. CARD CONTENT */}
      <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
        <div className="space-y-1.5">
          {/* PRICE */}
          <div className="text-[18px] font-bold text-[#2563EB] tracking-tight">
            {formatVND(price)}
            {listing.transactionType === "RENT" ? (
              <span className="text-[12px] font-normal text-slate-500"> /tháng</span>
            ) : null}
          </div>

          {/* TITLE */}
          <h3 className="text-[14px] font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-[#2563EB] transition">
            {listing.title}
          </h3>

          {/* PROJECT / LOCATION */}
          {listing.project ? (
            <div
              onClick={handleProjectClick}
              className="text-[13px] font-semibold text-slate-700 hover:text-[#2563EB] truncate cursor-pointer"
            >
              {listing.project.name}
            </div>
          ) : (
            <div className="text-[13px] text-slate-500 truncate">
              {listing.address || "Quy Nhơn"}
            </div>
          )}

          {/* SPECS LINE */}
          <div className="text-[12px] text-slate-600 font-medium pt-1">
            <span>{listing.area} m²</span>
            <span className="mx-1.5">·</span>
            <span>{listing.bedrooms || 0} PN</span>
            {listing.doorDirection && (
              <>
                <span className="mx-1.5">·</span>
                <span>
                  {LABELS.direction[listing.doorDirection as keyof typeof LABELS.direction]}
                </span>
              </>
            )}
          </div>
        </div>

        {/* CODE & FOOTER */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>Minh Dũng Land</span>
          <span>#{listing.unitCode}</span>
        </div>
      </div>
    </Link>
  );
}
