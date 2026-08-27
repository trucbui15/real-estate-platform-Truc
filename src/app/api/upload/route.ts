import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isBackofficeRole } from "@/lib/permissions";
import { rateLimit } from "@/lib/rateLimit";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

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
  if (!file) return NextResponse.json({ error: "Thiếu file" }, { status: 400 });

  const extName = (file.name.split(".").pop() || "").toLowerCase();
  const isAllowed = ALLOWED_MIME.has(file.type) || ALLOWED_EXT.has(extName) || file.type.startsWith("image/");

  if (!isAllowed) {
    return NextResponse.json({ error: "Chỉ chấp nhận các tệp định dạng hình ảnh (JPG, PNG, WEBP, HEIC...)" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Dung lượng ảnh tối đa 15MB" }, { status: 400 });
  }

  // 1. Ưu tiên Cloudinary nếu có cấu hình biến môi trường (Lưu vĩnh viễn trên Cloud)
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  
  if (cloudName && uploadPreset) {
    try {
      const cloudinaryData = new FormData();
      cloudinaryData.append("file", file);
      cloudinaryData.append("upload_preset", uploadPreset);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: cloudinaryData,
      });

      const data = await res.json();
      if (data.secure_url) {
        return NextResponse.json({ url: data.secure_url }, { status: 201 });
      }
      console.error("Cloudinary upload failed:", data);
    } catch (err) {
      console.error("Cloudinary upload error:", err);
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

