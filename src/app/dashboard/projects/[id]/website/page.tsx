"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { canManageProjectsAndNews, isBackofficeRole } from "@/lib/permissions";
import { compressImage, revokePreviewUrl, ImagePreset } from "@/lib/imageCompression";
import ImageUploadField from "@/components/microsite/cms/ImageUploadField";
import AmenitiesEditor from "@/components/microsite/cms/AmenitiesEditor";
import FloorPlansEditor from "@/components/microsite/cms/FloorPlansEditor";
import UnitTypesEditor from "@/components/microsite/cms/UnitTypesEditor";
import GalleryEditor from "@/components/microsite/cms/GalleryEditor";
import VideoTourEditor from "@/components/microsite/cms/VideoTourEditor";
import ProgressEditor from "@/components/microsite/cms/ProgressEditor";
import SalesPolicyEditor from "@/components/microsite/cms/SalesPolicyEditor";
import {
  normalizeAmenitiesData,
  normalizeFloorPlansData,
  normalizeUnitTypesData,
  normalizeGalleryData,
  normalizeVideoData,
  normalizeProgressData,
  normalizeSalesPolicyData,
} from "@/components/microsite/cms/normalizeSectionData";

// Danh mục mặc định 13 Sections chuẩn CMS
const DEFAULT_SECTIONS = [
  { id: "hero", title: "Hero / Banner Trang Chủ", enabled: true, order: 1 },
  { id: "overview", title: "Tổng Quan Dự Án", enabled: true, order: 2 },
  { id: "location", title: "Vị Trí & Kết Nối Giao Thông", enabled: true, order: 3 },
  { id: "amenities", title: "Hệ Thống Tiện Ích Đẳng Cấp", enabled: true, order: 4 },
  { id: "floor_plans", title: "Mặt Bằng Tầng & Khối Đế", enabled: true, order: 5 },
  { id: "unit_types", title: "Loại Căn Hộ & Thiết Kế", enabled: true, order: 6 },
  { id: "gallery", title: "Bộ Sưu Tập Ảnh Thực Tế", enabled: true, order: 7 },
  { id: "video", title: "Video Showcase & Tour 360°", enabled: true, order: 8 },
  { id: "progress", title: "Cập Nhật Tiến Độ Thi Công", enabled: true, order: 9 },
  { id: "sales_policy", title: "Chính Sách Bán Hàng & Ưu Đãi", enabled: true, order: 10 },
  { id: "documents", title: "Tài Liệu & Bảng Giá Dự Án", enabled: true, order: 11 },
  { id: "contact", title: "Form Đăng Ký & Liên Hệ", enabled: true, order: 12 },
  { id: "seo", title: "Cấu Hình SEO & Thẻ Meta", enabled: true, order: 13 },
];

export default function ProjectWebsiteCmsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const { data: session, status: authStatus } = useSession();

  const role = (session?.user as any)?.role;
  const canEdit = canManageProjectsAndNews(role);
  const isStaff = isBackofficeRole(role);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // System Metadata
  const [projectInfo, setProjectInfo] = useState<{ id: string; name: string; slug: string } | null>(null);
  const [websiteStatus, setWebsiteStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");
  const [publishedAt, setPublishedAt] = useState<string | null>(null);

  // Active Tab View in Editor
  const [activeTab, setActiveTab] = useState<string>("sections");
  const [activeSectionId, setActiveSectionId] = useState<string>("hero");

  // State Sections Config List
  const [sectionsConfig, setSectionsConfig] = useState(DEFAULT_SECTIONS);

  // State Details Content
  const [contentJson, setContentJson] = useState<any>({
    hero: {
      title: "",
      subtitle: "",
      tagLine: "",
      videoUrl: "",
      bgImage: "",
      ctaText: "Đăng ký nhận bảng giá",
      ctaLink: "#contact",
    },
    overview: {
      headline: "",
      summary: "",
      specs: [
        { label: "Vị trí", value: "" },
        { label: "Quy mô", value: "" },
        { label: "Loại hình", value: "" },
        { label: "Bàn giao", value: "" },
      ],
      descriptionHtml: "",
    },
    location: {
      address: "",
      googleMapUrl: "",
      mapImage: "",
      connectivity: [{ title: "", distance: "" }],
    },
    amenities: {
      title: "Hệ thống Tiện ích Độc bản",
      description: "",
      items: [{ name: "", image: "", desc: "" }],
    },
    floor_plans: {
      title: "Mặt bằng Tổng thể & Chi tiết",
      description: "",
      blocks: [{ name: "", image: "", desc: "", area: "" }],
    },
    unit_types: {
      title: "Căn hộ Mẫu & Thiết kế",
      description: "",
      units: [{ name: "Căn 2 Phòng Ngủ", area: "68m2", priceFrom: "2.1 tỷ", image: "" }],
    },
    gallery: {
      title: "Hình ảnh Dự án",
      description: "",
      images: [{ url: "", caption: "" }],
    },
    video: {
      title: "Video Trải Nghiệm 360°",
      videoUrl: "",
      tour360Url: "",
    },
    progress: {
      title: "Cập nhật Tiến độ Thi công",
      items: [{ date: "", title: "", image: "", desc: "" }],
    },
    sales_policy: {
      title: "Chính sách Bán hàng & Ưu đãi",
      summary: "",
      pdfUrl: "",
      promos: [""],
    },
    documents: {
      title: "Tài liệu & Hồ sơ Dự án",
      description: "Xem và tải xuống bảng giá, chính sách, hợp đồng mẫu.",
    },
    contact: {
      title: "Đăng Ký Tư Vấn & Nhận Bảng Giá Chi Tiết",
      subtitle: "Để lại thông tin để chuyên viên tư vấn hỗ trợ quý khách ngay lập tức.",
      hotline: "",
      zaloUrl: "",
      buttonText: "Gửi thông tin ngay",
    },
    seo: {
      metaTitle: "",
      metaDescription: "",
      ogImage: "",
    },
  });

  // State Modal Preview
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Load Data Website từ API Phase 1
  useEffect(() => {
    if (!projectId) return;

    async function loadData() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/projects/${projectId}/website`);
        if (!res.ok) {
          const errData = await res.json();
          setError(errData.error || "Không thể tải dữ liệu website dự án");
          setLoading(false);
          return;
        }

        const data = await res.json();
        setProjectInfo({
          id: data.projectId,
          name: data.projectName,
          slug: data.projectSlug,
        });

        if (data.hasWebsite && data.website) {
          const ws = data.website;
          setWebsiteStatus(ws.status || "DRAFT");
          setPublishedAt(ws.publishedAt || null);

          // Parse draftSectionsConfig
          if (ws.draftSectionsConfig) {
            try {
              const parsed = JSON.parse(ws.draftSectionsConfig);
              if (Array.isArray(parsed) && parsed.length > 0) {
                setSectionsConfig(parsed);
              }
            } catch (e) {
              console.error("Lỗi parse draftSectionsConfig:", e);
            }
          }

          // Parse draftContentJson
          if (ws.draftContentJson) {
            try {
              const parsedContent = JSON.parse(ws.draftContentJson);
              const normAmenities = normalizeAmenitiesData(parsedContent.amenities);
              const normFloorPlans = normalizeFloorPlansData(parsedContent.floor_plans);
              const normUnitTypes = normalizeUnitTypesData(parsedContent.unit_types);
              const normGallery = normalizeGalleryData(parsedContent.gallery);
              const normVideo = normalizeVideoData(parsedContent.video);
              const normProgress = normalizeProgressData(parsedContent.progress);
              const normSalesPolicy = normalizeSalesPolicyData(parsedContent.sales_policy);

              setContentJson((prev: any) => ({
                ...prev,
                ...parsedContent,
                amenities: normAmenities,
                floor_plans: normFloorPlans,
                unit_types: normUnitTypes,
                gallery: normGallery,
                video: normVideo,
                progress: normProgress,
                sales_policy: normSalesPolicy,
                seo: {
                  metaTitle: ws.draftMetaTitle || parsedContent.seo?.metaTitle || "",
                  metaDescription: ws.draftMetaDescription || parsedContent.seo?.metaDescription || "",
                  ogImage: ws.draftOgImage || parsedContent.seo?.ogImage || "",
                },
              }));
            } catch (e) {
              console.error("Lỗi parse draftContentJson:", e);
            }
          }
        }
      } catch (err: any) {
        setError("Lỗi kết nối máy chủ");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [projectId]);

  // Upload Ảnh Reusable via /api/upload với Tối ưu hóa preset
  async function handleFileUpload(file: File, onSuccess: (url: string) => void, preset: ImagePreset = "DEFAULT") {
    if (!file) return;
    setUploadingField("file");
    setError("");
    try {
      const optResult = await compressImage(file, preset);
      const optimizedFile = optResult.file;

      const formData = new FormData();
      formData.append("file", optimizedFile);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Tải ảnh thất bại");
      }
      onSuccess(data.url);
      setSuccess(`Upload ảnh thành công! (${optResult.formattedOriginalSize} → ${optResult.formattedOptimizedSize}, Giảm ${optResult.reductionPercent}%)`);
      revokePreviewUrl(optResult.previewUrl);
      setTimeout(() => setSuccess(""), 4000);
    } catch (err: any) {
      setError(err.message || "Không thể upload ảnh");
    } finally {
      setUploadingField(null);
    }
  }

  // Sắp xếp thứ tự Section Lên / Xuống
  function moveSection(index: number, direction: "up" | "down") {
    if (!canEdit) return;
    const newItems = [...sectionsConfig];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    // Cập nhật lại thuộc tính order
    const reordered = newItems.map((item, idx) => ({ ...item, order: idx + 1 }));
    setSectionsConfig(reordered);
  }

  // Bật / Tắt Section
  function toggleSectionEnabled(id: string) {
    if (!canEdit) return;
    setSectionsConfig((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  }

  // 1. Lưu bản nháp (Save Draft)
  async function handleSaveDraft() {
    if (!canEdit) return;
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const preparedContent = {
        ...contentJson,
        amenities: {
          ...contentJson.amenities,
          items: contentJson.amenities?.items || [],
        },
        floor_plans: {
          ...contentJson.floor_plans,
          items: contentJson.floor_plans?.items || [],
          blocks: (contentJson.floor_plans?.items || []).map((it: any) => ({
            name: it.title,
            desc: it.description,
            image: it.image,
            area: it.area,
          })),
        },
        unit_types: {
          ...contentJson.unit_types,
          items: contentJson.unit_types?.items || [],
          units: (contentJson.unit_types?.items || []).map((it: any) => ({
            name: it.title,
            area: it.area,
            priceFrom: it.priceFrom,
            image: it.image,
            description: it.description,
          })),
        },
        gallery: {
          ...contentJson.gallery,
          galleryItems: contentJson.gallery?.items || [],
          images: (contentJson.gallery?.items || []).map((it: any) => ({
            url: it.image,
            caption: it.caption,
          })),
        },
        video: {
          ...contentJson.video,
          items: contentJson.video?.items || [],
          videoUrl:
            (contentJson.video?.items || []).find((i: any) => i.type === "YOUTUBE")?.url ||
            contentJson.video?.videoUrl ||
            "",
          tour360Url:
            (contentJson.video?.items || []).find((i: any) => i.type === "TOUR_360")?.url ||
            contentJson.video?.tour360Url ||
            "",
        },
        progress: {
          ...contentJson.progress,
          items: (contentJson.progress?.items || []).map((it: any) => ({
            ...it,
            desc: it.description,
          })),
        },
        sales_policy: {
          ...contentJson.sales_policy,
          summary: contentJson.sales_policy?.description || contentJson.sales_policy?.summary || "",
          items: contentJson.sales_policy?.items || [],
          promos: (contentJson.sales_policy?.items || []).map((it: any) => it.title).filter(Boolean),
        },
      };

      const payload = {
        draftSectionsConfig: JSON.stringify(sectionsConfig),
        draftContentJson: JSON.stringify(preparedContent),
        draftMetaTitle: contentJson.seo?.metaTitle || "",
        draftMetaDescription: contentJson.seo?.metaDescription || "",
        draftOgImage: contentJson.seo?.ogImage || "",
      };

      const res = await fetch(`/api/projects/${projectId}/website`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không thể lưu bản nháp");

      setSuccess("Đã lưu bản nháp website dự án thành công!");
      setTimeout(() => setSuccess(""), 4000);
    } catch (err: any) {
      setError(err.message || "Lỗi lưu bản nháp");
    } finally {
      setSaving(false);
    }
  }

  // 2. Xuất bản (Publish)
  async function handlePublish() {
    if (!canEdit) return;
    if (!confirm("Bạn có chắc chắn muốn Xuất bản phiên bản nháp hiện tại ra website chính thức?")) return;

    setPublishing(true);
    setError("");
    setSuccess("");

    try {
      // Đầu tiên lưu nháp mới nhất
      await handleSaveDraft();

      // Gọi API Publish Phase 1
      const res = await fetch(`/api/projects/${projectId}/website/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "publish" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không thể xuất bản");

      setWebsiteStatus("PUBLISHED");
      setPublishedAt(new Date().toISOString());
      setSuccess("🎉 Xuất bản Website dự án thành công!");
    } catch (err: any) {
      setError(err.message || "Lỗi xuất bản website");
    } finally {
      setPublishing(false);
    }
  }

  // 3. Tạm ngưng xuất bản (Unpublish)
  async function handleUnpublish() {
    if (!canEdit) return;
    if (!confirm("Tạm ngưng xuất bản sẽ chuyển trạng thái về DRAFT và ẩn website khỏi danh sách tài liệu công khai. Bạn có chắc chắn?")) return;

    setPublishing(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/projects/${projectId}/website/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unpublish" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không thể ngưng xuất bản");

      setWebsiteStatus("DRAFT");
      setSuccess("Đã chuyển website về trạng thái Bản nháp (DRAFT).");
    } catch (err: any) {
      setError(err.message || "Lỗi hủy xuất bản");
    } finally {
      setPublishing(false);
    }
  }

  // Render Check Quyền Truy Cập
  if (authStatus === "loading" || loading) {
    return (
      <div className="flex h-96 items-center justify-center text-sm font-medium text-slate-500">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-600 border-t-transparent"></div>
          <span>Đang tải CMS Builder...</span>
        </div>
      </div>
    );
  }

  if (!isStaff) {
    return (
      <div className="mx-auto max-w-lg p-12 text-center">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-8 space-y-4">
          <span className="text-4xl">🚫</span>
          <h2 className="text-lg font-bold text-red-800">Không có quyền truy cập</h2>
          <p className="text-xs text-red-600">Bạn không có quyền truy cập trang quản trị CMS Website dự án này.</p>
          <Link href="/dashboard" className="btn-primary inline-block text-xs">Trở về Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* 1. HEADER CMS STATUS BAR */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-primary-600 mb-1">
              <Link href="/dashboard/projects" className="hover:underline flex items-center gap-1">
                ← Danh sách Dự án
              </Link>
              <span>/</span>
              <span>CMS Website</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
              <span>🌐</span> Quản Lý Website: <span className="text-primary-700">{projectInfo?.name}</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Slug: <code className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">{projectInfo?.slug}</code>
            </p>
          </div>

          {/* TRẠNG THÁI & NÚT THAO TÁC */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* BADGE TRẠNG THÁI */}
            <div className="flex flex-col items-end mr-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  websiteStatus === "PUBLISHED"
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : "bg-amber-100 text-amber-800 border border-amber-300"
                }`}
              >
                <span>{websiteStatus === "PUBLISHED" ? "● PUBLISHED" : "📝 DRAFT"}</span>
              </span>
              {publishedAt && (
                <span className="text-[10px] text-slate-400 mt-0.5">
                  Xuất bản: {new Date(publishedAt).toLocaleDateString("vi-VN")}
                </span>
              )}
            </div>

            {/* ACTION BUTTONS */}
            <button
              type="button"
              onClick={() => {
                if (projectInfo?.slug) {
                  window.open(`/du-an/${projectInfo.slug}/preview`, "_blank");
                } else {
                  setShowPreviewModal(true);
                }
              }}
              className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs flex items-center gap-1"
              title="Mở giao diện xem trước bản nháp (Draft Preview)"
            >
              👁️ Xem trước ↗
            </button>

            {canEdit ? (
              <>
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={saving || publishing}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition shadow-2xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  {saving ? "Đang lưu..." : "💾 Lưu nháp"}
                </button>

                {websiteStatus === "PUBLISHED" ? (
                  <button
                    type="button"
                    onClick={handleUnpublish}
                    disabled={publishing}
                    className="px-3.5 py-2 rounded-xl border border-amber-300 bg-amber-50 text-amber-800 text-xs font-bold hover:bg-amber-100 transition shadow-2xs"
                  >
                    ⏸️ Tạm ngưng
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={publishing || saving}
                  className="px-4 py-2 rounded-xl bg-primary-600 text-white text-xs font-bold hover:bg-primary-700 transition shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  {publishing ? "Đang xuất bản..." : "🚀 Xuất bản"}
                </button>
              </>
            ) : (
              <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg">
                Chế độ xem (Staff Read-Only)
              </span>
            )}
          </div>
        </div>

        {/* CẢNH BÁO / THÔNG BÁO */}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700 flex justify-between items-center font-medium">
            <span>⚠️ {error}</span>
            <button onClick={() => setError("")} className="font-bold">✕</button>
          </div>
        )}
        {success && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-700 flex justify-between items-center font-medium">
            <span>✓ {success}</span>
            <button onClick={() => setSuccess("")} className="font-bold">✕</button>
          </div>
        )}

        {/* NAVIGATION TABS */}
        <div className="flex border-b border-slate-200 gap-4 overflow-x-auto custom-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab("sections")}
            className={`pb-2.5 text-xs font-bold border-b-2 transition shrink-0 ${
              activeTab === "sections"
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            📋 Quản lý Cấu hình Sections ({sectionsConfig.filter((s) => s.enabled).length}/{sectionsConfig.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("content")}
            className={`pb-2.5 text-xs font-bold border-b-2 transition shrink-0 ${
              activeTab === "content"
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            ✍️ Chỉnh sửa Nội dung Sections
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("seo")}
            className={`pb-2.5 text-xs font-bold border-b-2 transition shrink-0 ${
              activeTab === "seo"
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            🔍 Cấu hình SEO & Thẻ Meta
          </button>
        </div>
      </div>

      {/* 2. TAB 1: SẮP XẾP VÀ BẬT/TẮT SECTIONS */}
      {activeTab === "sections" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-slate-900">Danh sách & Thứ tự hiển thị các Sections</h2>
              <p className="text-xs text-slate-500">Sử dụng các nút ↑ Lên / ↓ Xuống để sắp xếp thứ tự và công tắc để Bật/Tắt hiển thị.</p>
            </div>
            {canEdit && (
              <button
                type="button"
                onClick={handleSaveDraft}
                className="btn-primary !py-1.5 !px-3 text-xs"
              >
                Lưu thứ tự
              </button>
            )}
          </div>

          <div className="space-y-2.5">
            {sectionsConfig.map((sec, idx) => (
              <div
                key={sec.id}
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition ${
                  sec.enabled
                    ? "bg-white border-slate-200 hover:border-primary-300 shadow-2xs"
                    : "bg-slate-50 border-slate-200 opacity-60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-slate-400 w-6 text-center">
                    #{sec.order || idx + 1}
                  </span>
                  <input
                    type="checkbox"
                    checked={sec.enabled}
                    disabled={!canEdit}
                    onChange={() => toggleSectionEnabled(sec.id)}
                    className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900">{sec.title}</span>
                    <span className="ml-2 font-mono text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                      id: {sec.id}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("content");
                      setActiveSectionId(sec.id);
                    }}
                    className="px-2.5 py-1 text-xs font-semibold text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition"
                  >
                    ✏️ Sửa nội dung
                  </button>

                  {canEdit && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveSection(idx, "up")}
                        className="px-2 py-1 text-xs font-bold border rounded hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                        title="Đẩy lên trên"
                      >
                        ↑ Lên
                      </button>
                      <button
                        type="button"
                        disabled={idx === sectionsConfig.length - 1}
                        onClick={() => moveSection(idx, "down")}
                        className="px-2 py-1 text-xs font-bold border rounded hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                        title="Đẩy xuống dưới"
                      >
                        ↓ Xuống
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. TAB 2: EDIT NỘI DUNG TỪNG SECTION */}
      {activeTab === "content" && (
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 items-start">
          {/* MENU CÁC SECTION BÊN TRÁI */}
          <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-2xs space-y-1 sticky top-24">
            <div className="text-[11px] font-bold text-slate-400 px-3 py-1 uppercase">Chọn Section biên tập</div>
            {sectionsConfig.map((sec) => (
              <button
                key={sec.id}
                type="button"
                onClick={() => setActiveSectionId(sec.id)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                  activeSectionId === sec.id
                    ? "bg-primary-600 text-white shadow-2xs"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span className="truncate">{sec.title}</span>
                {!sec.enabled && <span className="text-[10px] opacity-60">Ẩn</span>}
              </button>
            ))}
          </div>

          {/* FORM BIÊN TẬP FORM CHO SECTION ĐƯỢC CHỌN */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
            {/* HERO SECTION FORM */}
            {activeSectionId === "hero" && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900 border-b pb-2">🖼️ Cấu hình Hero / Banner Trang Chủ</h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="label">Tiêu đề lớn (Headline) *</label>
                    <input
                      className="input"
                      disabled={!canEdit}
                      value={contentJson.hero?.title || ""}
                      onChange={(e) => setContentJson({ ...contentJson, hero: { ...contentJson.hero, title: e.target.value } })}
                      placeholder="VD: Căn Hộ Cao Cấp Simona Heights Quy Nhơn"
                    />
                  </div>

                  <div>
                    <label className="label">Mô tả ngắn (Subtitle)</label>
                    <textarea
                      className="input"
                      rows={2}
                      disabled={!canEdit}
                      value={contentJson.hero?.subtitle || ""}
                      onChange={(e) => setContentJson({ ...contentJson, hero: { ...contentJson.hero, subtitle: e.target.value } })}
                      placeholder="VD: Biểu tượng sống thượng lưu ngay trung tâm thành phố biển Quy Nhơn..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Tagline Nổi bật</label>
                      <input
                        className="input"
                        disabled={!canEdit}
                        value={contentJson.hero?.tagLine || ""}
                        onChange={(e) => setContentJson({ ...contentJson, hero: { ...contentJson.hero, tagLine: e.target.value } })}
                        placeholder="VD: 🏨 Đặt Phòng & Căn Hộ View Biển"
                      />
                    </div>
                    <div>
                      <label className="label">Link Video 360° / Trailer Youtube</label>
                      <input
                        className="input font-mono"
                        disabled={!canEdit}
                        value={contentJson.hero?.videoUrl || ""}
                        onChange={(e) => setContentJson({ ...contentJson, hero: { ...contentJson.hero, videoUrl: e.target.value } })}
                        placeholder="https://youtube.com/watch?v=..."
                      />
                    </div>
                  </div>

                  {/* UPLOAD HERO BG IMAGE */}
                  <div className="space-y-2">
                    <label className="label !mb-0">Ảnh Nền Hero (Background Image)</label>

                    {contentJson.hero?.bgImage && (
                      <div className="flex flex-wrap items-center gap-3 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-500 font-bold">Focus góc:</span>
                          <button
                            type="button"
                            onClick={() => setContentJson({ ...contentJson, hero: { ...contentJson.hero, bgPosition: "top" } })}
                            className={`px-2 py-0.5 rounded-lg font-bold border transition cursor-pointer ${
                              contentJson.hero?.bgPosition === "top" ? "bg-primary-600 text-white border-primary-600" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            ⬆️ Trên
                          </button>
                          <button
                            type="button"
                            onClick={() => setContentJson({ ...contentJson, hero: { ...contentJson.hero, bgPosition: "center" } })}
                            className={`px-2 py-0.5 rounded-lg font-bold border transition cursor-pointer ${
                              !contentJson.hero?.bgPosition || contentJson.hero?.bgPosition === "center"
                                ? "bg-primary-600 text-white border-primary-600"
                                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            🎯 Giữa
                          </button>
                          <button
                            type="button"
                            onClick={() => setContentJson({ ...contentJson, hero: { ...contentJson.hero, bgPosition: "bottom" } })}
                            className={`px-2 py-0.5 rounded-lg font-bold border transition cursor-pointer ${
                              contentJson.hero?.bgPosition === "bottom" ? "bg-primary-600 text-white border-primary-600" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            ⬇️ Dưới
                          </button>
                        </div>

                        <div className="h-4 w-px bg-slate-300 hidden sm:block"></div>

                        <div className="flex items-center gap-1 flex-wrap">
                          <span className="text-slate-500 font-bold">🔍 Zoom ảnh:</span>
                          {[
                            { label: "50%", val: 0.5 },
                            { label: "75%", val: 0.75 },
                            { label: "90%", val: 0.9 },
                            { label: "100%", val: 1 },
                            { label: "115%", val: 1.15 },
                            { label: "130%", val: 1.3 },
                            { label: "150%", val: 1.5 },
                          ].map((opt) => (
                            <button
                              key={opt.val}
                              type="button"
                              onClick={() => setContentJson({ ...contentJson, hero: { ...contentJson.hero, bgScale: opt.val } })}
                              className={`px-2 py-0.5 rounded-lg font-bold border transition cursor-pointer ${
                                (contentJson.hero?.bgScale || 1) === opt.val
                                  ? "bg-primary-600 text-white border-primary-600"
                                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <input
                        className="input font-mono flex-1"
                        disabled={!canEdit}
                        value={contentJson.hero?.bgImage || ""}
                        onChange={(e) => setContentJson({ ...contentJson, hero: { ...contentJson.hero, bgImage: e.target.value } })}
                        placeholder="URL ảnh hoặc chọn file để tải lên"
                      />
                      {canEdit && (
                        <label className="btn-outline !py-2 !px-3 text-xs cursor-pointer shrink-0">
                          <span>{uploadingField === "heroBg" ? "Đang tải..." : "📁 Chọn ảnh"}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleFileUpload(
                                  file,
                                  (url) => setContentJson({ ...contentJson, hero: { ...contentJson.hero, bgImage: url } }),
                                  "HERO"
                                );
                              }
                            }}
                          />
                        </label>
                      )}
                    </div>

                    {contentJson.hero?.bgImage && (
                      <div className="mt-3 relative rounded-2xl overflow-hidden border border-slate-200 shadow-xs max-h-72 bg-slate-900 flex items-center justify-center">
                        <img
                          src={contentJson.hero.bgImage}
                          alt="Hero preview"
                          style={{
                            transform: `scale(${contentJson.hero?.bgScale || 1})`,
                            transformOrigin:
                              contentJson.hero?.bgPosition === "top"
                                ? "top center"
                                : contentJson.hero?.bgPosition === "bottom"
                                ? "bottom center"
                                : "center",
                          }}
                          className={`w-full h-72 object-cover transition-transform duration-300 ${
                            contentJson.hero?.bgPosition === "top"
                              ? "object-top"
                              : contentJson.hero?.bgPosition === "bottom"
                              ? "object-bottom"
                              : "object-center"
                          }`}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* OVERVIEW SECTION FORM */}
            {activeSectionId === "overview" && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900 border-b pb-2">🏢 Tổng Quan Dự Án</h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="label">Tiêu đề đoạn giới thiệu</label>
                    <input
                      className="input"
                      disabled={!canEdit}
                      value={contentJson.overview?.headline || ""}
                      onChange={(e) => setContentJson({ ...contentJson, overview: { ...contentJson.overview, headline: e.target.value } })}
                      placeholder="VD: Tổng quan Tổ hợp Căn hộ Simona Heights"
                    />
                  </div>

                  <div>
                    <label className="label">Tóm tắt ngắn gọn</label>
                    <textarea
                      className="input"
                      rows={3}
                      disabled={!canEdit}
                      value={contentJson.overview?.summary || ""}
                      onChange={(e) => setContentJson({ ...contentJson, overview: { ...contentJson.overview, summary: e.target.value } })}
                    />
                  </div>

                  {/* BẢNG THÔNG SỐ DỰ ÁN */}
                  <div>
                    <label className="label font-bold text-slate-800">Thông số kỹ thuật chính</label>
                    <div className="space-y-2">
                      {(contentJson.overview?.specs || []).map((spec: any, idx: number) => (
                        <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                          <input
                            type="text"
                            className="input col-span-4 min-w-0"
                            disabled={!canEdit}
                            name={`spec_name_${idx}`}
                            autoComplete="one-time-code"
                            autoCorrect="off"
                            autoCapitalize="off"
                            spellCheck={false}
                            value={spec.label}
                            placeholder="Tên thông số (VD: Quy mô)"
                            onChange={(e) => {
                              const newSpecs = [...contentJson.overview.specs];
                              newSpecs[idx].label = e.target.value;
                              setContentJson({ ...contentJson, overview: { ...contentJson.overview, specs: newSpecs } });
                            }}
                          />
                          <textarea
                            rows={3}
                            className="w-full rounded-xl border border-[#BAE6FD] bg-white px-3.5 py-2.5 text-[13px] sm:text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] font-medium focus:border-[#0284C7] focus:outline-none focus:ring-2 focus:ring-[#E0F2FE] transition-all col-span-7 min-w-0 min-h-[72px] resize-y"
                            disabled={!canEdit}
                            name={`spec_val_${idx}`}
                            value={spec.value}
                            placeholder="Giá trị (VD: 2 Tòa 29 tầng...)"
                            onChange={(e) => {
                              const newSpecs = [...contentJson.overview.specs];
                              newSpecs[idx].value = e.target.value;
                              setContentJson({ ...contentJson, overview: { ...contentJson.overview, specs: newSpecs } });
                            }}
                          />
                          {canEdit && (
                            <button
                              type="button"
                              onClick={() => {
                                const newSpecs = contentJson.overview.specs.filter((_: any, i: number) => i !== idx);
                                setContentJson({ ...contentJson, overview: { ...contentJson.overview, specs: newSpecs } });
                              }}
                              className="col-span-1 flex justify-center text-red-500 font-bold px-2 py-2 hover:bg-red-50 rounded cursor-pointer"
                              title="Xóa thông số này"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => {
                            const newSpecs = [...(contentJson.overview?.specs || []), { label: "", value: "" }];
                            setContentJson({ ...contentJson, overview: { ...contentJson.overview, specs: newSpecs } });
                          }}
                          className="text-xs font-bold text-primary-600 hover:underline"
                        >
                          + Thêm thông số
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* LOCATION SECTION FORM */}
            {activeSectionId === "location" && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900 border-b pb-2">📍 Vị Trí & Kết Nối Giao Thông</h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="label">Địa chỉ chính xác</label>
                    <input
                      className="input"
                      disabled={!canEdit}
                      value={contentJson.location?.address || ""}
                      onChange={(e) => setContentJson({ ...contentJson, location: { ...contentJson.location, address: e.target.value } })}
                    />
                  </div>

                  <div>
                    <label className="label">Đường dẫn Google Maps Embed URL</label>
                    <input
                      className="input font-mono"
                      disabled={!canEdit}
                      value={contentJson.location?.googleMapUrl || ""}
                      onChange={(e) => setContentJson({ ...contentJson, location: { ...contentJson.location, googleMapUrl: e.target.value } })}
                      placeholder="https://www.google.com/maps/embed?pb=..."
                    />
                  </div>

                  <div>
                    <label className="label">Ảnh Sơ đồ vị trí</label>
                    <div className="flex gap-2">
                      <input
                        className="input font-mono flex-1"
                        disabled={!canEdit}
                        value={contentJson.location?.mapImage || ""}
                        onChange={(e) => setContentJson({ ...contentJson, location: { ...contentJson.location, mapImage: e.target.value } })}
                      />
                      {canEdit && (
                        <label className="btn-outline !py-2 !px-3 text-xs cursor-pointer shrink-0">
                          <span>📁 Chọn ảnh sơ đồ</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleFileUpload(
                                  file,
                                  (url) => setContentJson({ ...contentJson, location: { ...contentJson.location, mapImage: url } }),
                                  "FLOOR_PLAN"
                                );
                              }
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* AMENITIES SECTION FORM */}
            {activeSectionId === "amenities" && (
              <AmenitiesEditor
                title={contentJson.amenities?.title || ""}
                onTitleChange={(title) => setContentJson({ ...contentJson, amenities: { ...contentJson.amenities, title } })}
                description={contentJson.amenities?.description || ""}
                onDescriptionChange={(description) => setContentJson({ ...contentJson, amenities: { ...contentJson.amenities, description } })}
                items={contentJson.amenities?.items || []}
                onItemsChange={(items) => setContentJson({ ...contentJson, amenities: { ...contentJson.amenities, items } })}
                projectName={projectInfo?.name || "Dự án"}
                disabled={!canEdit}
              />
            )}

            {/* FLOOR PLANS SECTION FORM */}
            {activeSectionId === "floor_plans" && (
              <FloorPlansEditor
                title={contentJson.floor_plans?.title || ""}
                onTitleChange={(title) => setContentJson({ ...contentJson, floor_plans: { ...contentJson.floor_plans, title } })}
                description={contentJson.floor_plans?.description || ""}
                onDescriptionChange={(description) => setContentJson({ ...contentJson, floor_plans: { ...contentJson.floor_plans, description } })}
                items={contentJson.floor_plans?.items || []}
                onItemsChange={(items) => setContentJson({ ...contentJson, floor_plans: { ...contentJson.floor_plans, items } })}
                projectName={projectInfo?.name || "Dự án"}
                disabled={!canEdit}
              />
            )}

            {/* UNIT TYPES SECTION FORM */}
            {activeSectionId === "unit_types" && (
              <UnitTypesEditor
                title={contentJson.unit_types?.title || ""}
                onTitleChange={(title) => setContentJson({ ...contentJson, unit_types: { ...contentJson.unit_types, title } })}
                description={contentJson.unit_types?.description || ""}
                onDescriptionChange={(description) => setContentJson({ ...contentJson, unit_types: { ...contentJson.unit_types, description } })}
                items={contentJson.unit_types?.items || []}
                onItemsChange={(items) => setContentJson({ ...contentJson, unit_types: { ...contentJson.unit_types, items } })}
                projectName={projectInfo?.name || "Dự án"}
                disabled={!canEdit}
              />
            )}

            {/* GALLERY SECTION FORM */}
            {activeSectionId === "gallery" && (
              <GalleryEditor
                title={contentJson.gallery?.title || ""}
                onTitleChange={(title) => setContentJson({ ...contentJson, gallery: { ...contentJson.gallery, title } })}
                description={contentJson.gallery?.description || ""}
                onDescriptionChange={(description) => setContentJson({ ...contentJson, gallery: { ...contentJson.gallery, description } })}
                items={contentJson.gallery?.items || []}
                onItemsChange={(items) => setContentJson({ ...contentJson, gallery: { ...contentJson.gallery, items } })}
                projectName={projectInfo?.name || "Dự án"}
                disabled={!canEdit}
              />
            )}

            {/* VIDEO & TOUR 360 SECTION FORM */}
            {activeSectionId === "video" && (
              <VideoTourEditor
                title={contentJson.video?.title || ""}
                onTitleChange={(title) => setContentJson({ ...contentJson, video: { ...contentJson.video, title } })}
                description={contentJson.video?.description || ""}
                onDescriptionChange={(description) => setContentJson({ ...contentJson, video: { ...contentJson.video, description } })}
                items={contentJson.video?.items || []}
                onItemsChange={(items) => setContentJson({ ...contentJson, video: { ...contentJson.video, items } })}
                projectName={projectInfo?.name || "Dự án"}
                disabled={!canEdit}
              />
            )}

            {/* PROGRESS SECTION FORM */}
            {activeSectionId === "progress" && (
              <ProgressEditor
                title={contentJson.progress?.title || ""}
                onTitleChange={(title) => setContentJson({ ...contentJson, progress: { ...contentJson.progress, title } })}
                description={contentJson.progress?.description || ""}
                onDescriptionChange={(description) => setContentJson({ ...contentJson, progress: { ...contentJson.progress, description } })}
                items={contentJson.progress?.items || []}
                onItemsChange={(items) => setContentJson({ ...contentJson, progress: { ...contentJson.progress, items } })}
                projectName={projectInfo?.name || "Dự án"}
                disabled={!canEdit}
              />
            )}

            {/* SALES POLICY SECTION FORM */}
            {activeSectionId === "sales_policy" && (
              <SalesPolicyEditor
                title={contentJson.sales_policy?.title || ""}
                onTitleChange={(title) => setContentJson({ ...contentJson, sales_policy: { ...contentJson.sales_policy, title } })}
                description={contentJson.sales_policy?.description || contentJson.sales_policy?.summary || ""}
                onDescriptionChange={(description) => setContentJson({ ...contentJson, sales_policy: { ...contentJson.sales_policy, description, summary: description } })}
                pdfUrl={contentJson.sales_policy?.pdfUrl || ""}
                onPdfUrlChange={(pdfUrl) => setContentJson({ ...contentJson, sales_policy: { ...contentJson.sales_policy, pdfUrl } })}
                items={contentJson.sales_policy?.items || []}
                onItemsChange={(items) => setContentJson({ ...contentJson, sales_policy: { ...contentJson.sales_policy, items } })}
                projectName={projectInfo?.name || "Dự án"}
                disabled={!canEdit}
              />
            )}

            {/* DOCUMENTS SECTION GUIDANCE FORM */}
            {activeSectionId === "documents" && (
              <div className="space-y-4 text-xs">
                <h3 className="text-base font-bold text-slate-900 border-b pb-2">📁 Tài Liệu & Bảng Giá Dự Án</h3>
                <div>
                  <label className="label">Tiêu đề Section Tài liệu</label>
                  <input
                    type="text"
                    className="input text-xs"
                    disabled={!canEdit}
                    value={contentJson.documents?.title || ""}
                    onChange={(e) => setContentJson({ ...contentJson, documents: { ...contentJson.documents, title: e.target.value } })}
                    placeholder="VD: Tài liệu & Hồ sơ Dự án"
                  />
                </div>
                <div>
                  <label className="label">Mô tả Section</label>
                  <input
                    type="text"
                    className="input text-xs"
                    disabled={!canEdit}
                    value={contentJson.documents?.description || ""}
                    onChange={(e) => setContentJson({ ...contentJson, documents: { ...contentJson.documents, description: e.target.value } })}
                    placeholder="VD: Xem và tải xuống bảng giá, chính sách, hợp đồng mẫu."
                  />
                </div>
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1.5">
                  <p className="font-bold">ℹ️ Dữ liệu tài liệu được đồng bộ từ Kho Tài Liệu Dự Án (Project Resources):</p>
                  <p className="text-slate-600">
                    Hệ thống sẽ tự động hiển thị các tài liệu, hồ sơ pháp lý, bảng giá có trạng thái <strong>Công khai (Public)</strong> của dự án.
                  </p>
                  <Link
                    href={`/dashboard/projects`}
                    className="inline-block mt-1 text-blue-600 font-bold hover:underline"
                  >
                    Quản lý danh sách tài liệu tại trang Quản lý Dự án &rarr;
                  </Link>
                </div>
              </div>
            )}

            {/* CONTACT SECTION FORM */}
            {activeSectionId === "contact" && (
              <div className="space-y-4 text-xs">
                <h3 className="text-base font-bold text-slate-900 border-b pb-2">📞 Form Đăng Ký & Liên Hệ Tư Vấn</h3>
                <div>
                  <label className="label">Tiêu đề Form</label>
                  <input
                    type="text"
                    className="input text-xs"
                    disabled={!canEdit}
                    value={contentJson.contact?.title || ""}
                    onChange={(e) => setContentJson({ ...contentJson, contact: { ...contentJson.contact, title: e.target.value } })}
                    placeholder="VD: Đăng Ký Tư Vấn & Nhận Bảng Giá Chi Tiết"
                  />
                </div>
                <div>
                  <label className="label">Mô tả phụ / Lời kêu gọi</label>
                  <input
                    type="text"
                    className="input text-xs"
                    disabled={!canEdit}
                    value={contentJson.contact?.subtitle || ""}
                    onChange={(e) => setContentJson({ ...contentJson, contact: { ...contentJson.contact, subtitle: e.target.value } })}
                    placeholder="VD: Để lại thông tin để chuyên viên tư vấn hỗ trợ quý khách ngay lập tức."
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="label">Hotline hỗ trợ riêng (Tùy chọn)</label>
                    <input
                      type="text"
                      className="input text-xs font-mono"
                      disabled={!canEdit}
                      value={contentJson.contact?.hotline || ""}
                      onChange={(e) => setContentJson({ ...contentJson, contact: { ...contentJson.contact, hotline: e.target.value } })}
                      placeholder="VD: 0905.xxx.xxx"
                    />
                  </div>
                  <div>
                    <label className="label">Link Zalo tư vấn (Tùy chọn)</label>
                    <input
                      type="text"
                      className="input text-xs font-mono"
                      disabled={!canEdit}
                      value={contentJson.contact?.zaloUrl || ""}
                      onChange={(e) => setContentJson({ ...contentJson, contact: { ...contentJson.contact, zaloUrl: e.target.value } })}
                      placeholder="https://zalo.me/..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* DEFAULT OTHER SECTIONS FALLBACK GENERIC INPUTS */}
            {!["hero", "overview", "location", "amenities", "floor_plans", "unit_types", "gallery", "video", "progress", "sales_policy", "documents", "contact", "seo"].includes(activeSectionId) && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900 border-b pb-2">
                  ⚙️ Cấu hình Section: {sectionsConfig.find((s) => s.id === activeSectionId)?.title}
                </h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="label">Tiêu đề hiển thị Section</label>
                    <input
                      className="input"
                      disabled={!canEdit}
                      value={contentJson[activeSectionId]?.title || ""}
                      onChange={(e) =>
                        setContentJson({
                          ...contentJson,
                          [activeSectionId]: { ...contentJson[activeSectionId], title: e.target.value },
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="label">Mô tả ngắn / Ghi chú</label>
                    <textarea
                      className="input"
                      rows={3}
                      disabled={!canEdit}
                      value={contentJson[activeSectionId]?.description || contentJson[activeSectionId]?.summary || ""}
                      onChange={(e) =>
                        setContentJson({
                          ...contentJson,
                          [activeSectionId]: { ...contentJson[activeSectionId], description: e.target.value },
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. TAB 3: CẤU HÌNH SEO & META TAGS */}
      {activeTab === "seo" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b pb-2">🔍 Thẻ Meta & Cấu hình SEO Trang Website Dự Án</h2>
          <div className="space-y-3 text-xs max-w-2xl">
            <div>
              <label className="label">Meta Title (Tiêu đề SEO)</label>
              <input
                className="input"
                disabled={!canEdit}
                value={contentJson.seo?.metaTitle || ""}
                onChange={(e) => setContentJson({ ...contentJson, seo: { ...contentJson.seo, metaTitle: e.target.value } })}
                placeholder="VD: Căn hộ Simona Heights Quy Nhơn | Bảng giá Chủ đầu tư"
              />
              <span className="text-[10px] text-slate-400">Độ dài tối ưu 50-60 ký tự</span>
            </div>

            <div>
              <label className="label">Meta Description (Mô tả SEO)</label>
              <textarea
                className="input"
                rows={3}
                disabled={!canEdit}
                value={contentJson.seo?.metaDescription || ""}
                onChange={(e) => setContentJson({ ...contentJson, seo: { ...contentJson.seo, metaDescription: e.target.value } })}
                placeholder="Thông tin dự án căn hộ cao cấp Simona Heights Quy Nhơn, vị trí đắt giá..."
              />
            </div>

            <div>
              <label className="label">Ảnh Chia Sẻ Mạng Xã Hội (OG Image)</label>
              <div className="flex gap-2">
                <input
                  className="input font-mono flex-1"
                  disabled={!canEdit}
                  value={contentJson.seo?.ogImage || ""}
                  onChange={(e) => setContentJson({ ...contentJson, seo: { ...contentJson.seo, ogImage: e.target.value } })}
                />
                {canEdit && (
                  <label className="btn-outline !py-2 !px-3 text-xs cursor-pointer shrink-0">
                    <span>📁 Tải OG Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(
                            file,
                            (url) => setContentJson({ ...contentJson, seo: { ...contentJson.seo, ogImage: url } }),
                            "THUMBNAIL"
                          );
                        }
                      }}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* TRACKING & ANALYTICS SECTION */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <h3 className="text-sm font-bold text-slate-800">📊 Đo Lường & Mã Tracking Quảng Cáo</h3>

              <div>
                <label className="label">Mã Google Analytics 4 (GA4 ID)</label>
                <input
                  className="input font-mono"
                  disabled={!canEdit}
                  value={contentJson.seo?.gaId || ""}
                  onChange={(e) => setContentJson({ ...contentJson, seo: { ...contentJson.seo, gaId: e.target.value } })}
                  placeholder="VD: G-XXXXXXXXXX"
                />
                <span className="text-[10px] text-slate-400">Đo lường lượt truy cập, khu vực địa lý, thời gian ở lại trang.</span>
              </div>

              <div>
                <label className="label">Mã Facebook Pixel ID (Meta Pixel)</label>
                <input
                  className="input font-mono"
                  disabled={!canEdit}
                  value={contentJson.seo?.fbPixelId || ""}
                  onChange={(e) => setContentJson({ ...contentJson, seo: { ...contentJson.seo, fbPixelId: e.target.value } })}
                  placeholder="VD: 123456789012345"
                />
                <span className="text-[10px] text-slate-400">Đo lường chuyển đổi từ quảng cáo Facebook Ads khi khách bấm Đăng ký.</span>
              </div>

              <div>
                <label className="label">Mã Google Tag Manager (GTM ID)</label>
                <input
                  className="input font-mono"
                  disabled={!canEdit}
                  value={contentJson.seo?.gtmId || ""}
                  onChange={(e) => setContentJson({ ...contentJson, seo: { ...contentJson.seo, gtmId: e.target.value } })}
                  placeholder="VD: GTM-XXXXXXX"
                />
              </div>
            </div>

            {canEdit && (
              <div className="pt-3">
                <button type="button" onClick={handleSaveDraft} className="btn-primary">
                  💾 Lưu cấu hình SEO & Tracking
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. MODAL PREVIEW DRAFT SHOWCASE */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full h-[85vh] flex flex-col shadow-2xl border overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">👁️ Xem Trước Bản Nháp (Draft Preview)</span>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[10px] font-bold px-2 py-0.5 rounded">
                  Chế độ nội bộ
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="text-white hover:text-red-400 font-bold text-sm px-2"
              >
                ✕ Đóng
              </button>
            </div>

            {/* BODY PREVIEW SIMULATED CONTAINER */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50 custom-scrollbar">
              <div className="bg-blue-900 text-white rounded-2xl p-8 space-y-3 relative overflow-hidden shadow-lg">
                <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold px-3 py-1 rounded-full inline-block">
                  {contentJson.hero?.tagLine || "Căn hộ cao cấp Quy Nhơn"}
                </span>
                <h1 className="text-2xl font-black">{contentJson.hero?.title || projectInfo?.name}</h1>
                <p className="text-sm text-slate-200">{contentJson.hero?.subtitle}</p>
              </div>

              {/* SECTIONS LIST ACTIVE PREVIEW */}
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-slate-800">Các Section sẽ hiển thị trên trang Public:</h3>
                <div className="grid gap-2">
                  {sectionsConfig
                    .filter((s) => s.enabled)
                    .map((s, idx) => (
                      <div key={s.id} className="p-3 bg-white border rounded-xl flex items-center justify-between text-xs font-medium">
                        <span>#{idx + 1}. {s.title}</span>
                        <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">Hiển thị</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
