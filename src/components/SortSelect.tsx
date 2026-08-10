"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function SortSelect({ currentSort }: { currentSort: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", e.target.value);
    params.delete("page");
    router.push(`/listings?${params.toString()}`);
  }

  return (
    <select
      value={currentSort}
      onChange={handleChange}
      className="h-[42px] px-3.5 rounded-xl border border-[#E2E8F0] bg-white text-[14px] font-medium text-[#0F172A] cursor-pointer outline-none hover:border-[#CBD5E1] transition"
    >
      <option value="newest">Mới nhất</option>
      <option value="price-asc">Giá: Thấp → Cao</option>
      <option value="price-desc">Giá: Cao → Thấp</option>
    </select>
  );
}

