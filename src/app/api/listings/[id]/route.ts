export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canEditListing, canManageAllListings, isBackofficeRole } from "@/lib/permissions";
import { slugify } from "@/lib/utils";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const isBackoffice = isBackofficeRole(session?.user?.role);

  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    include: { project: true, province: true, district: true, author: { select: { name: true, phone: true } } },
  });
  if (!listing) return NextResponse.json({ error: "Không tìm thấy tin" }, { status: 404 });

  if (!isBackoffice) {
    return NextResponse.json({
      ...listing,
      unitCode: listing.productCode || listing.unitCode, // Ẩn mã căn thực tế với CTV và Khách
    });
  }

  return NextResponse.json(listing);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const existing = await prisma.listing.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Không tìm thấy tin" }, { status: 404 });

  if (!session || !canEditListing(session.user.role, existing.authorId, session.user.id)) {
    return NextResponse.json({ error: "Bạn không có quyền sửa tin này" }, { status: 403 });
  }

  const body = await req.json();

  let finalProjectId = existing.projectId;
  if (body.projectId !== undefined) {
    finalProjectId = body.projectId === "NONE" || !body.projectId ? null : body.projectId;
  }

  const propType = body.propertyType ?? existing.propertyType;
  const apartmentTypes = ["CAN_HO", "OFFICETEL", "CONDOTEL", "PENTHOUSE", "DUPLEX", "SHOPHOUSE_KHOI_DE", "DAT_NEN_DU_AN"];
  if (apartmentTypes.includes(propType) && !finalProjectId) {
    return NextResponse.json({ error: "Vui lòng chọn dự án đối với loại hình căn hộ/chung cư" }, { status: 400 });
  }

  if (finalProjectId && finalProjectId !== existing.projectId) {
    const project = await prisma.project.findUnique({ where: { id: finalProjectId } });
    if (!project) return NextResponse.json({ error: "Dự án chọn không tồn tại" }, { status: 400 });
    if (!project.isActive) return NextResponse.json({ error: "Dự án chọn đang tạm ngưng hoạt động" }, { status: 400 });
  }

  const newProductCode = (body.productCode ?? existing.productCode ?? "").trim();
  const newTitle = body.title ?? existing.title;
  const newSlug = slugify(newTitle) + "-" + slugify(newProductCode || existing.unitCode);

  const unitStatus =
    session.user.role === "STAFF" && body.unitStatus !== existing.unitStatus
      ? "CHO_DUYET"
      : body.unitStatus ?? existing.unitStatus;

  try {
    const updated = await prisma.listing.update({
      where: { id: params.id },
      data: {
        productCode: newProductCode || null,
        unitCode: body.unitCode ?? existing.unitCode,
        title: newTitle,
        slug: newSlug,
        block: body.block ?? existing.block,
        floor: body.floor ?? existing.floor,
        address: body.address ?? existing.address,
        provinceId: body.provinceId ?? existing.provinceId,
        districtId: body.districtId ?? existing.districtId,
        projectId: finalProjectId,
        transactionType: body.transactionType ?? existing.transactionType,
        salePrice: body.salePrice !== undefined ? Number(body.salePrice) || null : existing.salePrice,
        rentPrice: body.rentPrice !== undefined ? Number(body.rentPrice) || null : existing.rentPrice,
        propertyType: propType,
        area: body.area ? Number(body.area) : existing.area,
        bedrooms: body.bedrooms !== undefined ? Number(body.bedrooms) || null : existing.bedrooms,
        bathrooms: body.bathrooms !== undefined ? Number(body.bathrooms) || null : existing.bathrooms,
        doorDirection: body.doorDirection ?? existing.doorDirection,
        balconyDirection: body.balconyDirection ?? existing.balconyDirection,
        view: body.view ?? existing.view,
        furnitureStatus: body.furnitureStatus ?? existing.furnitureStatus,
        legalStatus: body.legalStatus ?? existing.legalStatus,
        unitStatus,
        description: body.description ?? existing.description,
        images: body.images ? JSON.stringify(body.images) : existing.images,
        verified: canManageAllListings(session.user.role) ? body.verified ?? existing.verified : existing.verified,
      },
      include: { project: true, province: true, district: true },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: "Mã sản phẩm hoặc mã căn bị trùng lặp hoặc dữ liệu không hợp lệ." }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const existing = await prisma.listing.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Không tìm thấy tin" }, { status: 404 });

  if (!session || !canEditListing(session.user.role, existing.authorId, session.user.id)) {
    return NextResponse.json({ error: "Bạn không có quyền xoá tin này" }, { status: 403 });
  }

  await prisma.listing.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
