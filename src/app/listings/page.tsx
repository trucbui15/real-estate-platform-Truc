import { prisma } from "@/lib/prisma";
import ListingsClient from "./ListingsClient";

import { Metadata } from "next";
import { SITE_URL } from "@/config/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Danh Sách Bất Động Sản Quy Nhơn | Minh Dũng Land",
  description: "Tra cứu giỏ hàng căn hộ chung cư, nhà phố, biệt thự bán và cho thuê tại Quy Nhơn, Bình Định.",
  alternates: {
    canonical: `${SITE_URL}/listings`,
  },
  openGraph: {
    title: "Danh Sách Bất Động Sản Quy Nhơn | Minh Dũng Land",
    description: "Tra cứu giỏ hàng căn hộ chung cư, nhà phố, biệt thự bán và cho thuê tại Quy Nhơn, Bình Định.",
    url: `${SITE_URL}/listings`,
  },
};

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const page = Math.max(1, Number(searchParams.page || 1));
  const pageSize = 12;
  const sort = searchParams.sort || "newest";
  const priceField = searchParams.transactionType === "RENT" ? "rentPrice" : "salePrice";

  const projectSlug = searchParams.project || undefined;
  const projectId = searchParams.projectId || undefined;

  const where: any = {
    unitStatus: { in: ["DANG_BAN", "DANG_CHO_THUE"] },
    ...(searchParams.transactionType ? { transactionType: searchParams.transactionType } : {}),
    ...(searchParams.propertyType ? { propertyType: searchParams.propertyType } : {}),
    ...(searchParams.provinceId ? { provinceId: searchParams.provinceId } : {}),
    ...(projectId ? { projectId } : {}),
    ...(projectSlug ? { project: { slug: projectSlug } } : {}),
    ...(searchParams.bedrooms ? { bedrooms: Number(searchParams.bedrooms) } : {}),
    ...(searchParams.direction ? { doorDirection: searchParams.direction } : {}),
    ...(searchParams.legalStatus ? { legalStatus: searchParams.legalStatus } : {}),
    ...(searchParams.furnitureStatus ? { furnitureStatus: searchParams.furnitureStatus } : {}),
    ...(searchParams.keyword
      ? {
          OR: [
            { title: { contains: searchParams.keyword, mode: "insensitive" } },
            { unitCode: { contains: searchParams.keyword, mode: "insensitive" } },
            { project: { name: { contains: searchParams.keyword, mode: "insensitive" } } },
          ],
        }
      : {}),
    ...(searchParams.minPrice || searchParams.maxPrice
      ? {
          [priceField]: {
            ...(searchParams.minPrice ? { gte: Number(searchParams.minPrice) } : {}),
            ...(searchParams.maxPrice ? { lte: Number(searchParams.maxPrice) } : {}),
          },
        }
      : {}),
    ...(searchParams.minArea || searchParams.maxArea
      ? {
          area: {
            ...(searchParams.minArea ? { gte: Number(searchParams.minArea) } : {}),
            ...(searchParams.maxArea ? { lte: Number(searchParams.maxArea) } : {}),
          },
        }
      : {}),
  };

  let orderBy: any = { updatedAt: "desc" };
  if (sort === "price-asc") {
    orderBy = { [priceField]: "asc" };
  } else if (sort === "price-desc") {
    orderBy = { [priceField]: "desc" };
  }

  let items: any[] = [];
  let total = 0;
  let provinces: any[] = [];
  let projects: any[] = [];
  let activeProject: any = null;

  try {
    const [itms, ttl, prvs, prjs, actvPrj] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: { project: true, province: true, district: true },
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.listing.count({ where }),
      prisma.province.findMany(),
      prisma.project.findMany({
        where: { isActive: true },
        select: { id: true, name: true, slug: true },
        orderBy: { name: "asc" },
      }),
      projectSlug
        ? prisma.project.findUnique({
            where: { slug: projectSlug },
            select: { id: true, name: true, slug: true },
          })
        : null,
    ]);
    items = itms;
    total = ttl;
    provinces = prvs;
    projects = prjs;
    activeProject = actvPrj;
  } catch (err) {
    console.error("Database error in listings page:", err);
  }

  const totalPages = Math.ceil(total / pageSize) || 1;

  return (
    <ListingsClient
      items={items}
      total={total}
      page={page}
      totalPages={totalPages}
      sort={sort}
      searchParams={searchParams}
      provinces={provinces}
      projects={projects}
      activeProject={activeProject}
    />
  );
}
