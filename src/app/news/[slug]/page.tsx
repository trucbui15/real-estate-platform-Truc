import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import { getOptimizedCloudinaryUrl } from "@/lib/cloudinaryImage";
import { processArticleHtml } from "@/lib/articleProcessor";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = await prisma.news.findUnique({ where: { slug: params.slug } });
  if (!article) return { title: "Không tìm thấy bài viết - Minh Dũng Land" };

  return {
    title: `${article.metaTitle || article.title} - Minh Dũng Land`,
    description: article.summary || article.title,
    openGraph: {
      title: article.metaTitle || article.title,
      description: article.summary || article.title,
      images: article.thumbnail ? [{ url: article.thumbnail }] : [],
    },
  };
}

export default async function NewsDetailPage({ params }: { params: { slug: string } }) {
  const article = await prisma.news.findUnique({
    where: { slug: params.slug },
    include: { author: { select: { name: true } } },
  });

  if (!article || !article.published) return notFound();

  const processedContent = await processArticleHtml(article.content);

  const tagsList = article.tags
    ? article.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  return (
    <div className="container-page py-10 space-y-8">
      {/* BREADCRUMB */}
      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium overflow-x-auto">
        <Link href="/" className="hover:text-slate-900">Trang chủ</Link>
        <span>/</span>
        <Link href="/news" className="hover:text-slate-900">Tin tức</Link>
        <span>/</span>
        <span className="text-slate-900 font-bold truncate max-w-[240px]">{article.title}</span>
      </div>

      <div className="mx-auto max-w-3xl space-y-6">
        {/* CATEGORY & DATE */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {article.category && (
            <span className="rounded-full bg-blue-50 border border-blue-200 px-3 py-1 font-bold text-blue-700">
              {article.category}
            </span>
          )}
          <span className="text-slate-500">📅 Ngày đăng: {new Date(article.createdAt).toLocaleDateString("vi-VN")}</span>
          {article.author?.name && (
            <span className="text-slate-500">✍️ Tác giả: {article.author.name}</span>
          )}
        </div>

        {/* TITLE */}
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
          {article.title}
        </h1>

        {/* EXCERPT / SUMMARY */}
        {article.summary && (
          <div className="bg-slate-50 border-l-4 border-blue-600 p-4 rounded-r-xl text-sm font-semibold text-slate-700 leading-relaxed italic">
            &ldquo;{article.summary}&rdquo;
          </div>
        )}

        {/* THUMBNAIL */}
        {article.thumbnail && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 aspect-[16/9] w-full bg-slate-100">
            <img
              src={getOptimizedCloudinaryUrl(article.thumbnail, "NEWS_HERO")}
              srcSet={`${getOptimizedCloudinaryUrl(article.thumbnail, "MOBILE")} 800w, ${getOptimizedCloudinaryUrl(article.thumbnail, "GALLERY")} 1200w, ${getOptimizedCloudinaryUrl(article.thumbnail, "NEWS_HERO")} 1600w`}
              sizes="(max-width: 768px) 100vw, 800px"
              alt={article.title}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* RICH HTML ARTICLE CONTENT */}
        <article
          className="prose prose-slate max-w-none text-sm sm:text-base leading-relaxed text-slate-800 space-y-4 pt-2 border-t border-slate-100"
          dangerouslySetInnerHTML={{ __html: processedContent }}
        />

        {/* TAGS */}
        {tagsList.length > 0 && (
          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500">🏷️ Tags từ khóa:</span>
            {tagsList.map((tag, idx) => (
              <span key={idx} className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-full font-medium border border-slate-200">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* CONSULTATION BANNER CTA AT BOTTOM OF ARTICLE */}
        <div className="mt-8 bg-gradient-to-r from-slate-900 to-blue-950 text-white rounded-2xl p-6 sm:p-8 space-y-4 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1">
            <div className="text-amber-400 font-bold text-xs uppercase tracking-wider">Tư vấn BĐS Quy Nhơn</div>
            <h3 className="text-lg sm:text-xl font-bold">Bạn cần hỗ trợ ký gửi hoặc mua bán BĐS?</h3>
            <p className="text-xs text-slate-300">Đội ngũ chuyên viên Minh Dũng Land hỗ trợ tư vấn 24/7 hoàn toàn miễn phí.</p>
          </div>
          <Link
            href="/listings"
            className="btn-primary bg-amber-400 text-slate-950 hover:bg-amber-300 font-bold text-xs px-5 py-3 rounded-xl shrink-0 transition shadow-md"
          >
            Xem danh sách BĐS hot →
          </Link>
        </div>
      </div>
    </div>
  );
}
