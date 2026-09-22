import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isBackofficeRole } from "@/lib/permissions";
import { rateLimit } from "@/lib/rateLimit";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { uploadBufferToCloudinary, destroyCloudinaryAsset } from "@/lib/cloudinaryServer";

// Upload ảnh tin đăng — hỗ trợ Cloudinary (Cloud) & Local storage (/public/uploads)
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_SIZE = 15 * 1024 * 1024; // 15MB
const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/jpg",
  "image/pjpeg",
  "image/png",
  "image/x-png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/heic",
  "image/heif",
  "image/jfif",
  "image/bmp",
]);
const ALLOWED_EXT = new Set(["jpg", "jpeg", "png", "webp", "gif", "avif", "heic", "heif", "jfif", "bmp"]);

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !isBackofficeRole((session.user as any)?.role)) {
    return NextResponse.json({ error: "Không có quyền upload" }, { status: 403 });
  }

  const limited = rateLimit(req, "upload", { limit: 30, windowMs: 60_000 });
  if (!limited.ok) {
    return NextResponse.json(
      { error: `Upload quá nhanh, thử lại sau ${limited.retryAfterSec}s.` },
      { status: 429 }
    );
  }

  const form = await req.formData();
  const file = form.get("file") as File | null;
  const preset = (form.get("preset") as string | null) || "DEFAULT";
  if (!file) return NextResponse.json({ error: "Thiếu file" }, { status: 400 });

  const extName = (file.name.split(".").pop() || "").toLowerCase();
  const isAllowed = ALLOWED_MIME.has(file.type) || ALLOWED_EXT.has(extName) || file.type.startsWith("image/");

  if (!isAllowed) {
    return NextResponse.json({ error: "Chỉ chấp nhận các tệp định dạng hình ảnh (JPG, PNG, WEBP, HEIC...)" }, { status: 400 });
  }

  // Server-side Hard Limits:
  // - Sơ đồ căn hộ (FLOOR_PLAN): Tối đa 700 KB
  // - Các ảnh khác: Tối đa 2.5 MB (thay vì 15MB không giới hạn)
  const maxAllowedBytes = preset === "FLOOR_PLAN" ? 700 * 1024 : 2.5 * 1024 * 1024;
  if (file.size > maxAllowedBytes) {
    const limitLabel = preset === "FLOOR_PLAN" ? "700 KB (sơ đồ căn hộ)" : "2.5 MB";
    return NextResponse.json(
      { error: `Tệp ảnh vượt quá giới hạn an toàn của máy chủ (${limitLabel}). Vui lòng kiểm tra quá trình nén ảnh trước khi tải lên.` },
      { status: 400 }
    );
  }

  // 1. Tải lên Cloudinary bằng Server SDK chính thức
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (cloudName) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const result = await uploadBufferToCloudinary(buffer, {
        preset: preset === "FLOOR_PLAN" ? "FLOOR_PLAN" : "DEFAULT",
      });

      return NextResponse.json(
        {
          url: result.secure_url,
          public_id: result.public_id,
        },
        { status: 201 }
      );
    } catch (err: any) {
      console.error("Cloudinary SDK upload error:", err);
      // Nếu là lỗi validation từ Cloudinary thì trả lỗi 400 rõ ràng
      if (err.message || err.http_code) {
        return NextResponse.json(
          { error: err.message || "Lỗi xử lý tải lên từ dịch vụ Cloudinary." },
          { status: 400 }
        );
      }
    }
  }

  // 2. Nếu đang chạy trên Vercel production mà Cloudinary không khả dụng -> Báo lỗi rõ ràng
  const isVercel = Boolean(process.env.VERCEL || process.env.NEXT_PUBLIC_VERCEL_ENV);
  if (isVercel) {
    return NextResponse.json(
      {
        error:
          "Dịch vụ lưu trữ Cloudinary chưa được cấu hình thành công trên Vercel Production. Vui lòng kiểm tra biến môi trường CLOUDINARY_CLOUD_NAME & CLOUDINARY_UPLOAD_PRESET.",
      },
      { status: 500 }
    );
  }

  // 3. Lưu ổ đĩa local (Chỉ dùng cho môi trường dev local hoặc VPS có hệ thống tệp ghi được)
  try {
    await mkdir(UPLOAD_DIR, { recursive: true });

    const safeExt = extName || (file.type ? file.type.split("/")[1] : "jpg") || "jpg";
    const finalExt = safeExt === "jpeg" ? "jpg" : safeExt;
    const filename = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${finalExt}`;
    const bytes = await file.arrayBuffer();
    await writeFile(path.join(UPLOAD_DIR, filename), new Uint8Array(bytes));

    return NextResponse.json({ url: `/uploads/${filename}` }, { status: 201 });
  } catch (err: any) {
    console.error("Lỗi ghi file local storage:", err);
    return NextResponse.json(
      { error: `Không thể ghi file lên lưu trữ server (${err.message || "Lỗi lưu file"})` },
      { status: 500 }
    );
  }
}

// DELETE /api/upload — Hủy asset trên Cloudinary (Rollback orphan asset khi DB lưu thất bại)
export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !isBackofficeRole((session.user as any)?.role)) {
    return NextResponse.json({ error: "Không có quyền thao tác" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const publicId = body.public_id;
    if (!publicId) {
      return NextResponse.json({ error: "Thiếu public_id" }, { status: 400 });
    }

    const ok = await destroyCloudinaryAsset(publicId);
    return NextResponse.json({ success: ok });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Lỗi rollback asset" }, { status: 500 });
  }
}

