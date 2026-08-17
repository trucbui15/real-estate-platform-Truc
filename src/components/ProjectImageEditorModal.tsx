"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

interface ProjectImageEditorModalProps {
  project: {
    id: string;
    name: string;
    thumbnail?: string | null;
    images?: string | null;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (updatedProject: any) => void;
}

export default function ProjectImageEditorModal({
  project,
  isOpen,
  onClose,
  onSuccess,
}: ProjectImageEditorModalProps) {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (project) {
      setImageUrl(project.thumbnail || "");
      setError("");
    }
  }, [project]);

  if (!isOpen || !project) return null;

  async function handleFileSelect(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError("");

    const file = files[0];
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "h8s6hyxc";
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "minhdungland";

    let uploadedUrl = "";

    // 1. Upload trực tiếp từ Trình duyệt sang Cloudinary
    try {
      const cloudFd = new FormData();
      cloudFd.append("file", file);
      cloudFd.append("upload_preset", uploadPreset);

      const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: cloudFd,
      });

      if (cloudRes.ok) {
        const cloudData = await cloudRes.json();
        if (cloudData.secure_url) {
          uploadedUrl = cloudData.secure_url;
        }
      }
    } catch (e) {
      console.warn("Lỗi upload trực tiếp Cloudinary, fallback sang /api/upload", e);
    }

    // 2. Fallback sang /api/upload
    if (!uploadedUrl) {
      try {
        const fd = new FormData();
        fd.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: fd,
        });

        const data = await res.json();
        if (res.ok && data.url) {
          uploadedUrl = data.url;
        } else {
          setError(data.error || `Tải ảnh "${file.name}" thất bại (Mã lỗi: ${res.status})`);
        }
      } catch (err: any) {
        setError(err.message || "Lỗi kết nối khi tải ảnh lên server.");
      }
    }

    if (uploadedUrl) {
      setImageUrl(uploadedUrl);
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!project) return;
    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          thumbnail: imageUrl.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Không thể cập nhật ảnh dự án.");
        setSaving(false);
        return;
      }

      setSaving(false);
      if (onSuccess) onSuccess(data);
      router.refresh();
      onClose();
    } catch (err: any) {
      setSaving(false);
      setError(err.message || "Lỗi kết nối khi lưu ảnh dự án.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 relative">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">📷 Cập nhật Ảnh đại diện Dự án</h3>
            <p className="text-xs text-slate-500 font-medium">{project.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 font-bold p-1 text-base cursor-pointer"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-semibold">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          {/* PREVIEW KHU VỰC ẢNH */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Xem trước ảnh đại diện</label>
            <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center group">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt={project.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/logo.png";
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-4 text-center text-slate-400">
                  <svg className="w-12 h-12 stroke-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs font-semibold mt-1">Chưa có ảnh đại diện (Placeholder sạch)</span>
                </div>
              )}

              {imageUrl && (
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="absolute top-2 right-2 bg-slate-900/80 hover:bg-rose-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg transition"
                >
                  Xóa ảnh
                </button>
              )}
            </div>
          </div>

          {/* CHỌN TỆP TỪ MÁY */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">1. Tải ảnh mới từ máy tính</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={(e) => handleFileSelect(e.target.files)}
              className="input text-xs cursor-pointer"
            />
            {uploading && <p className="text-xs text-sky-600 font-bold mt-1">⏳ Đang tải ảnh lên...</p>}
          </div>

          {/* HOẶC DÁN URL */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">2. Hoặc dán đường dẫn URL ảnh ngoài</label>
            <input
              type="url"
              placeholder="https://res.cloudinary.com/..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="input font-mono text-xs"
            />
          </div>

          {/* NÚT THAO TÁC */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="btn-primary px-5 py-2 text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
            >
              {saving ? "Đang lưu..." : "Lưu thay đổi ✓"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
