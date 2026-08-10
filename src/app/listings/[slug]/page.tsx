import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ListingDetailClient from "./ListingDetailClient";

export default async function ListingDetailPage({ params }: { params: { slug: string } }) {
  const listing = await prisma.listing.findUnique({
    where: { slug: params.slug },
    include: {
      project: true,
      province: true,
      district: true,
      author: { select: { name: true, phone: true } },
    },
  });

  if (!listing) return notFound();

  // Increment view count
  await prisma.listing.update({
    where: { id: listing.id },
    data: { viewCount: { increment: 1 } },
  });

  // Fetch related listings in the same project or same transactionType
  const relatedListings = await prisma.listing.findMany({
    where: {
      id: { not: listing.id },
      unitStatus: { in: ["DANG_BAN", "DANG_CHO_THUE"] },
      OR: [
        { projectId: listing.projectId || undefined },
        { transactionType: listing.transactionType },
      ],
    },
    include: { project: true, province: true, district: true },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  return (
    <ListingDetailClient
      listing={listing}
      relatedListings={relatedListings}
    />
  );
}
