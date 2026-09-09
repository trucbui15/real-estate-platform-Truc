import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getOptimizedCloudinaryUrl } from "@/lib/cloudinaryImage";

import { SITE_URL } from "@/config/site";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Tin tức & Phân tích Thị trường Bất Động Sản Quy Nhơn - Minh Dũng Land",
  description: "Cập nhật tin tức, quy hoạch, xu hướng thị trường bất động sản Quy Nhơn và thông tin dự án mới nhất.",
  alternates: {
    canonical: `${SITE_URL}/news`,
  },
  openGraph: {
    url: `${SITE_URL}/news`,
  },
};

export default async function NewsPage() {
  let news: any[] = [];
  try {
    news = await prisma.news.findMany({
      where: { published: true },
      include: { author: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });
  } catch (err) {
    console.error("Database query error in news page:", err);
  }

  return (
    <div className="container-page py-10 space-y-8">
      {/* HEADER SECTION */}
      <div className="space-y-2 border-b border-slate-200 pb-6">
        <div className="inline-block rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-bold text-blue-700">
          📰 Bản tin Bất Động Sản
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Tin tức & Phân tích Thị trường Quy Nhơn
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl">
          Cập nhật thông tin quy hoạch, báo cáo thị trường, xu hướng đầu tư và đánh giá chi tiết các dự án BĐS hot nhất.
        </p>
      </div>

      {/* ARTICLE GRID */}
      {news.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500 bg-slate-50 space-y-2">
          <div className="text-3xl">📝</div>
          <div className="font-semibold">Chưa có bài viết tin tức nào</div>
          <div className="text-xs text-slate-400">Vui lòng quay lại sau để cập nhật bản tin mới nhất.</div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {news.map((n) => (
            <Link
              key={n.id}
              href={`/news/${n.slug}`}
              className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white hover:border-blue-600 hover:shadow-lg transition duration-200"
            >
              <div>
                {/* THUMBNAIL IMAGE */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
                  {n.thumbnail ? (
                    <img
                      src={getOptimizedCloudinaryUrl(n.thumbnail, "CARD")}
                      srcSet={`${getOptimizedCloudinaryUrl(n.thumbnail, "THUMBNAIL")} 300w, ${getOptimizedCloudinaryUrl(n.thumbnail, "CARD")} 600w`}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
                      alt={n.title}
                      loading="lazy"
                      className="h-full w-full object-cover group-hover:scale-103 transition duration-300"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-400 text-xs bg-slate-50">
                      Minh Dũng Land News
                    </div>
                  )}
                  {n.category && (
                    <div className="absolute left-3 top-3 rounded-full bg-slate-900/80 backdrop-blur px-2.5 py-0.5 text-[11px] font-bold text-white">
                      {n.category}
                    </div>
                  )}
                </div>

                {/* CONTENT */}
                <div className="p-4 space-y-2">
                  <div className="text-[12px] font-medium text-slate-400 flex items-center gap-2">
                    <span>📅 {new Date(n.createdAt).toLocaleDateString("vi-VN")}</span>
                    {n.author?.name && (
                      <>
                        <span>·</span>
                        <span>👤 {n.author.name}</span>
                      </>
                    )}
                  </div>

                  <h2 className="text-base font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition">
                    {n.title}
                  </h2>

                  {n.summary && (
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {n.summary}
                    </p>
                  )}
                </div>
              </div>

              {/* READ MORE FOOTER */}
              <div className="p-4 pt-0 text-xs font-bold text-blue-600 group-hover:translate-x-1 transition flex items-center gap-1">
                <span>Đọc bài viết</span>
                <span>→</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
