"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface HomeSearchFiltersProps {
  projects: { id: string; name: string; slug: string }[];
}

export default function HomeSearchFilters({ projects }: HomeSearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentTab = (searchParams.get("transactionType") as "SALE" | "RENT") || "SALE";
  const currentKeyword = searchParams.get("keyword") || searchParams.get("search") || "";
  const currentProject = searchParams.get("project") || "";
  const currentBedrooms = searchParams.get("bedrooms") || "";
  const currentDirection = searchParams.get("direction") || "";
  const currentMinPrice = searchParams.get("minPrice") || "";
  const currentMaxPrice = searchParams.get("maxPrice") || "";
  const currentMinArea = searchParams.get("minArea") || "";
  const currentFurniture = searchParams.get("furnitureStatus") || "";
  const currentLegal = searchParams.get("legalStatus") || "";
  const currentPropertyType = searchParams.get("propertyType") || "";

  const [query, setQuery] = useState(currentKeyword);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [extraFilterOpen, setExtraFilterOpen] = useState(false);

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase().trim())
  ).slice(0, 6);

  function updateFilter(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "ALL") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/listings?${params.toString()}`);
  }

  function handleSearch(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    params.set("transactionType", currentTab);
    if (query.trim()) {
      params.set("keyword", query.trim());
    } else {
      params.delete("keyword");
      params.delete("search");
    }
    router.push(`/listings?${params.toString()}`);
  }

  function handleSelectSuggestion(projectName: string, slug: string) {
    setQuery(projectName);
    setShowSuggestions(false);
    updateFilter("project", slug);
  }

  function resetFilters() {
    setQuery("");
    router.push("/listings");
  }

  const activeExtraCount = [currentFurniture, currentLegal, currentPropertyType, currentDirection].filter(Boolean).length;

  return (
    <div className="bg-white border-b border-[#E2E8F0] py-4 shadow-sm">
      <div className="container-page space-y-3.5">
        {/* ROW 1: TAB SWITCHER + SEARCH BAR (52-56PX DESKTOP) */}
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
          {/* Tab Switcher */}
          <div className="flex bg-[#F8FAFC] p-1 rounded-2xl border border-[#E2E8F0] shrink-0 h-[52px] md:h-[54px] w-full md:w-auto">
            <button
              type="button"
              onClick={() => updateFilter("transactionType", "SALE")}
              className={`flex-1 md:w-36 h-full text-[14px] md:text-[15px] rounded-xl font-semibold transition-all ${
                currentTab === "SALE"
                  ? "bg-white text-[#4F46E5] shadow-sm"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              Chuyển nhượng
            </button>
            <button
              type="button"
              onClick={() => updateFilter("transactionType", "RENT")}
              className={`flex-1 md:w-36 h-full text-[14px] md:text-[15px] rounded-xl font-semibold transition-all ${
                currentTab === "RENT"
                  ? "bg-white text-[#4F46E5] shadow-sm"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              Cho thuê
            </button>
          </div>

          {/* Prominent Search Bar */}
          <div className="relative flex-1">
            <div className="relative flex items-center w-full h-[52px] md:h-[54px] border border-[#E2E8F0] focus-within:border-[#4F46E5] focus-within:ring-1 focus-within:ring-[#4F46E5] rounded-2xl bg-white transition-all px-4 gap-3">
              <svg className="w-5 h-5 text-[#94A3B8] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Tìm dự án, mã căn hoặc khu vực..."
                className="w-full h-full bg-transparent outline-none text-[15px] text-[#0F172A] placeholder-[#94A3B8] font-medium"
              />
              <button
                type="submit"
                className="btn-primary !px-6 h-[40px] md:h-[42px] text-[14px] shrink-0"
              >
                Tìm kiếm
              </button>
            </div>

            {/* Autocomplete Dropdown */}
            {showSuggestions && filteredProjects.length > 0 && (
              <div className="absolute left-0 top-full mt-2 w-full bg-white rounded-2xl shadow-xl border border-[#E2E8F0] z-50 overflow-hidden">
                <div className="px-4 py-2 bg-[#F8FAFC] border-b border-[#E2E8F0] text-[12px] font-semibold text-[#64748B]">
                  Dự án gợi ý
                </div>
                {filteredProjects.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectSuggestion(p.name, p.slug)}
                    className="w-full text-left px-4 py-3 hover:bg-[#E0F2FE] hover:text-[#0284C7] transition border-b border-[#F1F5F9] last:border-none flex items-center justify-between"
                  >
                    <span className="font-semibold text-[14px] text-[#0F172A]">{p.name}</span>
                    <span className="text-[13px] text-[#64748B]">Xem chi tiết ➔</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mobile Filter Button */}
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="md:hidden flex items-center justify-center gap-2 h-[50px] bg-white border border-[#E2E8F0] rounded-2xl font-semibold text-[14px] text-[#0F172A]"
          >
            <svg className="w-5 h-5 text-[#64748B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <span>Bộ lọc nâng cao</span>
            {activeExtraCount > 0 && (
              <span className="rounded-full bg-[#0284C7] px-2 text-[12px] text-white">
                {activeExtraCount}
              </span>
            )}
          </button>
        </form>

        {/* ROW 2: DESKTOP VISIBLE FILTER CONTROLS */}
        <div className="hidden md:flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={resetFilters}
            title="Làm mới bộ lọc"
            className="shrink-0 flex items-center justify-center h-[42px] px-3.5 rounded-xl border border-[#E2E8F0] bg-white text-[#64748B] hover:text-[#EF4444] hover:border-[#FCA5A5] hover:bg-[#FEF2F2] transition text-[14px] font-medium"
          >
            🔄 Đặt lại
          </button>

          {/* Filter 1: Dự án */}
          <select
            value={currentProject}
            onChange={(e) => updateFilter("project", e.target.value)}
            className={`h-[42px] border text-[14px] font-medium rounded-xl px-3.5 outline-none transition cursor-pointer ${
              currentProject ? "border-[#4F46E5] bg-[#EEF2FF] text-[#4F46E5] font-semibold" : "border-[#E2E8F0] bg-white text-[#0F172A] hover:border-[#CBD5E1]"
            }`}
          >
            <option value="ALL">Tất cả dự án</option>
            {projects.map((p) => (
              <option key={p.id} value={p.slug}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Filter 2: Khoảng giá */}
          <select
            value={currentMaxPrice || currentMinPrice ? `${currentMinPrice}-${currentMaxPrice}` : "ALL"}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "ALL") {
                updateFilter("minPrice", null);
                updateFilter("maxPrice", null);
              } else {
                const [min, max] = val.split("-");
                updateFilter("minPrice", min || null);
                updateFilter("maxPrice", max || null);
              }
            }}
            className={`h-[42px] border text-[14px] font-medium rounded-xl px-3.5 outline-none transition cursor-pointer ${
              currentMaxPrice || currentMinPrice ? "border-[#4F46E5] bg-[#EEF2FF] text-[#4F46E5] font-semibold" : "border-[#E2E8F0] bg-white text-[#0F172A] hover:border-[#CBD5E1]"
            }`}
          >
            <option value="ALL">Khoảng giá</option>
            <option value="0-2000000000">Dưới 2 tỷ</option>
            <option value="2000000000-3000000000">2 - 3 tỷ</option>
            <option value="3000000000-5000000000">3 - 5 tỷ</option>
            <option value="5000000000-">Trên 5 tỷ</option>
          </select>

          {/* Filter 3: Số phòng ngủ */}
          <select
            value={currentBedrooms}
            onChange={(e) => updateFilter("bedrooms", e.target.value)}
            className={`h-[42px] border text-[14px] font-medium rounded-xl px-3.5 outline-none transition cursor-pointer ${
              currentBedrooms ? "border-[#4F46E5] bg-[#EEF2FF] text-[#4F46E5] font-semibold" : "border-[#E2E8F0] bg-white text-[#0F172A] hover:border-[#CBD5E1]"
            }`}
          >
            <option value="ALL">Số phòng ngủ</option>
            <option value="1">1 Phòng ngủ</option>
            <option value="2">2 Phòng ngủ</option>
            <option value="3">3 Phòng ngủ</option>
            <option value="4">4+ Phòng ngủ</option>
          </select>

          {/* Filter 4: Diện tích */}
          <select
            value={currentMinArea ? `${currentMinArea}` : "ALL"}
            onChange={(e) => updateFilter("minArea", e.target.value === "ALL" ? null : e.target.value)}
            className={`h-[42px] border text-[14px] font-medium rounded-xl px-3.5 outline-none transition cursor-pointer ${
              currentMinArea ? "border-[#4F46E5] bg-[#EEF2FF] text-[#4F46E5] font-semibold" : "border-[#E2E8F0] bg-white text-[#0F172A] hover:border-[#CBD5E1]"
            }`}
          >
            <option value="ALL">Diện tích</option>
            <option value="30">Từ 30 m²</option>
            <option value="50">Từ 50 m²</option>
            <option value="70">Từ 70 m²</option>
            <option value="100">Từ 100 m²</option>
          </select>

          {/* Filter 5: Bộ lọc thêm Toggle */}
          <button
            type="button"
            onClick={() => setExtraFilterOpen(!extraFilterOpen)}
            className={`h-[42px] border text-[14px] font-medium rounded-xl px-3.5 outline-none transition flex items-center gap-1.5 ${
              activeExtraCount > 0 ? "border-[#4F46E5] bg-[#4F46E5] text-white" : "border-[#E2E8F0] bg-white text-[#0F172A] hover:border-[#CBD5E1]"
            }`}
          >
            <span>Bộ lọc thêm</span>
            {activeExtraCount > 0 && <span className="bg-white text-[#4F46E5] rounded-full text-[12px] px-2 font-bold">{activeExtraCount}</span>}
            <span className="text-[10px]">▼</span>
          </button>
        </div>

        {/* EXTRA FILTERS COLLAPSIBLE SECTION */}
        {extraFilterOpen && (
          <div className="hidden md:grid grid-cols-3 gap-4 p-4 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0]">
            <div>
              <label className="label">Hướng ban công</label>
              <select
                value={currentDirection}
                onChange={(e) => updateFilter("direction", e.target.value)}
                className="input"
              >
                <option value="ALL">Tất cả hướng</option>
                <option value="DONG_NAM">Đông Nam</option>
                <option value="TAY_BAC">Tây Bắc</option>
                <option value="DONG">Đông</option>
                <option value="TAY">Tây</option>
                <option value="NAM">Nam</option>
                <option value="BAC">Bắc</option>
              </select>
            </div>

            <div>
              <label className="label">Tình trạng nội thất</label>
              <select
                value={currentFurniture}
                onChange={(e) => updateFilter("furnitureStatus", e.target.value)}
                className="input"
              >
                <option value="ALL">Tất cả nội thất</option>
                <option value="FULL_NOI_THAT">Full nội thất</option>
                <option value="CO_BAN">Nội thất cơ bản</option>
                <option value="BAN_GIAO_THO">Bàn giao thô</option>
                <option value="CAN_TRONG">Căn trống</option>
              </select>
            </div>

            <div>
              <label className="label">Tình trạng pháp lý</label>
              <select
                value={currentLegal}
                onChange={(e) => updateFilter("legalStatus", e.target.value)}
                className="input"
              >
                <option value="ALL">Tất cả pháp lý</option>
                <option value="SO_DO_HONG">Sổ đỏ / Sổ hồng</option>
                <option value="HOP_DONG_MUA_BAN">Hợp đồng mua bán</option>
                <option value="DANG_CHO_SO">Đang chờ sổ</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* MOBILE FILTER MODAL DRAWER */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 bg-black/50 backdrop-blur-sm md:hidden">
          <div className="bg-white rounded-t-3xl w-full p-5 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-[16px] font-bold text-[#0F172A]">Bộ lọc nâng cao</h3>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 text-[#64748B] hover:text-[#0F172A]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="label">Chọn Dự án</label>
                <select
                  value={currentProject}
                  onChange={(e) => updateFilter("project", e.target.value)}
                  className="input"
                >
                  <option value="ALL">Tất cả dự án</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.slug}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Số phòng ngủ</label>
                <select
                  value={currentBedrooms}
                  onChange={(e) => updateFilter("bedrooms", e.target.value)}
                  className="input"
                >
                  <option value="ALL">Tất cả số phòng</option>
                  <option value="1">1 Phòng ngủ</option>
                  <option value="2">2 Phòng ngủ</option>
                  <option value="3">3 Phòng ngủ</option>
                  <option value="4">4+ Phòng ngủ</option>
                </select>
              </div>

              <div>
                <label className="label">Hướng ban công</label>
                <select
                  value={currentDirection}
                  onChange={(e) => updateFilter("direction", e.target.value)}
                  className="input"
                >
                  <option value="ALL">Tất cả hướng</option>
                  <option value="DONG_NAM">Đông Nam</option>
                  <option value="TAY_BAC">Tây Bắc</option>
                  <option value="DONG">Đông</option>
                  <option value="TAY">Tây</option>
                  <option value="NAM">Nam</option>
                  <option value="BAC">Bắc</option>
                </select>
              </div>

              <div>
                <label className="label">Nội thất</label>
                <select
                  value={currentFurniture}
                  onChange={(e) => updateFilter("furnitureStatus", e.target.value)}
                  className="input"
                >
                  <option value="ALL">Tất cả nội thất</option>
                  <option value="FULL_NOI_THAT">Full nội thất</option>
                  <option value="CO_BAN">Nội thất cơ bản</option>
                  <option value="BAN_GIAO_THO">Bàn giao thô</option>
                </select>
              </div>

              <div>
                <label className="label">Pháp lý</label>
                <select
                  value={currentLegal}
                  onChange={(e) => updateFilter("legalStatus", e.target.value)}
                  className="input"
                >
                  <option value="ALL">Tất cả pháp lý</option>
                  <option value="SO_DO_HONG">Sổ đỏ / Sổ hồng</option>
                  <option value="HOP_DONG_MUA_BAN">Hợp đồng mua bán</option>
                  <option value="DANG_CHO_SO">Đang chờ sổ</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E2E8F0] flex gap-3">
              <button
                onClick={() => {
                  resetFilters();
                  setMobileFilterOpen(false);
                }}
                className="btn-outline flex-1 text-[14px]"
              >
                Đặt lại
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="btn-primary flex-1 text-[14px]"
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


