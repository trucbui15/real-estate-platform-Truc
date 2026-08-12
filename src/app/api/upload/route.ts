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
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

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

  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: "Chỉ chấp nhận ảnh JPG/PNG/WEBP/GIF" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Ảnh tối đa 5MB" }, { status: 400 });
  }

  // 1. Ưu tiên Cloudinary nếu có cấu hình biến môi trường (Lưu vĩnh viễn trên Cloud)
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;
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

  // 2. Lưu ổ đĩa local (dùng cho môi trường dev local hoặc chạy VPS)
  await mkdir(UPLOAD_DIR, { recursive: true });

  const ext = file.type.split("/")[1] === "jpeg" ? "jpg" : file.type.split("/")[1];
  const filename = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);

  return NextResponse.json({ url: `/uploads/${filename}` }, { status: 201 });
}

