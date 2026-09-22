import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { canManageInventory } from "@/lib/permissions";
import { destroyCloudinaryAsset } from "@/lib/cloudinaryServer";

interface ImageItem {
  url: string;
  public_id?: string;
}

function parseCurrentImages(imagesField: string | null | undefined): ImageItem[] {
  if (!imagesField) return [];
  try {
    const parsed = JSON.parse(imagesField);
    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => {
          if (typeof item === "object" && item !== null && item.url) {
            return { url: String(item.url).trim(), public_id: item.public_id ? String(item.public_id).trim() : undefined };
          }
          if (typeof item === "string" && item.trim()) {
            return { url: item.trim() };
          }
          return null;
        })
        .filter(Boolean) as ImageItem[];
    }
  } catch {
    if (imagesField.trim()) return [{ url: imagesField.trim() }];
  }
  return [];
}

// PUT /api/project-inventory/[id] — Sửa căn trong Bảng Hàng (Chỉ Admin / Manager / Staff)
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !canManageInventory(session.user.role)) {
    return NextResponse.json({ error: "Bạn không có quyền thực hiện thao tác này" }, { status: 403 });
  }

  const body = await req.json();

  // Concurrency & Race Condition Protection:
  // Sử dụng Serializable Transaction + Tự động Retry khi gặp write conflict / deadlock (P2034)
  const MAX_RETRIES = 3;
  let attempt = 0;
  let assetsToDestroy: string[] = [];

  while (attempt < MAX_RETRIES) {
    try {
      attempt++;
      assetsToDestroy = []; // Reset per attempt

      const updatedItem = await prisma.$transaction(
        async (tx) => {
          const existing = await tx.projectInventory.findUnique({
            where: { id: params.id },
          });

          if (!existing) {
            throw new Error("NOT_FOUND");
          }

          // 1. Optimistic Concurrency Control (Chống Lost Update giữa 2 nhân viên khi sửa thông tin)
          if (body.originalUpdatedAt) {
            const clientTime = new Date(body.originalUpdatedAt).getTime();
            const serverTime = new Date(existing.updatedAt).getTime();
            if (Math.abs(clientTime - serverTime) > 1000) {
              throw new Error("CONCURRENCY_CONFLICT");
            }
          }

          // 2. Xử lý Ảnh theo cơ chế Nguyên tử (Atomic Operations)
          let currentList = parseCurrentImages(existing.images);
          let finalImagesJson = existing.images;

          // A. Atomic Single Add Image: { addImage: { url, public_id } } hoặc { addImage: "url" }
          if (body.addImage) {
            if (currentList.length >= 3) {
              throw new Error("MAX_3_IMAGES");
            }
            const item: ImageItem =
              typeof body.addImage === "object" && body.addImage !== null && body.addImage.url
                ? { url: String(body.addImage.url).trim(), public_id: body.addImage.public_id || undefined }
                : { url: String(body.addImage).trim(), public_id: body.public_id || undefined };

            if (!item.url) {
              throw new Error("INVALID_IMAGE");
            }
            currentList.push(item);
            finalImagesJson = JSON.stringify(currentList);
          }
          // B. Atomic Remove Image: { removeImage: "url" } hoặc { removeImage: { url, public_id } }
          else if (body.removeImage) {
            const target =
              typeof body.removeImage === "object" && body.removeImage !== null
                ? body.removeImage.public_id || body.removeImage.url
                : String(body.removeImage);

            const remaining: ImageItem[] = [];
            for (const img of currentList) {
              if (img.public_id === target || img.url === target) {
                if (img.public_id) assetsToDestroy.push(img.public_id);
              } else {
                remaining.push(img);
              }
            }
            currentList = remaining;
            finalImagesJson = JSON.stringify(currentList);
          }
          // C. Atomic Append Multiple Images
          else if (body.appendImages && Array.isArray(body.appendImages) && body.appendImages.length > 0) {
            if (currentList.length + body.appendImages.length > 3) {
              throw new Error("MAX_3_IMAGES");
            }
            const normalizedToAppend: ImageItem[] = body.appendImages.map((img: any) =>
              typeof img === "object" && img !== null && img.url
                ? { url: String(img.url).trim(), public_id: img.public_id || undefined }
                : { url: String(img).trim() }
            );
            currentList.push(...normalizedToAppend);
            finalImagesJson = JSON.stringify(currentList);
          }
          // D. Ghi đè toàn bộ mảng ảnh (kèm kiểm tra số lượng ≤ 3)
          else if (body.images !== undefined) {
            let parsedImages: ImageItem[] = [];
            if (Array.isArray(body.images)) {
              parsedImages = body.images.map((img: any) =>
                typeof img === "object" && img !== null && img.url
                  ? { url: String(img.url).trim(), public_id: img.public_id || undefined }
                  : { url: String(img).trim() }
              );
            } else if (typeof body.images === "string") {
              parsedImages = parseCurrentImages(body.images);
            }

            if (parsedImages.length > 3) {
              throw new Error("MAX_3_IMAGES");
            }
            finalImagesJson = JSON.stringify(parsedImages);
          }

          return await tx.projectInventory.update({
            where: { id: params.id },
            data: {
              ...(body.unitCode !== undefined ? { unitCode: body.unitCode.trim() } : {}),
              ...(body.block !== undefined ? { block: body.block ? body.block.trim() : null } : {}),
              ...(body.floor !== undefined ? { floor: body.floor ? body.floor.trim() : null } : {}),
              ...(body.salePrice !== undefined ? { salePrice: body.salePrice ? Number(body.salePrice) : null } : {}),
              ...(body.bedrooms !== undefined ? { bedrooms: body.bedrooms ? Number(body.bedrooms) : null } : {}),
              ...(body.bathrooms !== undefined ? { bathrooms: body.bathrooms ? Number(body.bathrooms) : null } : {}),
              ...(body.area !== undefined ? { area: Number(body.area) } : {}),
              ...(body.doorDirection !== undefined ? { doorDirection: body.doorDirection } : {}),
              ...(body.balconyDirection !== undefined ? { balconyDirection: body.balconyDirection } : {}),
              ...(body.furnitureStatus !== undefined ? { furnitureStatus: body.furnitureStatus } : {}),
              ...(body.unitStatus !== undefined ? { unitStatus: body.unitStatus } : {}),
              ...(body.description !== undefined ? { description: body.description } : {}),
              images: finalImagesJson,
            },
          });
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        }
      );

      // Khi giao dịch DB thành công, hủy các asset Cloudinary của ảnh bị xóa (nếu có)
      if (assetsToDestroy.length > 0) {
        for (const pid of assetsToDestroy) {
          destroyCloudinaryAsset(pid).catch((e) =>
            console.warn(`[Cleanup] Failed to destroy asset ${pid} on Cloudinary:`, e)
          );
        }
      }

      return NextResponse.json(updatedItem);
    } catch (err: any) {
      if (err.message === "NOT_FOUND") {
        return NextResponse.json({ error: "Sản phẩm không tồn tại" }, { status: 404 });
      }
      if (err.message === "MAX_3_IMAGES") {
        return NextResponse.json(
          { error: "Mỗi căn hộ chỉ được phép lưu tối đa 3 ảnh sơ đồ mặt bằng." },
          { status: 400 }
        );
      }
      if (err.message === "INVALID_IMAGE") {
        return NextResponse.json({ error: "Dữ liệu ảnh không hợp lệ." }, { status: 400 });
      }
      if (err.message === "CONCURRENCY_CONFLICT") {
        return NextResponse.json(
          {
            error: "Dữ liệu căn hộ đã được nhân viên khác cập nhật trước đó. Vui lòng làm mới trang để nhận thông tin mới nhất.",
            conflict: true,
          },
          { status: 409 }
        );
      }

      // Prisma P2034: Transaction failed due to a write conflict or a deadlock. Retry transaction.
      if (err.code === "P2034" && attempt < MAX_RETRIES) {
        console.warn(`[Concurrency] P2034 conflict on unit ${params.id}, retrying attempt ${attempt}...`);
        await new Promise((resolve) => setTimeout(resolve, 50 * attempt));
        continue;
      }

      return NextResponse.json({ error: err.message || "Lỗi cập nhật sản phẩm" }, { status: 500 });
    }
  }

  return NextResponse.json(
    { error: "Dữ liệu căn hộ vừa được nhân viên khác cập nhật đồng thời. Vui lòng làm mới trang và thử lại." },
    { status: 409 }
  );
}

// DELETE /api/project-inventory/[id] — Xóa căn khỏi Bảng Hàng (Chỉ Admin / Manager / Staff)
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !canManageInventory(session.user.role)) {
    return NextResponse.json({ error: "Bạn không có quyền thực hiện thao tác này" }, { status: 403 });
  }

  const existing = await prisma.projectInventory.findUnique({
    where: { id: params.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Sản phẩm không tồn tại" }, { status: 404 });
  }

  // Thu hồi và xóa sạch ảnh trên Cloudinary nếu có public_id để tránh orphan asset
  const images = parseCurrentImages(existing.images);
  for (const img of images) {
    if (img.public_id) {
      destroyCloudinaryAsset(img.public_id).catch((e) =>
        console.warn(`[Cleanup on Delete] Failed to destroy asset ${img.public_id}:`, e)
      );
    }
  }

  await prisma.projectInventory.delete({
    where: { id: params.id },
  });

  return NextResponse.json({ success: true });
}
