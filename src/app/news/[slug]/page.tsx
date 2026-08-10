import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function NewsDetailPage({ params }: { params: { slug: string } }) {
  const article = await prisma.news.findUnique({ where: { slug: params.slug } });
  if (!article) return notFound();

  return (
    <div className="container-page py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-2xl font-semibold text-brand-900">{article.title}</h1>
        <div className="mt-1 text-xs text-brand-300">{new Date(article.createdAt).toLocaleDateString("vi-VN")}</div>
        <div className="mt-6 whitespace-pre-line text-sm leading-relaxed text-brand-700">{article.content}</div>
      </div>
    </div>
  );
}
