import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canViewInternalUnitCode } from "@/lib/permissions";
import ListingDetailClient from "./ListingDetailClient";

export default async function ListingDetailPage({ params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  const canSeeUnitCode = canViewInternalUnitCode(session?.user?.role);

  const rawSlug = params.slug;
  let decodedSlug = rawSlug;
  try {
    decodedSlug = decodeURIComponent(rawSlug);
  } catch (e) {}

  const rawListing = await prisma.listing.findFirst({
    where: {
      OR: [
        { slug: rawSlug },
        { slug: decodedSlug },
        { productCode: rawSlug },
        { productCode: decodedSlug },
        { unitCode: rawSlug },
        { unitCode: decodedSlug },
      ],
    },
    include: {
      project: true,
      province: true,
      district: true,
      author: { select: { name: true, phone: true } },
    },
  });

  if (!rawListing) return notFound();

  // Ẩn mã căn thực tế & tòa tầng với tài khoản CTV Pro / CTV / Khách hàng công khai
  const listing = canSeeUnitCode
    ? rawListing
    : {
        ...rawListing,
        unitCode: rawListing.productCode || rawListing.unitCode,
        block: null,
        floor: null,
      };

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
