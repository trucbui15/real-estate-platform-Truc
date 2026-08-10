"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface Project {
  id: string;
  name: string;
  slug: string;
}

interface ListingItem {
  id: string;
  title: string;
  unitCode: string;
  slug: string;
}

export default function ProjectAutocomplete({
  initialKeyword = "",
  className = "",
}: {
  initialKeyword?: string;
  className?: string;
}) {
  const router = useRouter();
  const [keyword, setKeyword] = useState(initialKeyword);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestedProjects, setSuggestedProjects] = useState<Project[]>([]);
  const [suggestedListings, setSuggestedListings] = useState<ListingItem[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch suggestions with debouncing or when input changes
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    async function fetchSuggestions() {
      setLoading(true);
      try {
        const pUrl = `/api/projects?isActive=true&limit=6${keyword.trim() ? `&search=${encodeURIComponent(keyword.trim())}` : ""}`;
        const lUrl = keyword.trim() ? `/api/listings?keyword=${encodeURIComponent(keyword.trim())}&page=1` : null;

        const [pRes, lRes] = await Promise.all([
          fetch(pUrl),
          lUrl ? fetch(lUrl) : Promise.resolve(null),
        ]);

        if (isMounted && pRes.ok) {
          const pData = await pRes.json();
          setSuggestedProjects(Array.isArray(pData) ? pData.slice(0, 5) : []);
        }

        if (isMounted && lRes && lRes.ok) {
          const lData = await lRes.json();
          setSuggestedListings(lData.items ? lData.items.slice(0, 4) : []);
        } else if (isMounted && !lUrl) {
          setSuggestedListings([]);
        }
      } catch (err) {
        console.error("Lỗi gợi ý dự án:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    const timer = setTimeout(fetchSuggestions, 200);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [keyword, isOpen]);

  function handleProjectClick(slug: string) {
    setIsOpen(false);
    router.push(`/listings?project=${slug}`);
  }

  function handleListingClick(slug: string) {
    setIsOpen(false);
    router.push(`/listings/${slug}`);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsOpen(false);
    if (keyword.trim()) {
      router.push(`/listings?keyword=${encodeURIComponent(keyword.trim())}`);
    } else {
      router.push("/listings");
    }
  }

  return (
    <div ref={containerRef} className={`relative flex-1 ${className}`}>
      <div className="relative flex items-center">
        <input
          type="text"
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setIsOpen(false);
          }}
          placeholder="Tìm tên dự án, mã căn hoặc từ khóa..."
          className="input w-full text-brand-900 pr-8"
        />
        {keyword && (
          <button
            type="button"
            onClick={() => setKeyword("")}
            className="absolute right-3 text-sand-400 hover:text-brand-700 text-xs font-bold"
          >
            ✕
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-96 overflow-y-auto rounded-lg border border-sand-200 bg-white p-3 shadow-xl">
          {loading ? (
            <div className="py-4 text-center text-xs text-brand-400">Đang tìm kiếm dữ liệu...</div>
          ) : (
            <div className="space-y-4">
              {/* Group 1: DỰ ÁN GỢI Ý */}
              <div>
                <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-brand-400">
                  Dự án gợi ý
                </div>
                {suggestedProjects.length === 0 ? (
                  <div className="px-2 py-1 text-xs text-brand-300">Không tìm thấy dự án phù hợp</div>
                ) : (
                  <div className="space-y-1">
                    {suggestedProjects.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => handleProjectClick(p.slug)}
                        className="flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm text-brand-900 hover:bg-brand-50 hover:text-brand-600 transition"
                      >
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-brand-100 px-1.5 py-0.5 text-[10px] font-medium text-brand-700">
                            Dự án
                          </span>
                          <span className="font-medium">{p.name}</span>
                        </div>
                        <span className="text-xs text-brand-400">Xem ngay →</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Group 2: BẤT ĐỘNG SẢN (chỉ hiện khi có nhập từ khóa) */}
              {keyword.trim() !== "" && (
                <div className="border-t border-sand-100 pt-3">
                  <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-brand-400">
                    Bất động sản
                  </div>
                  {suggestedListings.length === 0 ? (
                    <div className="px-2 py-1 text-xs text-brand-300">Không tìm thấy mã căn / tin đăng</div>
                  ) : (
                    <div className="space-y-1">
                      {suggestedListings.map((l) => (
                        <div
                          key={l.id}
                          onClick={() => handleListingClick(l.slug)}
                          className="flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm text-brand-900 hover:bg-sand-100 transition"
                        >
                          <div className="truncate pr-2">
                            <span className="font-semibold text-brand-500 mr-1.5">[{l.unitCode}]</span>
                            <span>{l.title}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
