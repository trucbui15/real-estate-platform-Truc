"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ListingCard from "@/components/ListingCard";
import SearchFilters from "@/components/SearchFilters";
import SortSelect from "@/components/SortSelect";

interface ListingsClientProps {
  items: any[];
  total: number;
  page: number;
  totalPages: number;
  sort: string;
  searchParams: Record<string, string | undefined>;
  provinces: any[];
  projects: any[];
  activeProject: any;
}

export default function ListingsClient({
  items,
  total,
  page,
  totalPages,
  sort,
  searchParams,
  provinces,
  projects,
  activeProject,
}: ListingsClientProps) {
  const router = useRouter();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const transactionType = searchParams.transactionType || "SALE";

  // Build active filter chips with single-click removal handler
  const activeChips: { key: string; label: string; removeKey: string }[] = [];
  if (searchParams.keyword) {
    activeChips.push({ key: "keyword", label: `Từ khóa: "${searchParams.keyword}"`, removeKey: "keyword" });
  }
  if (activeProject) {
    activeChips.push({ key: "project", label: `Dự án: ${activeProject.name}`, removeKey: "project" });
  }
  if (searchParams.bedrooms) {
    activeChips.push({ key: "bedrooms", label: `${searchParams.bedrooms} PN`, removeKey: "bedrooms" });
  }
  if (searchParams.minPrice || searchParams.maxPrice) {
    activeChips.push({ key: "price", label: "Khoảng giá đã chọn", removeKey: "price" });
  }
  if (searchParams.minArea || searchParams.maxArea) {
    activeChips.push({ key: "area", label: "Diện tích đã chọn", removeKey: "area" });
  }
  if (searchParams.direction) {
    activeChips.push({ key: "direction", label: `Hướng: ${searchParams.direction}`, removeKey: "direction" });
  }

  function removeSingleFilter(key: string) {
    const next = new URLSearchParams(searchParams as Record<string, string>);
    if (key === "price") {
      next.delete("minPrice");
      next.delete("maxPrice");
    } else if (key === "area") {
      next.delete("minArea");
      next.delete("maxArea");
    } else {
      next.delete(key);
    }
    next.delete("page");
    router.push(`/listings?${next.toString()}`);
  }

  function switchTransactionType(type: "SALE" | "RENT") {
    const next = new URLSearchParams(searchParams as Record<string, string>);
    next.set("transactionType", type);
    next.delete("minPrice");
    next.delete("maxPrice");
    next.delete("page");
    router.push(`/listings?${next.toString()}`);
  }

  return (
    <div className="container-page py-6 space-y-6">
      {/* 1. COMPACT PAGE HEADER */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            {/* SALE / RENT TABS */}
            <div className="flex items-center gap-2 pb-1">
              <button
                onClick={() => switchTransactionType("SALE")}
                className={`px-3.5 py-1.5 rounded-lg text-[13px] font-bold transition border ${
                  transactionType === "SALE"
                    ? "bg-[#2563EB] text-white border-[#2563EB]"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                Mua bán & Chuyển nhượng
              </button>

              <button
                onClick={() => switchTransactionType("RENT")}
                className={`px-3.5 py-1.5 rounded-lg text-[13px] font-bold transition border ${
                  transactionType === "RENT"
                    ? "bg-[#2563EB] text-white border-[#2563EB]"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                Cho thuê
              </button>
            </div>

            <h1 className="text-[20px] sm:text-[24px] font-bold text-slate-900 tracking-tight">
              {activeProject ? (
                <span>Bất động sản thuộc dự án {activeProject.name}</span>
              ) : (
                <span>
                  {transactionType === "RENT"
                    ? "Cho thuê bất động sản Quy Nhơn & Bình Định"
                    : "Mua bán & Chuyển nhượng bất động sản Quy Nhơn"}
                </span>
              )}
            </h1>

            <p className="text-[13px] text-slate-500">
              Hiển thị <span className="text-[#2563EB] font-bold">{total}</span> sản phẩm phù hợp
            </p>
          </div>

          {/* SORT CONTROL & MOBILE FILTER TOGGLE */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* MOBILE FILTER TOGGLE BUTTON */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 text-[13px] font-bold hover:bg-slate-200 transition"
            >
              <span>Bộ lọc</span>
              {activeChips.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded bg-[#2563EB] text-white text-[10px]">
                  {activeChips.length}
                </span>
              )}
            </button>

            <div className="flex items-center gap-2">
              <span className="text-[13px] font-medium text-slate-500">Sắp xếp:</span>
              <SortSelect currentSort={sort} />
            </div>
          </div>
        </div>
      </div>

      {/* 2. ACTIVE FILTER CHIPS */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-2xl border border-slate-200 text-[13px]">
          <span className="font-semibold text-slate-500 mr-1">Đang lọc:</span>
          {activeChips.map((chip) => (
            <span
              key={chip.key}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 border border-slate-200 px-2.5 py-1 font-semibold text-slate-800 text-[12px]"
            >
              <span>{chip.label}</span>
              <button
                type="button"
                onClick={() => removeSingleFilter(chip.removeKey)}
                className="text-slate-400 hover:text-rose-600 font-bold ml-1"
                title="Xóa tiêu chí này"
              >
                ✕
              </button>
            </span>
          ))}

          <Link
            href={transactionType === "RENT" ? "/listings?transactionType=RENT" : "/listings?transactionType=SALE"}
            className="text-[12px] font-semibold text-rose-600 hover:underline ml-auto"
          >
            Đặt lại bộ lọc
          </Link>
        </div>
      )}

      {/* 3. MAIN MARKETPLACE LAYOUT */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* DESKTOP SIDEBAR FILTER */}
        <aside className="hidden lg:block w-[280px] shrink-0 sticky top-24">
          <SearchFilters provinces={provinces} projects={projects} />
        </aside>

        {/* LISTINGS CONTENT GRID */}
        <main className="flex-1 w-full space-y-6">
          {items.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 p-10 text-center text-slate-500 bg-white space-y-3">
              <div className="font-bold text-slate-800 text-[16px]">Không tìm thấy sản phẩm nào</div>
              <p className="text-[13px] text-slate-500 max-w-md mx-auto">
                Hãy thử thay đổi hoặc đặt lại bộ lọc để tìm sản phẩm khác.
              </p>
              <div className="pt-2">
                <Link
                  href={transactionType === "RENT" ? "/listings?transactionType=RENT" : "/listings?transactionType=SALE"}
                  className="btn-primary text-[13px] px-5 py-2 inline-block"
                >
                  Xem tất cả sản phẩm
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          )}

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center gap-2 pt-6 border-t border-slate-200">
              {Array.from({ length: totalPages }).map((_, i) => {
                const p = i + 1;
                const next = new URLSearchParams(searchParams as Record<string, string>);
                next.set("page", String(p));
                return (
                  <Link
                    key={p}
                    href={`/listings?${next.toString()}`}
                    className={`rounded-lg px-3.5 py-1.5 text-[13px] font-bold transition ${
                      p === page
                        ? "bg-[#2563EB] text-white"
                        : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {p}
                  </Link>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* 4. MOBILE FILTER DRAWER MODAL */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl p-5 space-y-4 shadow-xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-[15px] font-bold text-slate-900">
                Bộ lọc tìm kiếm
              </h3>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="text-slate-400 hover:text-slate-900 font-bold"
              >
                ✕
              </button>
            </div>

            <SearchFilters
              provinces={provinces}
              projects={projects}
              onApplyMobile={() => setMobileFilterOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
