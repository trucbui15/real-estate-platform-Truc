"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LABELS } from "@/lib/utils";

const SALE_RANGES: [string, string, number, number | undefined][] = [
  ["Dưới 2 tỷ", "sale-1", 0, 2_000_000_000],
  ["2 - 4 tỷ", "sale-2", 2_000_000_000, 4_000_000_000],
  ["4 - 6 tỷ", "sale-3", 4_000_000_000, 6_000_000_000],
  ["Trên 6 tỷ", "sale-4", 6_000_000_000, undefined],
];

const RENT_RANGES: [string, string, number, number | undefined][] = [
  ["Dưới 5 triệu", "rent-1", 0, 5_000_000],
  ["5 - 10 triệu", "rent-2", 5_000_000, 10_000_000],
  ["Trên 10 triệu", "rent-3", 10_000_000, undefined],
];

const directions = Object.entries(LABELS.direction);
const furniture = Object.entries(LABELS.furnitureStatus);
const legal = Object.entries(LABELS.legalStatus);

interface SearchFiltersProps {
  provinces: { id: string; name: string }[];
  projects?: { id: string; name: string; slug: string }[];
  onApplyMobile?: () => void;
}

export default function SearchFilters({
  provinces,
  projects = [],
  onApplyMobile,
}: SearchFiltersProps) {
  const router = useRouter();
  const params = useSearchParams();

  const [projectList, setProjectList] = useState<any[]>(projects);
  const [extraFiltersOpen, setExtraFiltersOpen] = useState(false);

  // Local form state
  const [localTransactionType, setLocalTransactionType] = useState(params.get("transactionType") || "SALE");
  const [localProject, setLocalProject] = useState(params.get("project") || "");
  const [localProvince, setLocalProvince] = useState(params.get("provinceId") || "");
  const [localMinPrice, setLocalMinPrice] = useState(params.get("minPrice") || "");
  const [localMaxPrice, setLocalMaxPrice] = useState(params.get("maxPrice") || "");
  const [localBedrooms, setLocalBedrooms] = useState(params.get("bedrooms") || "");
  const [localDirection, setLocalDirection] = useState(params.get("direction") || "");
  const [localFurniture, setLocalFurniture] = useState(params.get("furnitureStatus") || "");
  const [localLegal, setLocalLegal] = useState(params.get("legalStatus") || "");

  useEffect(() => {
    if (projects.length === 0) {
      fetch("/api/projects?isActive=true")
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => setProjectList(data))
        .catch(() => {});
    }
  }, [projects]);

  const isRent = localTransactionType === "RENT";
  const priceRanges = isRent ? RENT_RANGES : SALE_RANGES;

  const activeRangeId = (() => {
    if (!localMinPrice && !localMaxPrice) return "";
    const found = priceRanges.find(
      ([, , from, to]) => String(from) === (localMinPrice || "0") && String(to ?? "") === (localMaxPrice || "")
    );
    return found?.[1] || "";
  })();

  function applyFilters() {
    const next = new URLSearchParams(params.toString());

    if (localTransactionType) next.set("transactionType", localTransactionType);
    else next.delete("transactionType");

    if (localProject) next.set("project", localProject);
    else next.delete("project");

    if (localProvince) next.set("provinceId", localProvince);
    else next.delete("provinceId");

    if (localMinPrice) next.set("minPrice", localMinPrice);
    else next.delete("minPrice");

    if (localMaxPrice) next.set("maxPrice", localMaxPrice);
    else next.delete("maxPrice");

    if (localBedrooms) next.set("bedrooms", localBedrooms);
    else next.delete("bedrooms");

    if (localDirection) next.set("direction", localDirection);
    else next.delete("direction");

    if (localFurniture) next.set("furnitureStatus", localFurniture);
    else next.delete("furnitureStatus");

    if (localLegal) next.set("legalStatus", localLegal);
    else next.delete("legalStatus");

    next.delete("page");
    router.push(`/listings?${next.toString()}`);
    if (onApplyMobile) onApplyMobile();
  }

  function resetAll() {
    setLocalTransactionType("SALE");
    setLocalProject("");
    setLocalProvince("");
    setLocalMinPrice("");
    setLocalMaxPrice("");
    setLocalBedrooms("");
    setLocalDirection("");
    setLocalFurniture("");
    setLocalLegal("");
    router.push("/listings?transactionType=SALE");
    if (onApplyMobile) onApplyMobile();
  }

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-[15px] font-bold text-slate-900">Bộ lọc tìm kiếm</h3>
        <button
          type="button"
          onClick={resetAll}
          className="text-[12px] font-semibold text-rose-600 hover:underline"
        >
          Đặt lại
        </button>
      </div>

      {/* 1. LOẠI GIAO DỊCH */}
      <div className="space-y-1">
        <label className="text-[12px] font-semibold text-slate-600">Loại giao dịch</label>
        <div className="flex bg-slate-100 p-1 rounded-lg h-[38px]">
          {[["SALE", "Chuyển nhượng"], ["RENT", "Cho thuê"]].map(([v, l]) => (
            <button
              key={v}
              type="button"
              onClick={() => {
                setLocalTransactionType(v);
                setLocalMinPrice("");
                setLocalMaxPrice("");
              }}
              className={`flex-1 h-full text-[13px] font-semibold rounded transition-all ${
                localTransactionType === v
                  ? "bg-white text-[#2563EB] shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* 2. DỰ ÁN */}
      <div className="space-y-1">
        <label className="text-[12px] font-semibold text-slate-600">Dự án BĐS</label>
        <select
          className="w-full px-3 py-2 text-[13px] font-medium rounded-lg border border-slate-200 bg-slate-50 text-slate-900 outline-none focus:border-[#2563EB] focus:bg-white transition cursor-pointer"
          value={localProject}
          onChange={(e) => setLocalProject(e.target.value)}
        >
          <option value="">Tất cả dự án</option>
          {projectList.map((p) => (
            <option key={p.id} value={p.slug}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* 3. KHU VỰC */}
      <div className="space-y-1">
        <label className="text-[12px] font-semibold text-slate-600">Khu vực</label>
        <select
          className="w-full px-3 py-2 text-[13px] font-medium rounded-lg border border-slate-200 bg-slate-50 text-slate-900 outline-none focus:border-[#2563EB] focus:bg-white transition cursor-pointer"
          value={localProvince}
          onChange={(e) => setLocalProvince(e.target.value)}
        >
          <option value="">Tất cả khu vực</option>
          {provinces.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* 4. KHOẢNG GIÁ */}
      <div className="space-y-1">
        <label className="text-[12px] font-semibold text-slate-600">Khoảng giá</label>
        <div className="flex flex-wrap gap-1.5">
          {priceRanges.map(([label, id, from, to]) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                if (activeRangeId === id) {
                  setLocalMinPrice("");
                  setLocalMaxPrice("");
                } else {
                  setLocalMinPrice(String(from));
                  setLocalMaxPrice(to ? String(to) : "");
                }
              }}
              className={`h-[32px] px-2.5 rounded border text-[12px] font-medium transition ${
                activeRangeId === id
                  ? "border-[#0284C7] bg-blue-50 text-[#0284C7] font-semibold"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 5. SỐ PHÒNG NGỦ */}
      <div className="space-y-1">
        <label className="text-[12px] font-semibold text-slate-600">Số phòng ngủ</label>
        <div className="grid grid-cols-4 gap-1.5">
          {["1", "2", "3", "4"].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setLocalBedrooms(localBedrooms === n ? "" : n)}
              className={`h-[34px] rounded border text-[12px] font-medium transition flex items-center justify-center ${
                localBedrooms === n
                  ? "border-[#0284C7] bg-blue-50 text-[#0284C7] font-semibold"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {n === "4" ? "4+ PN" : `${n} PN`}
            </button>
          ))}
        </div>
      </div>

      {/* 6. BỘ LỌC THÊM */}
      <div className="border-t border-slate-100 pt-3">
        <button
          type="button"
          onClick={() => setExtraFiltersOpen(!extraFiltersOpen)}
          className="w-full flex items-center justify-between text-[13px] font-semibold text-[#0284C7] py-1"
        >
          <span>Bộ lọc nâng cao</span>
          <span className="text-xs">{extraFiltersOpen ? "▲" : "▼"}</span>
        </button>

        {extraFiltersOpen && (
          <div className="space-y-3 pt-3">
            <div>
              <label className="text-[12px] font-semibold text-slate-600">Hướng ban công</label>
              <select
                className="w-full px-3 py-2 text-[13px] font-medium rounded-lg border border-slate-200 bg-slate-50 text-slate-900 outline-none"
                value={localDirection}
                onChange={(e) => setLocalDirection(e.target.value)}
              >
                <option value="">Tất cả hướng</option>
                {directions.map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[12px] font-semibold text-slate-600">Nội thất</label>
              <select
                className="w-full px-3 py-2 text-[13px] font-medium rounded-lg border border-slate-200 bg-slate-50 text-slate-900 outline-none"
                value={localFurniture}
                onChange={(e) => setLocalFurniture(e.target.value)}
              >
                <option value="">Tất cả nội thất</option>
                {furniture.map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[12px] font-semibold text-slate-600">Pháp lý</label>
              <select
                className="w-full px-3 py-2 text-[13px] font-medium rounded-lg border border-slate-200 bg-slate-50 text-slate-900 outline-none"
                value={localLegal}
                onChange={(e) => setLocalLegal(e.target.value)}
              >
                <option value="">Tất cả pháp lý</option>
                {legal.map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* ACTION BUTTON */}
      <div className="pt-2">
        <button
          type="button"
          onClick={applyFilters}
          className="btn-primary w-full text-[13px] py-2 font-bold"
        >
          Áp dụng bộ lọc
        </button>
      </div>
    </div>
  );
}
