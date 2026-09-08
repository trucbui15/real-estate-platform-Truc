import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import NewsForm from "@/components/NewsForm";

export default async function EditNewsPage({ params }: { params: { id: string } }) {
  const article = await prisma.news.findUnique({
    where: { id: params.id },
  });

  if (!article) {
    return notFound();
  }

  return (
    <NewsForm
      isEdit={true}
      initialData={{
        id: article.id,
        title: article.title,
        slug: article.slug,
        thumbnail: article.thumbnail,
        summary: article.summary,
        category: article.category,
        tags: article.tags,
        metaTitle: article.metaTitle,
        focusKeyword: (article as any).focusKeyword || "",
        ogImage: article.ogImage,
        content: article.content,
        published: article.published,
        publishedAt: article.publishedAt,
        authorId: article.authorId,
      }}
    />
  );
}
