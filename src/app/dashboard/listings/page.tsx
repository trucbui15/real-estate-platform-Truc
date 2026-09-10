"use client";
import { useEffect, useState, useRef, useCallback, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { formatVND, LABELS } from "@/lib/utils";
import { canViewInternalUnitCode } from "@/lib/permissions";

function DashboardListingsContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();

  const [items, setItems] = useState<any[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  const initialUnitCode = searchParams.get("unitCode") || "";
  const [searchQuery, setSearchQuery] = useState(initialUnitCode);

  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const latestQueryRef = useRef<string>(initialUnitCode);

  const role = (session?.user as any)?.role;
  const canApprove = role === "ADMIN" || role === "MANAGER";
  const canSearchUnitCode = canViewInternalUnitCode(role);

  // Core fetch function with AbortController for race-condition prevention
  const fetchListings = useCallback(async (query: string, isInitial = false) => {
    // Abort previous in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const trimmed = query.trim();
    const queryParam = trimmed ? `&unitCode=${encodeURIComponent(trimmed)}` : "";

    // Sync URL query param without full page reload
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (trimmed) {
        params.set("unitCode", trimmed);
      } else {
        params.delete("unitCode");
      }
      const newRelativePathQuery =
        window.location.pathname + (params.toString() ? `?${params.toString()}` : "");
      window.history.replaceState(null, "", newRelativePathQuery);
    }

    try {
      const res = await fetch(`/api/listings?all=1&page=1${queryParam}`, {
        signal: controller.signal,
      });
      if (!res.ok) throw new Error("Lỗi tải danh sách tin đăng");
      const data = await res.json();

      // Only apply if this request matches the latest user input
      if (latestQueryRef.current === query) {
        setItems(data.items || []);
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("Lỗi tìm kiếm mã căn:", err);
      }
    } finally {
      if (latestQueryRef.current === query) {
        setIsSearching(false);
        if (isInitial) setInitialLoading(false);
      }
    }
  }, []);

  // Initial load
  useEffect(() => {
    if (session) {
      const currentQ = searchParams.get("unitCode") || "";
      latestQueryRef.current = currentQ;
      setSearchQuery(currentQ);
      fetchListings(currentQ, true);
    }
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [session, fetchListings]);

  // Handle realtime input change with 250ms debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    latestQueryRef.current = val;
    setIsSearching(true);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchListings(val);
    }, 250);
  };

  // Instant clear handler
  const handleClear = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setSearchQuery("");
    latestQueryRef.current = "";
    setIsSearching(true);
    fetchListings("");
  };

  async function remove(id: string) {
    if (!confirm("Xoá tin đăng này?")) return;
    await fetch(`/api/listings/${id}`, { method: "DELETE" });
    fetchListings(searchQuery);
  }

  async function setStatus(id: string, unitStatus: string) {
    await fetch(`/api/listings/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ unitStatus }),
    });
    fetchListings(searchQuery);
  }

  const hasSearchKeyword = Boolean(searchQuery.trim());

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900">Tin đăng bất động sản</h1>
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap self-start sm:self-auto">
          {canSearchUnitCode && (
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-slate-400 text-xs">
                🔎
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={handleInputChange}
                placeholder="Tìm mã căn"
                className="pl-8 pr-8 py-1.5 text-xs sm:text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-44 sm:w-56 transition placeholder:text-slate-400 font-medium"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 gap-1">
                {isSearching && (
                  <svg
                    className="animate-spin h-3.5 w-3.5 text-blue-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                )}
                {searchQuery && !isSearching && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-slate-400 hover:text-slate-600 transition text-xs cursor-pointer p-0.5"
                    title="Xóa tìm kiếm"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          )}
          <Link
            href="/dashboard/listings/new"
            className="btn-primary text-xs sm:text-sm shrink-0 self-start sm:self-auto"
          >
            + Đăng tin mới
          </Link>
        </div>
      </div>

      {/* MOBILE LISTINGS CARDS (Dành cho điện thoại < md) */}
      <div className="space-y-3 md:hidden">
        {initialLoading ? (
          <div className="card p-8 text-center text-xs text-slate-400 bg-white">Đang tải danh sách tin...</div>
        ) : items.length === 0 ? (
          <div className="card p-8 text-center text-xs text-slate-400 bg-white">
            {hasSearchKeyword ? "Không tìm thấy mã căn phù hợp." : "Chưa có tin đăng nào"}
          </div>
        ) : (
          items.map((l) => (
            <div
              key={`m-${l.id}`}
              className={`card p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3 transition-opacity duration-150 ${
                isSearching ? "opacity-60" : "opacity-100"
              }`}
            >
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div className="min-w-0">
                  <div className="text-xs font-bold text-sky-700 font-mono">
                    {l.productCode ? `Mã SP: ${l.productCode}` : `Mã căn: ${l.unitCode}`}
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mt-0.5 line-clamp-2">{l.title}</h3>
                  {l.project && (
                    <div className="text-[11px] text-slate-500 font-medium mt-0.5 truncate">🏢 {l.project.name}</div>
                  )}
                </div>
                <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700 border border-slate-200">
                  {LABELS.unitStatus[l.unitStatus as keyof typeof LABELS.unitStatus] || l.unitStatus}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Giá giao dịch</div>
                  <div className="font-bold text-sky-700 text-sm mt-0.5">
                    {formatVND(l.transactionType === "RENT" ? l.rentPrice : l.salePrice)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Người đăng</div>
                  <div className="font-semibold text-slate-800 truncate mt-0.5">👤 {l.author?.name || "Hệ thống"}</div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <div className="text-[11px] text-slate-400 font-mono">
                  {new Date(l.updatedAt).toLocaleDateString("vi-VN")}
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/dashboard/listings/${l.id}/edit`}
                    className="px-3 py-1.5 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 text-xs font-bold border border-sky-200 transition min-h-[36px] flex items-center"
                  >
                    ✏️ Sửa
                  </Link>
                  {canApprove && l.unitStatus === "CHO_DUYET" && (
                    <button
                      onClick={() => setStatus(l.id, l.transactionType === "RENT" ? "DANG_CHO_THUE" : "DANG_BAN")}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold border border-emerald-200 transition min-h-[36px] flex items-center cursor-pointer"
                    >
                      Duyệt
                    </button>
                  )}
                  <button
                    onClick={() => remove(l.id)}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold border border-rose-200 transition min-h-[36px] flex items-center cursor-pointer"
                    title="Xóa vĩnh viễn tin đăng"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* DESKTOP TABLE VIEW (Hidden on mobile) */}
      <div className="hidden md:block overflow-x-auto custom-scrollbar rounded-2xl border border-slate-200 bg-white shadow-2xs">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-600 border-b border-slate-200">
            <tr>
              <th className="px-3.5 py-3.5 min-w-[125px]">Mã SP / Mã căn</th>
              <th className="px-3.5 py-3.5 min-w-[180px]">Tiêu đề BĐS</th>
              <th className="px-3.5 py-3.5 min-w-[130px]">Người đăng tin</th>
              <th className="px-2.5 py-3.5 min-w-[85px] whitespace-nowrap">Giá</th>
              <th className="px-3 py-3.5 min-w-[135px] whitespace-nowrap">Trạng thái</th>
              <th className="px-2.5 py-3.5 min-w-[85px] whitespace-nowrap">Cập nhật</th>
              <th className="px-3.5 py-3.5 text-right min-w-[110px]">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {initialLoading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                  Đang tải danh sách tin...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                  {hasSearchKeyword ? "Không tìm thấy mã căn phù hợp." : "Chưa có tin đăng nào"}
                </td>
              </tr>
            ) : (
              items.map((l) => (
                <tr
                  key={l.id}
                  className={`hover:bg-slate-50/80 transition ${
                    isSearching ? "opacity-60" : "opacity-100"
                  }`}
                >
                  <td className="px-3.5 py-3 text-xs min-w-[125px]">
                    <div className="font-bold text-blue-700 font-mono">Mã SP: {l.productCode || "—"}</div>
                    <div className="font-semibold text-amber-700 font-mono text-[11px]">Mã căn: {l.unitCode}</div>
                  </td>
                  <td className="px-3.5 py-3 min-w-[180px]">
                    <div className="font-bold text-slate-900">{l.title}</div>
                    {l.project && (
                      <div className="text-[11px] text-slate-500 font-medium">🏢 {l.project.name}</div>
                    )}
                  </td>
                  <td className="px-3.5 py-3 text-xs min-w-[130px]">
                    <div className="font-bold text-slate-900">
                      👤 {l.author?.name || "Hệ thống"}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {l.author?.role} {l.author?.referralCode ? `· ${l.author.referralCode}` : ""}
                    </div>
                  </td>
                  <td className="px-2.5 py-3 font-semibold text-blue-700 min-w-[85px] whitespace-nowrap">
                    {formatVND(l.transactionType === "RENT" ? l.rentPrice : l.salePrice)}
                  </td>
                  <td className="px-3 py-3 min-w-[135px] whitespace-nowrap">
                    <span className="inline-block whitespace-nowrap rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 border border-slate-200">
                      {LABELS.unitStatus[l.unitStatus as keyof typeof LABELS.unitStatus] || l.unitStatus}
                    </span>
                  </td>
                  <td className="px-2.5 py-3 text-xs text-slate-500 min-w-[85px] whitespace-nowrap">
                    {new Date(l.updatedAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-3.5 py-3 text-right min-w-[110px]">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/dashboard/listings/${l.id}/edit`}
                        className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-1 rounded-lg hover:bg-blue-100 transition"
                      >
                        Sửa
                      </Link>
                      {canApprove && l.unitStatus === "CHO_DUYET" && (
                        <button
                          onClick={() => setStatus(l.id, l.transactionType === "RENT" ? "DANG_CHO_THUE" : "DANG_BAN")}
                          className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg hover:bg-emerald-100 transition cursor-pointer"
                        >
                          Duyệt
                        </button>
                      )}
                      <button
                        onClick={() => remove(l.id)}
                        className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-1 rounded-lg hover:bg-rose-100 transition cursor-pointer"
                        title="Xóa vĩnh viễn tin đăng"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function DashboardListingsPage() {
  return (
    <Suspense fallback={<div className="card p-8 text-center text-xs text-slate-400 bg-white">Đang tải...</div>}>
      <DashboardListingsContent />
    </Suspense>
  );
}
