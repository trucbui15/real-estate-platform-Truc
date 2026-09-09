import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canViewInternalUnitCode } from "@/lib/permissions";
import { formatVND } from "@/lib/utils";
import ListingDetailClient from "./ListingDetailClient";
import { SITE_URL } from "@/config/site";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const rawSlug = params.slug;
  let decodedSlug = rawSlug;
  try {
    decodedSlug = decodeURIComponent(rawSlug);
  } catch (e) {}

  const listing = await prisma.listing.findFirst({
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
    select: {
      title: true,
      description: true,
      images: true,
      transactionType: true,
      salePrice: true,
      rentPrice: true,
    },
  });

  if (!listing) return { title: "Bất động sản không tồn tại - Minh Dũng Land" };

  let firstImage = "/og-image.jpg";
  if (listing.images) {
    try {
      const parsed = JSON.parse(listing.images);
      if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === "string") {
        firstImage = parsed[0];
      }
    } catch (e) {
      if (typeof listing.images === "string" && listing.images.startsWith("http")) {
        firstImage = listing.images;
      }
    }
  }

  const priceText = formatVND(listing.transactionType === "RENT" ? listing.rentPrice : listing.salePrice);
  const description = listing.description || `${listing.title} - Giá: ${priceText}. Thông tin chi tiết tại Minh Dũng Land.`;
  const canonicalUrl = `${SITE_URL}/listings/${encodeURIComponent(params.slug)}`;

  return {
    title: `${listing.title} | Minh Dũng Land`,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${listing.title} | Minh Dũng Land`,
      description,
      url: canonicalUrl,
      images: [{ url: firstImage }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${listing.title} | Minh Dũng Land`,
      description,
      images: [firstImage],
    },
  };
}

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
