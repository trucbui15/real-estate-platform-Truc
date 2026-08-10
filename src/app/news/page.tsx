import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const news = await prisma.news.findMany({ where: { published: true }, orderBy: { createdAt: "desc" } });

  return (
    <div className="container-page py-10">
      <h1 className="font-display text-2xl font-semibold text-brand-900">Tin tức thị trường</h1>
      {news.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-sand-100 p-10 text-center text-brand-300">Chưa có bài viết nào.</div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {news.map((n) => (
            <Link key={n.id} href={`/news/${n.slug}`} className="card block p-4">
              <div className="font-display text-lg font-semibold text-brand-900">{n.title}</div>
              <div className="mt-1 text-xs text-brand-300">{new Date(n.createdAt).toLocaleDateString("vi-VN")}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
