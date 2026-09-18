import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import ListingCard from "@/components/ListingCard";
import HomeSearchFilters from "@/components/HomeSearchFilters";

import { Metadata } from "next";
import { SITE_URL } from "@/config/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    url: SITE_URL,
  },
};

export default async function HomePage() {
  let featured: any[] = [];
  let totalCount = 0;
  let popularProjects: any[] = [];

  try {
    const [f, t, p] = await Promise.all([
      prisma.listing.findMany({
        where: { unitStatus: { in: ["DANG_BAN", "DANG_CHO_THUE"] } },
        orderBy: [{ isHot: "desc" }, { hotAt: "desc" }, { updatedAt: "desc" }],
        take: 12,
        include: { project: true, province: true, district: true },
      }),
      prisma.listing.count({
        where: { unitStatus: { in: ["DANG_BAN", "DANG_CHO_THUE"] } },
      }),
      prisma.project.findMany({
        where: { isActive: true },
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
        take: 8,
        include: { _count: { select: { listings: true } } },
      }),
    ]);
    featured = f;
    totalCount = t;
    popularProjects = p;
  } catch (err) {
    console.error("Database connection error on homepage:", err);
  }

  return (
    <div className="space-y-8 pb-16">
      {/* 1. SEARCH BAR DIRECTLY UNDER HEADER */}
      <Suspense fallback={<div className="bg-white border-b border-[#E2E8F0] py-6 text-center text-[14px] text-[#64748B]">Đang tải tìm kiếm...</div>}>
        <HomeSearchFilters projects={popularProjects} />
      </Suspense>

      {/* 2. DỰ ÁN NỔI BẬT (FEATURED PROJECTS PILLS) */}
      {popularProjects.length > 0 && (
        <section className="container-page pt-1">
          <div className="flex items-center gap-2.5 overflow-x-auto custom-scrollbar pb-2">
            <span className="text-[13px] font-semibold text-[#64748B] shrink-0">Dự án nổi bật:</span>
            {popularProjects.map((p) => (
              <Link
                key={p.id}
                href={`/listings?project=${p.slug}`}
                className="shrink-0 inline-flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-1.5 text-[14px] font-medium text-[#0F172A] hover:border-[#0284C7] hover:text-[#0284C7] transition shadow-sm"
              >
                <span>{p.name}</span>
                {p._count.listings > 0 && (
                  <span className="rounded-md bg-[#E0F2FE] px-1.5 py-0.5 text-[12px] font-semibold text-[#0284C7]">
                    {p._count.listings}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 3. MAIN LISTINGS GRID IN FIRST FOLD */}
      <main className="container-page space-y-5">
        {/* RESULTS HEADER ROW */}
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3.5">
          <div>
            <h2 className="text-[18px] md:text-[20px] font-bold text-[#0F172A]">
              Bất động sản mới nhất
            </h2>
            <p className="text-[14px] text-[#64748B] font-normal mt-0.5">
              Có <span className="text-[#0284C7] font-bold">{totalCount}</span> bất động sản sẵn sàng giao dịch
            </p>
          </div>

          <Link href="/listings" className="text-[14px] font-semibold text-[#0284C7] hover:underline">
            Xem tất cả ➔
          </Link>
        </div>

        {/* LISTINGS GRID (3 COLUMNS DESKTOP) */}
        {featured.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#CBD5E1] p-12 text-center text-[#64748B] text-[15px] bg-white">
            Chưa có tin đăng nào.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {featured.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}

        <div className="pt-6 text-center">
          <Link href="/listings" className="btn-outline text-[14px] !px-8 shadow-sm">
            Xem thêm tất cả {totalCount} bất động sản ➔
          </Link>
        </div>
      </main>

      {/* 4. CONSIGNMENT CTA SECTION */}
      <section className="container-page pt-4">
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 md:p-8 shadow-sm">
          <div className="grid items-center gap-6 md:grid-cols-3">
            {/* <div className="md:col-span-2 space-y-2">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#E0F2FE] px-3 py-1 text-[13px] font-semibold text-[#0284C7]">
                Dịch vụ ký gửi BĐS
              </span>
              <h2 className="text-[20px] md:text-[22px] font-bold text-[#0F172A] leading-snug">
                Bạn có bất động sản cần bán hoặc cho thuê tại Quy Nhơn?
              </h2>
              <p className="text-[14px] text-[#64748B] leading-relaxed">
                Đăng ký ký gửi nhanh chóng để tiếp cận khách hàng tiềm năng cùng sự hỗ trợ pháp lý chuyên nghiệp từ Minh Dũng Land.
              </p>
            </div> */}

            <div className="md:text-right">
              {/* <Link href="/ky-gui" className="btn-primary text-[14px] w-full md:w-auto">
                Ký gửi bất động sản ngay ➔
              </Link> */}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


