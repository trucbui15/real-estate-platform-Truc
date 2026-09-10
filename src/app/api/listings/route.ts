export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify, normalizeUnitCode } from "@/lib/utils";
import { canCreateListing, isBackofficeRole, canViewInternalUnitCode } from "@/lib/permissions";

// GET /api/listings
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const session = await getServerSession(authOptions);

  const transactionType = searchParams.get("transactionType") || undefined;
  const propertyType = searchParams.get("propertyType") || undefined;
  const provinceId = searchParams.get("provinceId") || undefined;
  const districtId = searchParams.get("districtId") || undefined;
  const projectId = searchParams.get("projectId") || undefined;
  const projectSlug = searchParams.get("project") || undefined;
  const bedrooms = searchParams.get("bedrooms");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const minArea = searchParams.get("minArea");
  const maxArea = searchParams.get("maxArea");
  const direction = searchParams.get("direction") || undefined;
  const legalStatus = searchParams.get("legalStatus") || undefined;
  const furnitureStatus = searchParams.get("furnitureStatus") || undefined;
  const keyword = searchParams.get("keyword") || undefined;
  const unitCodeParam = searchParams.get("unitCode")?.trim() || undefined;
  const isBackoffice = isBackofficeRole(session?.user?.role);
  const canSeeUnitCode = canViewInternalUnitCode(session?.user?.role);
  const showAll = searchParams.get("all") === "1" && isBackoffice;
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const limitParam = Number(searchParams.get("limit") || searchParams.get("pageSize"));
  const defaultPageSize = showAll ? 100 : 12;
  const pageSize = Math.max(1, Math.min(100, limitParam || defaultPageSize));

  const priceField = transactionType === "RENT" ? "rentPrice" : "salePrice";

  // Chuẩn hóa tìm kiếm mã căn (bỏ khoảng trắng, dấu "-", ".", "_" và chuyển lowercase)
  let matchedUnitCodeListingIds: string[] | null = null;
  if (canSeeUnitCode && unitCodeParam) {
    const norm = normalizeUnitCode(unitCodeParam);
    if (norm) {
      try {
        const matched: { id: string }[] = await prisma.$queryRaw`
          SELECT id FROM "Listing"
          WHERE REGEXP_REPLACE(LOWER("unitCode"), '[\\s\\-_.]', '', 'g') LIKE ${'%' + norm + '%'}
             OR REGEXP_REPLACE(LOWER(COALESCE("productCode", '')), '[\\s\\-_.]', '', 'g') LIKE ${'%' + norm + '%'}
        `;
        matchedUnitCodeListingIds = matched.map((m) => m.id);
      } catch (err) {
        console.error("Lỗi regex tìm kiếm mã căn:", err);
      }
    } else {
      matchedUnitCodeListingIds = [];
    }
  }

  let matchedKeywordUnitCodeIds: string[] = [];
  if (canSeeUnitCode && keyword) {
    const norm = normalizeUnitCode(keyword);
    if (norm) {
      try {
        const matched: { id: string }[] = await prisma.$queryRaw`
          SELECT id FROM "Listing"
          WHERE REGEXP_REPLACE(LOWER("unitCode"), '[\\s\\-_.]', '', 'g') LIKE ${'%' + norm + '%'}
        `;
        matchedKeywordUnitCodeIds = matched.map((m) => m.id);
      } catch (err) {
        console.error("Lỗi keyword unitCode regex:", err);
      }
    }
  }

  const where: any = {
    ...(transactionType ? { transactionType } : {}),
    ...(propertyType ? { propertyType } : {}),
    ...(provinceId ? { provinceId } : {}),
    ...(districtId ? { districtId } : {}),
    ...(projectId ? { projectId } : {}),
    ...(projectSlug ? { project: { slug: projectSlug } } : {}),
    ...(bedrooms ? { bedrooms: Number(bedrooms) } : {}),
    ...(direction ? { doorDirection: direction } : {}),
    ...(legalStatus ? { legalStatus } : {}),
    ...(furnitureStatus ? { furnitureStatus } : {}),
    ...(canSeeUnitCode && unitCodeParam && matchedUnitCodeListingIds !== null
      ? { id: { in: matchedUnitCodeListingIds } }
      : canSeeUnitCode && unitCodeParam
      ? { unitCode: { contains: unitCodeParam, mode: "insensitive" } }
      : {}),
    ...(minPrice || maxPrice
      ? {
          [priceField]: {
            ...(minPrice ? { gte: Number(minPrice) } : {}),
            ...(maxPrice ? { lte: Number(maxPrice) } : {}),
          },
        }
      : {}),
    ...(minArea || maxArea
      ? {
          area: {
            ...(minArea ? { gte: Number(minArea) } : {}),
            ...(maxArea ? { lte: Number(maxArea) } : {}),
          },
        }
      : {}),
    ...(keyword
      ? {
          OR: [
            { title: { contains: keyword, mode: "insensitive" } },
            { productCode: { contains: keyword, mode: "insensitive" } },
            ...(canSeeUnitCode ? [{ unitCode: { contains: keyword, mode: "insensitive" } }] : []),
            ...(canSeeUnitCode && matchedKeywordUnitCodeIds.length > 0
              ? [{ id: { in: matchedKeywordUnitCodeIds } }]
              : []),
            { project: { name: { contains: keyword, mode: "insensitive" } } },
          ],
        }
      : {}),
    ...(showAll
      ? {}
      : { unitStatus: { in: ["DANG_BAN", "DANG_CHO_THUE"] } }),
  };

  const [items, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      include: {
        project: true,
        province: true,
        district: true,
        author: { select: { id: true, name: true, role: true, email: true, phone: true, referralCode: true } },
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.listing.count({ where }),
  ]);

  const sanitizedItems = items.map((l) => {
    if (!canSeeUnitCode) {
      return {
        ...l,
        unitCode: l.productCode || l.unitCode, // Ẩn mã căn thật đối với CTV Pro, CTV và Khách hàng
      };
    }
    return l;
  });

  return NextResponse.json({ items: sanitizedItems, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
}

// POST /api/listings — Nhân viên và CTV Pro trở lên mới được đăng tin
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !canCreateListing(session.user.role)) {
    return NextResponse.json({ error: "Bạn không có quyền đăng tin" }, { status: 403 });
  }

  const body = await req.json();
  if (!body.unitCode || !body.title || !body.transactionType || !body.propertyType || !body.area) {
    return NextResponse.json({ error: "Thiếu thông tin bắt buộc (mã căn, tiêu đề, loại giao dịch, loại BĐS, diện tích)" }, { status: 400 });
  }

  const productCode = (body.productCode || "").trim() || `SP-${Math.floor(1000 + Math.random() * 9000)}`;

  const apartmentTypes = ["CAN_HO", "OFFICETEL", "CONDOTEL", "PENTHOUSE", "DUPLEX", "SHOPHOUSE_KHOI_DE", "DAT_NEN_DU_AN"];
  const isApartment = apartmentTypes.includes(body.propertyType);

  let finalProjectId: string | null = body.projectId && body.projectId !== "NONE" ? body.projectId : null;

  if (isApartment && !finalProjectId) {
    return NextResponse.json({ error: "Vui lòng chọn dự án đối với loại hình căn hộ/chung cư" }, { status: 400 });
  }

  if (finalProjectId) {
    const project = await prisma.project.findUnique({ where: { id: finalProjectId } });
    if (!project) {
      return NextResponse.json({ error: "Dự án chọn không tồn tại" }, { status: 400 });
    }
    if (!project.isActive) {
      return NextResponse.json({ error: "Dự án chọn đang tạm ngưng hoạt động" }, { status: 400 });
    }
    if (body.provinceId && project.provinceId && project.provinceId !== body.provinceId) {
      return NextResponse.json({ error: "Dự án chọn không thuộc tỉnh/thành phố đã chọn" }, { status: 400 });
    }
  }

  // Đường dẫn link chia sẻ (slug) tạo từ Mã Sản Phẩm thay vì Mã Căn để tránh lộ thông tin căn
  const baseSlug = slugify(body.title) + "-" + slugify(productCode);
  const initialStatus =
    session.user.role === "STAFF" || session.user.role === "COLLABORATOR_PRO"
      ? "CHO_DUYET"
      : body.unitStatus || "DANG_BAN";

  try {
    const listing = await prisma.listing.create({
      data: {
        productCode,
        unitCode: body.unitCode,
        title: body.title,
        slug: baseSlug,
        projectId: finalProjectId,
        block: body.block || null,
        floor: body.floor || null,
        address: body.address || null,
        provinceId: body.provinceId || null,
        districtId: body.districtId || null,
        transactionType: body.transactionType,
        salePrice: body.salePrice ? Number(body.salePrice) : null,
        rentPrice: body.rentPrice ? Number(body.rentPrice) : null,
        propertyType: body.propertyType,
        area: Number(body.area),
        bedrooms: body.bedrooms ? Number(body.bedrooms) : null,
        bathrooms: body.bathrooms ? Number(body.bathrooms) : null,
        doorDirection: body.doorDirection || null,
        balconyDirection: body.balconyDirection || null,
        view: body.view || null,
        furnitureStatus: body.furnitureStatus || null,
        legalStatus: body.legalStatus || null,
        unitStatus: initialStatus,
        description: body.description || null,
        images: body.images ? JSON.stringify(body.images) : null,
        authorId: session.user.id,
      },
    });
    return NextResponse.json(listing, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: "Mã sản phẩm hoặc mã căn đã tồn tại hoặc dữ liệu không hợp lệ" }, { status: 400 });
  }
}
