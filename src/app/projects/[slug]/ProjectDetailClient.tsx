"use client";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import ListingCard from "@/components/ListingCard";
import { compressImagesInBatch, revokePreviewUrl, ImagePreset } from "@/lib/imageCompression";
import { getOptimizedCloudinaryUrl } from "@/lib/cloudinaryImage";

const unitStatusLabel: Record<string, { label: string; style: string; badgeStyle: string }> = {
  DANG_BAN: {
    label: "Còn hàng",
    style: "bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]",
    badgeStyle: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  DANG_CHO_THUE: {
    label: "Đang cho thuê",
    style: "bg-[#EFF6FF] border-[#BFDBFE] text-[#1E40AF]",
    badgeStyle: "bg-blue-50 text-blue-700 border-blue-200",
  },
  DA_BAN: {
    label: "Đã bán",
    style: "bg-[#FEF2F2] border-[#FCA5A5] text-[#991B1B]",
    badgeStyle: "bg-rose-50 text-rose-700 border-rose-200",
  },
  DA_CHO_THUE: {
    label: "Đã cho thuê",
    style: "bg-[#FEF2F2] border-[#FCA5A5] text-[#991B1B]",
    badgeStyle: "bg-rose-50 text-rose-700 border-rose-200",
  },
  TAM_NGUNG: {
    label: "Tạm ngưng",
    style: "bg-[#FFF7ED] border-[#FFEDD5] text-[#C2410C]",
    badgeStyle: "bg-amber-50 text-amber-700 border-amber-200",
  },
  CHO_DUYET: {
    label: "Chờ duyệt",
    style: "bg-[#FEF3C7] border-[#FDE68A] text-[#B45309]",
    badgeStyle: "bg-amber-50 text-amber-700 border-amber-200",
  },
};

const directionLabel: Record<string, string> = {
  DONG: "Đông",
  TAY: "Tây",
  NAM: "Nam",
  BAC: "Bắc",
  DONG_NAM: "Đông Nam",
  TAY_NAM: "Tây Nam",
  TAY_BAC: "Tây Bắc",
  DONG_BAC: "Đông Bắc",
};

function extractPriceSheetUrl(description?: string | null) {
  if (!description) return { cleanDesc: "", priceSheetUrl: null };
  const match = description.match(/\[PRICE_SHEET\]:\s*(\S+)/);
  if (match) {
    const priceSheetUrl = match[1];
    const cleanDesc = description.replace(/\[PRICE_SHEET\]:\s*\S+/, "").trim();
    return { cleanDesc, priceSheetUrl };
  }
  return { cleanDesc: description, priceSheetUrl: null };
}

function parseImagesList(imagesRaw: any): string[] {
  if (!imagesRaw) return [];
  if (Array.isArray(imagesRaw)) return imagesRaw;
  try {
    const parsed = JSON.parse(imagesRaw);
    if (Array.isArray(parsed)) return parsed;
  } catch (e) {}
  return [];
}

interface ProjectDetailClientProps {
  project: any;
  inventoryUnits: any[];
  saleListings: any[];
  rentListings: any[];
}

export default function ProjectDetailClient({
  project,
  inventoryUnits: initialInventory,
  saleListings,
  rentListings,
}: ProjectDetailClientProps) {
  const { data: session } = useSession();
  const [ctvToken, setCtvToken] = useState<string | null>(null);

  useEffect(() => {
    if ((session?.user as any)?.publicReferralToken) {
      setCtvToken((session?.user as any)?.publicReferralToken);
    } else if (session?.user) {
      fetch("/api/me")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.publicReferralToken) {
            setCtvToken(data.publicReferralToken);
          }
        })
        .catch(() => {});
    }
  }, [session]);

  const effectiveCtvToken = (session?.user as any)?.publicReferralToken || ctvToken;

  const [activeTab, setActiveTab] = useState<"overview" | "inventory" | "sales" | "rent">("inventory");

  // Simona Heights block tabs (THE SEA / THE HARBOUR)
  const isSimona = project.slug === "simona-heights-quy-nhon";
  const [blockTab, setBlockTab] = useState<"THE SEA" | "THE HARBOUR">("THE SEA");

  // Inventory Filters
  const [bedroomFilter, setBedroomFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [directionFilter, setDirectionFilter] = useState<string>("ALL");
  const [searchUnitCode, setSearchUnitCode] = useState<string>("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("grid");

  const [inventoryList, setInventoryList] = useState<any[]>(initialInventory);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Add Product Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addUploading, setAddUploading] = useState(false);
  const [addError, setAddError] = useState("");
  const [addForm, setAddForm] = useState({
    unitCode: "",
    block: isSimona ? "THE SEA" : "",
    floor: "",
    salePrice: "",
    bedrooms: "3",
    bathrooms: "3",
    area: "",
    doorDirection: "DONG_NAM",
    furnitureStatus: "FULL_NOI_THAT",
    unitStatus: "DANG_BAN",
    priceSheetUrl: "",
    images: [] as string[],
  });

  // Edit Product Modal State
  const [editingUnit, setEditingUnit] = useState<any | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editUploading, setEditUploading] = useState(false);
  const [editError, setEditError] = useState("");
  const [editForm, setEditForm] = useState({
    unitCode: "",
    block: "",
    floor: "",
    salePrice: "",
    bedrooms: "3",
    bathrooms: "3",
    area: "",
    doorDirection: "DONG_NAM",
    furnitureStatus: "FULL_NOI_THAT",
    unitStatus: "DANG_BAN",
    priceSheetUrl: "",
    images: [] as string[],
  });

  // Delete & Bulk Delete State for Inventory
  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>([]);
  const [deletingUnit, setDeletingUnit] = useState<any | null>(null);
  const [isDeletingUnit, setIsDeletingUnit] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deleteSuccess, setDeleteSuccess] = useState("");

  const toggleSelectUnit = (unitId: string) => {
    setSelectedUnitIds((prev) =>
      prev.includes(unitId) ? prev.filter((id) => id !== unitId) : [...prev, unitId]
    );
  };

  const role = (session?.user as any)?.role;
  const canEditProduct = role === "ADMIN" || role === "MANAGER" || role === "STAFF";

  const toggleSelectAllFiltered = () => {
    const filteredIds = filteredInventory.map((u) => u.id);
    const isAllSelected = filteredIds.length > 0 && filteredIds.every((id) => selectedUnitIds.includes(id));
    if (isAllSelected) {
      setSelectedUnitIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      setSelectedUnitIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  async function handleConfirmSingleDelete() {
    if (!deletingUnit || isDeletingUnit) return;
    setIsDeletingUnit(true);
    setDeleteError("");
    try {
      const res = await fetch(`/api/project-inventory/${deletingUnit.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        setDeleteError(data.error || "Có lỗi xảy ra khi xóa sản phẩm.");
        setIsDeletingUnit(false);
        return;
      }
      setInventoryList((list) => list.filter((u) => u.id !== deletingUnit.id));
      setSelectedUnitIds((prev) => prev.filter((id) => id !== deletingUnit.id));
      if (editingUnit?.id === deletingUnit.id) {
        setEditingUnit(null);
      }
      setDeletingUnit(null);
      setDeleteSuccess(`Đã xóa căn ${deletingUnit.unitCode} thành công!`);
      setTimeout(() => setDeleteSuccess(""), 4000);
    } catch (err: any) {
      setDeleteError("Lỗi kết nối máy chủ khi xóa căn hộ.");
    } finally {
      setIsDeletingUnit(false);
    }
  }

  async function handleConfirmBulkDelete() {
    if (selectedUnitIds.length === 0 || isBulkDeleting) return;
    setIsBulkDeleting(true);
    setDeleteError("");

    const idsToDelete = [...selectedUnitIds];
    const results = await Promise.allSettled(
      idsToDelete.map(async (id) => {
        const res = await fetch(`/api/project-inventory/${id}`, { method: "DELETE" });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || `Lỗi xóa căn ID ${id}`);
        }
        return id;
      })
    );

    const succeededIds: string[] = [];
    const failedIds: string[] = [];

    results.forEach((res, idx) => {
      if (res.status === "fulfilled") {
        succeededIds.push(idsToDelete[idx]);
      } else {
        failedIds.push(idsToDelete[idx]);
      }
    });

    if (succeededIds.length > 0) {
      setInventoryList((list) => list.filter((u) => !succeededIds.includes(u.id)));
    }

    setSelectedUnitIds(failedIds);

    if (editingUnit && succeededIds.includes(editingUnit.id)) {
      setEditingUnit(null);
    }

    setShowBulkDeleteConfirm(false);
    setIsBulkDeleting(false);

    if (failedIds.length === 0) {
      setDeleteSuccess(`Đã xóa thành công ${succeededIds.length} căn hộ khỏi bảng hàng!`);
      setTimeout(() => setDeleteSuccess(""), 4000);
    } else {
      setDeleteError(`Đã xóa thành công ${succeededIds.length}/${idsToDelete.length} căn. Còn ${failedIds.length} căn chưa thể xóa.`);
    }
  }

  const totalSale = saleListings.length;
  const totalRent = rentListings.length;

  // Count per block for Simona
  const seaCount = useMemo(() => {
    return inventoryList.filter((u) => {
      const b = (u.block || "").toUpperCase().trim();
      return b === "THE SEA" || b === "THÁP SIMONA 1" || b === "THÁP SIMONA 2" || (!b.includes("HARBOUR") && b !== "");
    }).length;
  }, [inventoryList]);

  const harbourCount = useMemo(() => {
    return inventoryList.filter((u) => {
      const b = (u.block || "").toUpperCase().trim();
      return b.includes("HARBOUR");
    }).length;
  }, [inventoryList]);

  function scrollToSection(id: string, tab: "overview" | "inventory" | "sales" | "rent") {
    setActiveTab(tab);
    const elem = document.getElementById(id);
    if (elem) {
      const yOffset = -80;
      const y = elem.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }

  // Filter Inventory Units
  const filteredInventory = useMemo(() => {
    return inventoryList.filter((u) => {
      // 1. Block filter (Simona)
      if (isSimona) {
        const uBlock = (u.block || "").toUpperCase().trim();
        if (blockTab === "THE SEA" && uBlock.includes("HARBOUR")) return false;
        if (blockTab === "THE HARBOUR" && !uBlock.includes("HARBOUR")) return false;
      }

      // 2. Bedroom filter
      if (bedroomFilter !== "ALL") {
        if (bedroomFilter === "1" && u.bedrooms !== 1) return false;
        if (bedroomFilter === "2" && u.bedrooms !== 2) return false;
        if (bedroomFilter === "3" && u.bedrooms !== 3) return false;
        if (bedroomFilter === "4+" && (u.bedrooms || 0) < 4) return false;
      }

      // 3. Status filter
      if (statusFilter !== "ALL" && u.unitStatus !== statusFilter) {
        return false;
      }

      // 4. Direction filter
      if (directionFilter !== "ALL" && u.doorDirection !== directionFilter) {
        return false;
      }

      // 5. Search unit code or floor
      if (searchUnitCode.trim() !== "") {
        const kw = searchUnitCode.trim().toLowerCase();
        const code = (u.unitCode || "").toLowerCase();
        const floor = (u.floor || "").toLowerCase();
        if (!code.includes(kw) && !floor.includes(kw)) return false;
      }

      return true;
    });
  }, [inventoryList, isSimona, blockTab, bedroomFilter, statusFilter, directionFilter, searchUnitCode]);

  const hasActiveFilters = bedroomFilter !== "ALL" || statusFilter !== "ALL" || directionFilter !== "ALL" || searchUnitCode !== "";

  function resetFilters() {
    setBedroomFilter("ALL");
    setStatusFilter("ALL");
    setDirectionFilter("ALL");
    setSearchUnitCode("");
  }

  function formatPrice(u: any) {
    if (u.salePrice) {
      if (u.salePrice >= 1_000_000_000) {
        const inTy = u.salePrice / 1_000_000_000;
        return `${inTy.toLocaleString("vi-VN", { maximumFractionDigits: 3 })} tỷ`;
      }
      return `${(u.salePrice / 1_000_000).toLocaleString("vi-VN")} triệu`;
    }
    return "Thỏa thuận";
  }

  // Upload handler hỗ trợ Direct Cloudinary & Fallback /api/upload với Tối ưu hóa ảnh
  async function handleFileUpload(files: FileList | null, isEdit: boolean, preset: ImagePreset = "DEFAULT") {
    if (!files || files.length === 0) return;

    if (isEdit) {
      setEditUploading(true);
      setEditError("");
    } else {
      setAddUploading(true);
      setAddError("");
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "rp8nsv0a";
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "minhdungland";
    const uploadedUrls: string[] = [];

    try {
      const fileArray = Array.from(files);
      // Auto-detect floor plan files or use passed preset
      const compressedResults = await compressImagesInBatch(
        fileArray,
        preset,
        3
      );

      for (const item of compressedResults) {
        const file = item.file;
        let fileUrl = "";

        // 1. Thử upload trực tiếp Cloudinary từ Client
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
              fileUrl = cloudData.secure_url;
            }
          }
        } catch (e) {
          console.warn("Direct Cloudinary upload failed, falling back to /api/upload", e);
        }

        // 2. Fallback sang /api/upload
        if (!fileUrl) {
          try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/upload", {
              method: "POST",
              body: formData,
            });

            if (res.ok) {
              const data = await res.json();
              if (data.url) fileUrl = data.url;
            } else {
              const err = await res.json();
              const msg = err.error || `Lỗi upload tệp "${file.name}" (Mã lỗi: ${res.status})`;
              if (isEdit) setEditError(msg);
              else setAddError(msg);
            }
          } catch (e: any) {
            const msg = `Không thể kết nối máy chủ để tải tệp "${file.name}": ${e.message}`;
            if (isEdit) setEditError(msg);
            else setAddError(msg);
          }
        }

        if (fileUrl) {
          uploadedUrls.push(fileUrl);
        }
        revokePreviewUrl(item.previewUrl);
      }

      if (uploadedUrls.length > 0) {
        if (isEdit) {
          setEditForm((prev) => ({ ...prev, images: [...prev.images, ...uploadedUrls] }));
        } else {
          setAddForm((prev) => ({ ...prev, images: [...prev.images, ...uploadedUrls] }));
        }
      }
    } finally {
      if (isEdit) setEditUploading(false);
      else setAddUploading(false);
    }
  }

  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault();
    setAddError("");
    if (!addForm.unitCode.trim()) {
      setAddError("Vui lòng nhập mã căn.");
      return;
    }
    if (!addForm.area || parseFloat(addForm.area) <= 0) {
      setAddError("Vui lòng nhập diện tích hợp lệ.");
      return;
    }

    setAddLoading(true);
    const descWithPriceSheet = addForm.priceSheetUrl.trim()
      ? `[PRICE_SHEET]: ${addForm.priceSheetUrl.trim()}`
      : "";

    const res = await fetch("/api/project-inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: project.id,
        unitCode: addForm.unitCode.trim(),
        block: addForm.block ? addForm.block.trim().toUpperCase() : null,
        floor: addForm.floor || null,
        salePrice: addForm.salePrice ? parseFloat(addForm.salePrice) * 1_000_000_000 : null,
        bedrooms: parseInt(addForm.bedrooms) || 3,
        bathrooms: parseInt(addForm.bathrooms) || 3,
        area: parseFloat(addForm.area),
        doorDirection: addForm.doorDirection,
        furnitureStatus: addForm.furnitureStatus || "FULL_NOI_THAT",
        unitStatus: addForm.unitStatus,
        description: descWithPriceSheet,
        images: addForm.images,
      }),
    });

    setAddLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setAddError(data.error || "Không thể thêm sản phẩm.");
      return;
    }

    const newUnit = await res.json();
    setInventoryList([newUnit, ...inventoryList]);
    setShowAddModal(false);
    setAddForm({
      unitCode: "",
      block: isSimona ? blockTab : "",
      floor: "",
      salePrice: "",
      bedrooms: "3",
      bathrooms: "3",
      area: "",
      doorDirection: "DONG_NAM",
      furnitureStatus: "FULL_NOI_THAT",
      unitStatus: "DANG_BAN",
      priceSheetUrl: "",
      images: [],
    });
  }

  function startEditUnit(unit: any) {
    setEditingUnit(unit);
    setEditError("");
    const { priceSheetUrl } = extractPriceSheetUrl(unit.description);
    const unitImages = parseImagesList(unit.images);

    setEditForm({
      unitCode: unit.unitCode || "",
      block: unit.block || "",
      floor: unit.floor || "",
      salePrice: unit.salePrice ? (unit.salePrice / 1_000_000_000).toString() : "",
      bedrooms: (unit.bedrooms || 3).toString(),
      bathrooms: (unit.bathrooms || 3).toString(),
      area: (unit.area || "").toString(),
      doorDirection: unit.doorDirection || "DONG_NAM",
      furnitureStatus: unit.furnitureStatus || "FULL_NOI_THAT",
      unitStatus: unit.unitStatus || "DANG_BAN",
      priceSheetUrl: priceSheetUrl || "",
      images: unitImages,
    });
  }

  async function handleUpdateProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!editingUnit) return;
    setEditError("");

    setEditLoading(true);
    const { cleanDesc } = extractPriceSheetUrl(editingUnit.description);
    const descWithPriceSheet = editForm.priceSheetUrl.trim()
      ? `${cleanDesc ? cleanDesc + "\n" : ""}[PRICE_SHEET]: ${editForm.priceSheetUrl.trim()}`
      : cleanDesc;

    const res = await fetch(`/api/project-inventory/${editingUnit.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        unitCode: editForm.unitCode.trim(),
        block: editForm.block ? editForm.block.trim().toUpperCase() : null,
        floor: editForm.floor || null,
        salePrice: editForm.salePrice ? parseFloat(editForm.salePrice) * 1_000_000_000 : null,
        bedrooms: parseInt(editForm.bedrooms) || 3,
        bathrooms: parseInt(editForm.bathrooms) || 3,
        area: parseFloat(editForm.area),
        doorDirection: editForm.doorDirection,
        furnitureStatus: editForm.furnitureStatus,
        unitStatus: editForm.unitStatus,
        description: descWithPriceSheet,
        images: editForm.images,
      }),
    });

    setEditLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setEditError(data.error || "Có lỗi xảy ra khi cập nhật.");
      return;
    }

    const updatedUnit = await res.json();
    setInventoryList((list) =>
      list.map((u) => (u.id === editingUnit.id ? { ...u, ...updatedUnit } : u))
    );
    setEditingUnit(null);
  }

  async function quickUpdateStatus(unit: any, newStatus: string) {
    if (!canEditProduct) return;
    const res = await fetch(`/api/project-inventory/${unit.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ unitStatus: newStatus }),
    });
    if (res.ok) {
      setInventoryList((list) =>
        list.map((u) => (u.id === unit.id ? { ...u, unitStatus: newStatus } : u))
      );
    }
  }

  return (
    <div className="space-y-5 py-4">
      {/* 1. COMPACT PROJECT HEADER (PREVENTS OCCUPYING TOO MUCH VIEWPORT) */}
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[11px] font-bold text-slate-700">
                  🏢 Dự án BĐS
                </span>
                {project.developer && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
                    CĐT: <strong>{project.developer}</strong>
                  </span>
                )}
              </div>

              <h1 className="text-[20px] sm:text-[24px] font-black text-slate-900 tracking-tight">
                {project.name}
              </h1>

              {project.address && (
                <p className="text-[13px] text-slate-500 flex items-center gap-1 font-medium">
                  <span className="text-slate-400">📍</span>
                  <span>{project.address}</span>
                </p>
              )}
            </div>

            {/* COMPACT STATS BADGES */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <div className="flex items-center gap-2 rounded-xl bg-indigo-50 border border-indigo-100 px-3 py-1.5 text-indigo-900">
                <span className="text-sm">📋</span>
                <div className="text-[13px] font-extrabold">{inventoryList.length} căn bảng hàng</div>
              </div>

              {totalSale > 0 && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-100 px-3 py-1.5 text-emerald-900">
                  <span className="text-sm">🏷️</span>
                  <div className="text-[13px] font-extrabold">{totalSale} tin rao bán</div>
                </div>
              )}

              {totalRent > 0 && (
                <div className="flex items-center gap-2 rounded-xl bg-blue-50 border border-blue-100 px-3 py-1.5 text-blue-900">
                  <span className="text-sm">🔑</span>
                  <div className="text-[13px] font-extrabold">{totalRent} tin cho thuê</div>
                </div>
              )}

              {/* REFERRAL SHARE BUTTON FOR CTV */}
              {effectiveCtvToken && (
                <button
                  type="button"
                  onClick={() => {
                    const shareUrl = `${window.location.origin}/projects/${project.slug}?ref=${effectiveCtvToken}`;
                    navigator.clipboard.writeText(shareUrl);
                    alert(`✓ Đã sao chép Link Bảng hàng đính kèm Mã CTV (${effectiveCtvToken})!\nHãy dán để chia sẻ cho khách hàng: ${shareUrl}`);
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 text-[13px] font-bold shadow-xs transition cursor-pointer"
                >
                  <span>🔗</span>
                  <span>Sao chép Link Bảng hàng CTV</span>
                </button>
              )}

              {/* REFERRAL SHARE BUTTON FOR INTERNAL STAFF */}
              {!effectiveCtvToken && (session?.user as any)?.referralCode && (
                <button
                  type="button"
                  onClick={() => {
                    const code = (session?.user as any)?.referralCode;
                    const shareUrl = `${window.location.origin}/projects/${project.slug}?ref=${code}`;
                    navigator.clipboard.writeText(shareUrl);
                    alert(`✓ Đã sao chép Link Bảng hàng đính kèm Mã Nhân viên (${code})!\nHãy dán để chia sẻ: ${shareUrl}`);
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 text-[13px] font-bold shadow-xs transition cursor-pointer"
                >
                  <span>🔗</span>
                  <span>Sao chép Link Bảng hàng ({ (session?.user as any)?.referralCode })</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. STICKY NAVIGATION BAR */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto py-2 scrollbar-none">
          <button
            onClick={() => scrollToSection("inventory-section", "inventory")}
            className={`px-3.5 py-1.5 text-[13px] font-bold rounded-xl whitespace-nowrap transition-all ${
              activeTab === "inventory"
                ? "bg-[#0284C7] text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            Bảng hàng ({inventoryList.length})
          </button>
          <button
            onClick={() => scrollToSection("overview-section", "overview")}
            className={`px-3.5 py-1.5 text-[13px] font-bold rounded-xl whitespace-nowrap transition-all ${
              activeTab === "overview"
                ? "bg-[#0284C7] text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            Tổng quan
          </button>
          <button
            onClick={() => scrollToSection("sales-section", "sales")}
            className={`px-3.5 py-1.5 text-[13px] font-bold rounded-xl whitespace-nowrap transition-all ${
              activeTab === "sales"
                ? "bg-[#0284C7] text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            Căn đang bán ({totalSale})
          </button>
          <button
            onClick={() => scrollToSection("rent-section", "rent")}
            className={`px-3.5 py-1.5 text-[13px] font-bold rounded-xl whitespace-nowrap transition-all ${
              activeTab === "rent"
                ? "bg-[#0284C7] text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            Cho thuê ({totalRent})
          </button>

          <div className="ml-auto flex items-center shrink-0">
            {effectiveCtvToken && (
              <button
                type="button"
                onClick={() => {
                  const shareUrl = `${window.location.origin}/projects/${project.slug}?ref=${effectiveCtvToken}`;
                  navigator.clipboard.writeText(shareUrl);
                  alert(`✓ Đã sao chép Link Bảng hàng CTV (${effectiveCtvToken})!\nHãy dán để chia sẻ: ${shareUrl}`);
                }}
                className="px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-2xs cursor-pointer flex items-center gap-1"
              >
                <span>🔗</span>
                <span>Sao chép Link CTV</span>
              </button>
            )}

            {!effectiveCtvToken && (session?.user as any)?.referralCode && (
              <button
                type="button"
                onClick={() => {
                  const code = (session?.user as any)?.referralCode;
                  const shareUrl = `${window.location.origin}/projects/${project.slug}?ref=${code}`;
                  navigator.clipboard.writeText(shareUrl);
                  alert(`✓ Đã sao chép Link Bảng hàng Nhân viên (${code})!\nHãy dán để chia sẻ: ${shareUrl}`);
                }}
                className="px-3 py-1.5 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition shadow-2xs cursor-pointer flex items-center gap-1"
              >
                <span>🔗</span>
                <span>Sao chép Link Nhân viên</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* 3. SECTION BẢNG HÀNG (PLACED FIRST & ABOVE THE FOLD) */}
        <section id="inventory-section" className="space-y-4 scroll-mt-28">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-2.5">
            <div>
              <h2 className="text-[18px] sm:text-[20px] font-black text-slate-900 flex items-center gap-2">
                <span>📊</span>
                <span>Bảng hàng {project.name}</span>
              </h2>
              <p className="text-[12px] text-slate-500 mt-0.5 font-medium">
                Tra cứu trực tiếp giá bán, thông số kỹ thuật và trạng thái căn hộ theo bảng hàng chính thức.
              </p>
            </div>

            {/* ADMIN ONLY: ADD PRODUCT BUTTON */}
            {canEditProduct && (
              <button
                onClick={() => {
                  setAddForm({ ...addForm, block: isSimona ? blockTab : "", images: [] });
                  setShowAddModal(true);
                }}
                className="btn-primary text-[13px] shrink-0 gap-1.5 shadow-xs px-3.5 py-1.5"
              >
                <span>+</span> Thêm sản phẩm
              </button>
            )}
          </div>

          {/* SIMONA HEIGHTS TOWER SUB-TABS (FULL NỘI THẤT - THE SEA / THE HARBOUR) */}
          {isSimona && (
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => setBlockTab("THE SEA")}
                className={`px-4 py-2 text-[13px] font-black rounded-xl transition-all flex items-center gap-2 border ${
                  blockTab === "THE SEA"
                    ? "bg-[#0284C7] text-white border-[#0284C7] shadow-xs"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <span>🌊 Full nội thất - The Sea</span>
                <span className={`px-2 py-0.5 text-[11px] rounded-full font-bold ${blockTab === "THE SEA" ? "bg-white/20 text-white" : "bg-blue-50 text-blue-700"}`}>
                  {seaCount}
                </span>
              </button>

              <button
                onClick={() => setBlockTab("THE HARBOUR")}
                className={`px-4 py-2 text-[13px] font-black rounded-xl transition-all flex items-center gap-2 border ${
                  blockTab === "THE HARBOUR"
                    ? "bg-[#0284C7] text-white border-[#0284C7] shadow-xs"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <span>⚓ Full nội thất - The Harbour</span>
                <span className={`px-2 py-0.5 text-[11px] rounded-full font-bold ${blockTab === "THE HARBOUR" ? "bg-white/20 text-white" : "bg-blue-50 text-blue-700"}`}>
                  {harbourCount}
                </span>
              </button>
            </div>
          )}

          {/* MULTI-FILTER BAR */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* BEDROOM FILTERS */}
              <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto scrollbar-none">
                <span className="text-[12px] font-bold text-slate-500 mr-1">PN:</span>
                {[
                  { key: "ALL", label: "Tất cả" },
                  { key: "1", label: "1 PN" },
                  { key: "2", label: "2 PN" },
                  { key: "3", label: "3 PN" },
                  { key: "4+", label: "4+ PN" },
                ].map((btn) => (
                  <button
                    key={btn.key}
                    onClick={() => setBedroomFilter(btn.key)}
                    className={`px-2.5 py-1 rounded-lg text-[12px] font-bold transition border ${
                      bedroomFilter === btn.key
                        ? "bg-[#0284C7] text-white border-[#0284C7]"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900"
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>

              {/* SEARCH INPUT */}
              <div className="relative flex-1 min-w-[160px] max-w-xs">
                <input
                  type="text"
                  placeholder={role === "COLLABORATOR_PRO" ? "Tìm theo tầng, diện tích..." : "Tìm mã căn (VD: H.11, S.12A)..."}
                  value={searchUnitCode}
                  onChange={(e) => setSearchUnitCode(e.target.value)}
                  className="w-full pl-7 pr-3 py-1 text-[12px] rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                />
                <span className="absolute left-2.5 top-1.5 text-[11px] text-slate-400">🔍</span>
              </div>
            </div>

            {/* SECONDARY DROPDOWN FILTERS & VIEW MODE TOGGLE */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-[12px]">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-500">Trạng thái:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-800 outline-none cursor-pointer"
                  >
                    <option value="ALL">Tất cả trạng thái</option>
                    <option value="DANG_BAN">🟢 Còn hàng</option>
                    <option value="DA_BAN">🔴 Đã bán</option>
                    <option value="DANG_CHO_THUE">🔵 Đang cho thuê</option>
                    <option value="TAM_NGUNG">🟠 Tạm ngưng</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-500">Hướng:</span>
                  <select
                    value={directionFilter}
                    onChange={(e) => setDirectionFilter(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-800 outline-none cursor-pointer"
                  >
                    <option value="ALL">Tất cả hướng</option>
                    {Object.entries(directionLabel).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>

                {hasActiveFilters && (
                  <button
                    onClick={resetFilters}
                    className="text-[11px] font-bold text-rose-600 hover:text-rose-800 underline cursor-pointer"
                  >
                    ✕ Bỏ lọc
                  </button>
                )}
              </div>

              {/* VIEW MODE TOGGLE BUTTONS */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`px-3 py-1 text-[11px] font-bold rounded-lg transition ${
                    viewMode === "grid"
                      ? "bg-white text-[#0284C7] shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  🎴 Dạng thẻ
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`px-3 py-1 text-[11px] font-bold rounded-lg transition ${
                    viewMode === "table"
                      ? "bg-white text-[#0284C7] shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  📋 Dạng bảng hàng (1 hàng 1 căn)
                </button>
              </div>
            </div>
          </div>

          {/* NOTIFICATIONS & BULK ACTION BAR */}
          {deleteSuccess && (
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3.5 text-[13px] text-emerald-800 font-semibold flex justify-between items-center animate-in fade-in">
              <span>✓ {deleteSuccess}</span>
              <button onClick={() => setDeleteSuccess("")} className="text-emerald-800 hover:underline font-bold">✕</button>
            </div>
          )}
          {deleteError && (
            <div className="rounded-2xl bg-rose-50 border border-rose-200 p-3.5 text-[13px] text-rose-800 font-semibold flex justify-between items-center animate-in fade-in">
              <span>⚠️ {deleteError}</span>
              <button onClick={() => setDeleteError("")} className="text-rose-800 hover:underline font-bold">✕</button>
            </div>
          )}

          {selectedUnitIds.length > 0 && canEditProduct && (
            <div className="flex flex-wrap items-center justify-between bg-rose-50 border border-rose-200 p-3.5 rounded-2xl shadow-xs gap-2 animate-in fade-in">
              <div className="flex items-center gap-2 text-rose-900 font-bold text-xs sm:text-sm">
                <span>Đã chọn <strong className="text-rose-700 font-extrabold">{selectedUnitIds.length}</strong> căn hộ trong bảng hàng</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedUnitIds([])}
                  className="px-3 py-1 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
                >
                  Hủy chọn
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDeleteError("");
                    setShowBulkDeleteConfirm(true);
                  }}
                  className="px-3.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  Xóa {selectedUnitIds.length} căn đã chọn
                </button>
              </div>
            </div>
          )}

          {/* INVENTORY DISPLAY */}
          {filteredInventory.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 space-y-2">
              <div className="text-2xl">📦</div>
              {isSimona && blockTab === "THE HARBOUR" && harbourCount === 0 ? (
                <div className="font-bold text-slate-700 text-[14px]">
                  Bảng hàng Full nội thất - The Harbour đang được cập nhật.
                </div>
              ) : (
                <div className="font-bold text-slate-700 text-[14px]">
                  Không tìm thấy căn hộ phù hợp với bộ lọc hiện tại.
                </div>
              )}
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="btn-outline text-[12px] py-1 px-3 mt-1"
                >
                  Xóa bộ lọc để xem tất cả
                </button>
              )}
            </div>
          ) : viewMode === "table" ? (
            <div className="overflow-x-auto custom-scrollbar rounded-2xl border border-slate-200 bg-white shadow-xs w-full">
              <table className="w-full text-left text-[13px] border-collapse min-w-[1250px]">
                <thead className="bg-slate-50 text-[12px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <tr className="align-middle">
                    {canEditProduct && (
                      <th className="px-3 py-3.5 w-[3%] text-center align-middle">
                        <input
                          type="checkbox"
                          checked={filteredInventory.length > 0 && filteredInventory.every((u) => selectedUnitIds.includes(u.id))}
                          ref={(el) => {
                            if (el) {
                              const some = filteredInventory.some((u) => selectedUnitIds.includes(u.id));
                              const all = filteredInventory.length > 0 && filteredInventory.every((u) => selectedUnitIds.includes(u.id));
                              el.indeterminate = some && !all;
                            }
                          }}
                          onChange={toggleSelectAllFiltered}
                          className="w-4 h-4 rounded text-blue-600 border-slate-300 cursor-pointer align-middle"
                          title="Chọn tất cả các căn đang hiển thị"
                        />
                      </th>
                    )}
                    <th className="px-3.5 py-3.5 align-middle w-[7%]">Mã căn</th>
                    <th className="px-3.5 py-3.5 align-middle w-[13%]">Tòa & Tầng</th>
                    <th className="px-3.5 py-3.5 align-middle w-[9%]">Cấu trúc</th>
                    <th className="px-3.5 py-3.5 align-middle w-[7%]">Diện tích</th>
                    <th className="px-3.5 py-3.5 align-middle w-[10%] whitespace-nowrap">Hướng ban công</th>
                    <th className="px-3.5 py-3.5 align-middle w-[10%] whitespace-nowrap">Giá bán niêm yết</th>
                    <th className="px-3.5 py-3.5 align-middle w-[8%]">Trạng thái</th>
                    <th className="px-3.5 py-3.5 align-middle w-[15%]">Sơ đồ / Tài liệu</th>
                    {canEditProduct && <th className="px-3.5 py-3.5 align-middle w-[18%] text-left">Quản trị</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredInventory.map((unit) => {
                    const isSold = unit.unitStatus === "DA_BAN" || unit.unitStatus === "DA_CHO_THUE";
                    const unitImages = parseImagesList(unit.images);
                    const hasImage = unitImages.length > 0;
                    const primaryImg = hasImage ? unitImages[0] : null;
                    const { priceSheetUrl } = extractPriceSheetUrl(unit.description);
                    const statusMeta = unitStatusLabel[unit.unitStatus] || {
                      label: unit.unitStatus,
                      style: "bg-slate-100 text-slate-700",
                      badgeStyle: "bg-slate-100 text-slate-700 border-slate-200",
                    };

                    return (
                      <tr
                        key={unit.id}
                        className={`align-middle hover:bg-slate-50/80 transition ${isSold ? "bg-slate-50/40" : ""} ${
                          selectedUnitIds.includes(unit.id) ? "bg-blue-50/40" : ""
                        }`}
                      >
                        {/* 0. CHECKBOX (ADMIN/STAFF) */}
                        {canEditProduct && (
                          <td className="px-3 py-3.5 align-middle text-center">
                            <input
                              type="checkbox"
                              checked={selectedUnitIds.includes(unit.id)}
                              onChange={() => toggleSelectUnit(unit.id)}
                              className="w-4 h-4 rounded text-blue-600 border-slate-300 cursor-pointer align-middle"
                            />
                          </td>
                        )}

                        {/* 1. MÃ CĂN */}
                        <td className="px-3.5 py-3.5 align-middle">
                          <code className="font-black text-[13px] text-slate-900 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-lg inline-block">
                            {unit.unitCode || "••••"}
                          </code>
                        </td>

                        {/* 2. TÒA & TẦNG */}
                        <td className="px-3.5 py-3.5 align-middle text-slate-800 font-semibold whitespace-nowrap">
                          🏢 {unit.block || "The Sea"} {unit.floor ? `· Tầng ${unit.floor}` : ""}
                        </td>

                        {/* 3. CẤU TRÚC */}
                        <td className="px-3.5 py-3.5 align-middle text-slate-700 whitespace-nowrap">
                          🛏️ {unit.bedrooms || 0} PN · {unit.bathrooms || 0} WC
                        </td>

                        {/* 4. DIỆN TÍCH */}
                        <td className="px-3.5 py-3.5 align-middle text-slate-800 font-bold whitespace-nowrap">
                          📐 {unit.area} m²
                        </td>

                        {/* 5. HƯỚNG BAN CÔNG */}
                        <td className="px-3.5 py-3.5 align-middle text-slate-600 whitespace-nowrap">
                          {unit.doorDirection ? `🧭 ${directionLabel[unit.doorDirection] || unit.doorDirection}` : "—"}
                        </td>

                        {/* 6. GIÁ BÁN NIÊM YẾT */}
                        <td className="px-3.5 py-3.5 align-middle whitespace-nowrap">
                          <span className="font-black text-[#0284C7] text-[15px]">
                            {formatPrice(unit)}
                          </span>
                        </td>

                        {/* 7. TRẠNG THÁI */}
                        <td className="px-3.5 py-3.5 align-middle whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 text-[11px] font-bold rounded-lg border ${statusMeta.badgeStyle}`}>
                            {statusMeta.label}
                          </span>
                        </td>

                        {/* 8. SƠ ĐỒ & BẢNG GIÁ */}
                        <td className="px-3.5 py-3.5 align-middle whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            {hasImage && primaryImg && (
                              <button
                                type="button"
                                onClick={() => setPreviewImage(primaryImg)}
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 px-2 py-0.5 rounded-md transition cursor-pointer"
                              >
                                🖼️ Xem sơ đồ
                              </button>
                            )}
                            {priceSheetUrl && (
                              <a
                                href={priceSheetUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 px-2 py-0.5 rounded-md transition"
                              >
                                📄 Bảng giá
                              </a>
                            )}
                            {!hasImage && !priceSheetUrl && <span className="text-slate-400 text-xs">—</span>}
                          </div>
                        </td>

                        {/* 9. QUẢN TRỊ (ADMIN/STAFF) */}
                        {canEditProduct && (
                          <td className="px-3.5 py-3.5 align-middle whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <select
                                value={unit.unitStatus}
                                onChange={(e) => quickUpdateStatus(unit, e.target.value)}
                                className="rounded-lg border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[11px] font-bold text-slate-800 outline-none cursor-pointer"
                              >
                                <option value="DANG_BAN">🟢 Còn hàng</option>
                                <option value="DA_BAN">🔴 Đã bán</option>
                                <option value="DANG_CHO_THUE">🔵 Đang cho thuê</option>
                                <option value="TAM_NGUNG">🟠 Tạm ngưng</option>
                              </select>
                              <button
                                type="button"
                                onClick={() => startEditUnit(unit)}
                                className="font-bold text-blue-600 hover:text-blue-800 text-[12px] px-1 cursor-pointer"
                              >
                                Sửa
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setDeleteError("");
                                  setDeletingUnit(unit);
                                }}
                                className="font-bold text-rose-600 hover:text-rose-800 text-[12px] px-1 cursor-pointer"
                              >
                                Xóa
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filteredInventory.map((unit) => {
                const isSold = unit.unitStatus === "DA_BAN" || unit.unitStatus === "DA_CHO_THUE";
                const unitImages = parseImagesList(unit.images);
                const hasImage = unitImages.length > 0;
                const primaryImg = hasImage ? unitImages[0] : null;

                const { priceSheetUrl } = extractPriceSheetUrl(unit.description);
                const statusMeta = unitStatusLabel[unit.unitStatus] || {
                  label: unit.unitStatus,
                  style: "bg-slate-100 text-slate-700",
                  badgeStyle: "bg-slate-100 text-slate-700 border-slate-200",
                };

                return (
                  <div
                    key={unit.id}
                    className={`group relative flex flex-col justify-between rounded-2xl border ${
                      selectedUnitIds.includes(unit.id)
                        ? "border-blue-500 bg-blue-50/20 ring-2 ring-blue-500/20"
                        : isSold
                        ? "border-slate-200 bg-slate-50/40"
                        : "border-slate-200 bg-white"
                    } hover:border-blue-300 p-4 shadow-xs hover:shadow-md transition-all duration-200 space-y-3 cursor-default`}
                  >
                    {/* 1. HEADER: CHECKBOX + MÃ CĂN + TRẠNG THÁI */}
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        {canEditProduct && (
                          <input
                            type="checkbox"
                            checked={selectedUnitIds.includes(unit.id)}
                            onChange={() => toggleSelectUnit(unit.id)}
                            className="w-4 h-4 rounded text-blue-600 border-slate-300 cursor-pointer"
                          />
                        )}
                        <span className="font-extrabold text-[14px] text-slate-900 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-lg">
                          {unit.unitCode || "••••"}
                        </span>
                      </div>

                      <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-lg border ${statusMeta.badgeStyle}`}>
                        {statusMeta.label}
                      </span>
                    </div>

                    {/* 2. IMAGE PREVIEW / PLACEHOLDER */}
                    {hasImage && primaryImg ? (
                      <div
                        onClick={() => setPreviewImage(primaryImg)}
                        className="relative w-full h-[140px] rounded-xl border border-slate-100 overflow-hidden bg-slate-50 cursor-pointer group/img"
                      >
                        <img
                          src={getOptimizedCloudinaryUrl(primaryImg, "FLOOR_PLAN_THUMB")}
                          alt={unit.unitCode ? `Sơ đồ căn ${unit.unitCode}` : "Sơ đồ căn hộ"}
                          loading="lazy"
                          className="w-full h-full object-contain p-1 rounded-xl transition-transform duration-300 group-hover/img:scale-105"
                        />
                        <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover/img:opacity-100 transition flex items-center justify-center text-white font-bold text-[11px] gap-1 backdrop-blur-[1px]">
                          🖼️ Phóng to sơ đồ
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-[70px] rounded-xl bg-slate-50/80 border border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-[12px] font-medium gap-1">
                        <span>📐 Sơ đồ căn đang cập nhật</span>
                      </div>
                    )}

                    {/* 3. PRICE & SPECIFICATIONS */}
                    <div className="space-y-2">
                      <div className="flex items-baseline justify-between pt-0.5">
                        <span className="text-[11px] text-slate-400 font-medium">Giá niêm yết:</span>
                        <span className="font-black text-[#0284C7] text-[17px]">
                          {formatPrice(unit)}
                        </span>
                      </div>

                      {/* SPECIFICATION GRID BOX */}
                      <div className="grid grid-cols-2 gap-1.5 text-[12px] bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-medium text-slate-700">
                        <div className="truncate flex items-center gap-1">
                          <span className="text-slate-400">🏢</span>
                          <span className="truncate">{unit.block || "The Sea"} {unit.floor ? `· T${unit.floor}` : ""}</span>
                        </div>
                        <div className="truncate flex items-center gap-1">
                          <span className="text-slate-400">🛏️</span>
                          <span>{unit.bedrooms || 0} PN · {unit.bathrooms || 0} WC</span>
                        </div>
                        <div className="truncate flex items-center gap-1">
                          <span className="text-slate-400">📐</span>
                          <span>{unit.area} m²</span>
                        </div>
                        <div className="truncate flex items-center gap-1">
                          <span className="text-slate-400">🧭</span>
                          <span className="truncate">{unit.doorDirection ? (directionLabel[unit.doorDirection] || unit.doorDirection) : "—"}</span>
                        </div>
                      </div>
                    </div>

                    {/* 4. ACTIONS & ADMIN CONTROLS */}
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        {hasImage && primaryImg ? (
                          <button
                            type="button"
                            onClick={() => setPreviewImage(primaryImg)}
                            className="text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1 cursor-pointer"
                          >
                            🖼️ Xem sơ đồ
                          </button>
                        ) : (
                          <span />
                        )}

                        {priceSheetUrl && (
                          <a
                            href={priceSheetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 transition flex items-center gap-1"
                          >
                            📄 Bảng giá
                          </a>
                        )}
                      </div>

                      {/* ADMIN ROW */}
                      {canEditProduct && (
                        <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-slate-100">
                          <select
                            value={unit.unitStatus}
                            onChange={(e) => quickUpdateStatus(unit, e.target.value)}
                            className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-bold text-slate-800 outline-none cursor-pointer flex-1"
                          >
                            <option value="DANG_BAN">🟢 Còn hàng</option>
                            <option value="DA_BAN">🔴 Đã bán</option>
                            <option value="DANG_CHO_THUE">🔵 Đang cho thuê</option>
                            <option value="TAM_NGUNG">🟠 Tạm ngưng</option>
                          </select>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => startEditUnit(unit)}
                              className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold transition cursor-pointer"
                            >
                              Sửa
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setDeleteError("");
                                setDeletingUnit(unit);
                              }}
                              className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold transition cursor-pointer"
                            >
                              Xóa
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* 4. SECTION TỔNG QUAN */}
        <section id="overview-section" className="space-y-3 scroll-mt-28">
          <h2 className="text-[18px] font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
            <span>📖</span>
            <span>Tổng quan dự án</span>
          </h2>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 shadow-xs">
            {project.description ? (
              <p className="text-[14px] text-slate-700 leading-relaxed whitespace-pre-line">
                {project.description}
              </p>
            ) : (
              <p className="text-[13px] text-slate-400 italic">
                Thông tin giới thiệu tổng quan dự án đang được cập nhật.
              </p>
            )}

            {/* Resources shortcut if any */}
            {project.resources && project.resources.length > 0 && (
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="text-[12px] font-bold text-slate-600 flex items-center gap-1.5">
                  <span>📎</span>
                  <span>Tài liệu & Tiện ích dự án:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.resources.map((res: any) => (
                    <a
                      key={res.id}
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[12px] font-bold text-blue-600 hover:bg-blue-50 transition"
                    >
                      <span>🌐</span>
                      <span>{res.title}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 5. SECTION CĂN ĐANG BÁN */}
        <section id="sales-section" className="space-y-4 scroll-mt-28">
          <h2 className="text-[18px] font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
            <span>🏷️</span>
            <span>Căn đang bán tại {project.name}</span>
          </h2>

          {saleListings.length === 0 ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-slate-400 text-[13px]">
              Hiện chưa có căn đang bán được đăng công khai trên hệ thống.
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {saleListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </section>

        {/* 6. SECTION CĂN CHO THUÊ */}
        <section id="rent-section" className="space-y-4 scroll-mt-28">
          <h2 className="text-[18px] font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
            <span>🔑</span>
            <span>Căn cho thuê tại {project.name}</span>
          </h2>

          {rentListings.length === 0 ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-slate-400 text-[13px]">
              Hiện chưa có căn cho thuê được đăng công khai trên hệ thống.
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {rentListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </section>

        {/* 7. SECTION KÝ GỬI CTA */}
        <section className="rounded-2xl bg-slate-900 p-6 text-white space-y-3 shadow-md">
          <div className="max-w-2xl space-y-1">
            <h3 className="text-[20px] font-bold text-white">
              Bạn có căn tại {project.name}?
            </h3>
            <p className="text-[13px] text-slate-300">
              Nhận định giá thị trường, tư vấn pháp lý và tiếp cận hàng ngàn khách hàng có nhu cầu thực tế ngay hôm nay.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 pt-1">
            <Link
              href={`/ky-gui?project=${project.slug}&type=SALE`}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[13px] transition shadow-xs"
            >
              Ký gửi bán →
            </Link>
            <Link
              href={`/ky-gui?project=${project.slug}&type=RENT`}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-[13px] transition border border-white/20"
            >
              Ký gửi cho thuê →
            </Link>
          </div>
        </section>
      </div>

      {/* LIGHTBOX PREVIEW MODAL FOR FLOORPLAN */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150 cursor-pointer"
        >
          <div className="relative max-w-3xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl p-2">
            <img src={getOptimizedCloudinaryUrl(previewImage, "FLOOR_PLAN")} alt="Mặt bằng căn" className="max-h-[85vh] w-auto object-contain rounded-xl" />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 bg-black/60 text-white w-8 h-8 rounded-full font-bold flex items-center justify-center text-sm"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ADD PRODUCT MODAL WITH IMAGE UPLOAD */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-[18px] font-bold text-slate-900">+ Thêm sản phẩm vào Bảng hàng</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-900 text-lg font-bold">✕</button>
            </div>

            {addError && <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-[13px] text-rose-800 font-medium">{addError}</div>}

            <form onSubmit={handleAddProduct} className="space-y-3.5 text-[14px]">
              {/* IMAGE UPLOAD SECTION */}
              <div className="space-y-2 pt-1 border-b border-slate-100 pb-3">
                <label className="label font-bold text-slate-900">Ảnh mặt bằng căn hộ</label>
                <div className="flex flex-wrap gap-2.5 items-center">
                  {addForm.images.map((url, idx) => (
                    <div key={url} className="relative w-20 h-20 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 group">
                      <img src={url} alt={`Ảnh ${idx + 1}`} className="w-full h-full object-contain" />
                      {idx === 0 && (
                        <span className="absolute top-1 left-1 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                          Ảnh chính
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          setAddForm((prev) => ({
                            ...prev,
                            images: prev.images.filter((_, i) => i !== idx),
                          }))
                        }
                        className="absolute top-1 right-1 bg-rose-600 text-white text-[10px] w-5 h-5 rounded-full font-bold flex items-center justify-center shadow"
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  <label className="w-20 h-20 rounded-xl border-2 border-dashed border-blue-300 hover:border-blue-500 bg-blue-50/50 hover:bg-blue-50 flex flex-col items-center justify-center cursor-pointer transition text-center p-1">
                    <span className="text-xl text-blue-600">+</span>
                    <span className="text-[10px] font-bold text-blue-700 leading-tight">
                      {addUploading ? "Tải lên..." : "Tải ảnh"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleFileUpload(e.target.files, false)}
                      disabled={addUploading}
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Mã căn *</label>
                  <input
                    className="input"
                    required
                    placeholder="VD: S.12A.05"
                    value={addForm.unitCode}
                    onChange={(e) => setAddForm({ ...addForm, unitCode: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Tòa / Block</label>
                  <input
                    className="input font-bold"
                    placeholder="VD: THE SEA"
                    value={addForm.block}
                    onChange={(e) => setAddForm({ ...addForm, block: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Tầng</label>
                  <input
                    className="input"
                    placeholder="VD: 12A"
                    value={addForm.floor}
                    onChange={(e) => setAddForm({ ...addForm, floor: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Nội thất</label>
                  <select
                    className="input font-medium cursor-pointer"
                    value={addForm.furnitureStatus}
                    onChange={(e) => setAddForm({ ...addForm, furnitureStatus: e.target.value })}
                  >
                    <option value="FULL_NOI_THAT">Full nội thất</option>
                    <option value="CO_BAN">Nội thất cơ bản</option>
                    <option value="BAN_GIAO_THO">Bàn giao thô</option>
                    <option value="CAN_TRONG">Căn trống</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Giá bán (Tỷ VNĐ)</label>
                  <input
                    type="number"
                    step="0.001"
                    className="input"
                    placeholder="VD: 4.32"
                    value={addForm.salePrice}
                    onChange={(e) => setAddForm({ ...addForm, salePrice: e.target.value })}
                  />
                </div>

                <div>
                  <label className="label">Diện tích (m²) *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input"
                    required
                    placeholder="VD: 86.95"
                    value={addForm.area}
                    onChange={(e) => setAddForm({ ...addForm, area: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Số phòng ngủ</label>
                  <select
                    className="input"
                    value={addForm.bedrooms}
                    onChange={(e) => setAddForm({ ...addForm, bedrooms: e.target.value })}
                  >
                    <option value="1">1 PN</option>
                    <option value="2">2 PN</option>
                    <option value="3">3 PN</option>
                    <option value="4">4+ PN</option>
                  </select>
                </div>

                <div>
                  <label className="label">Số WC</label>
                  <select
                    className="input"
                    value={addForm.bathrooms}
                    onChange={(e) => setAddForm({ ...addForm, bathrooms: e.target.value })}
                  >
                    <option value="1">1 WC</option>
                    <option value="2">2 WC</option>
                    <option value="3">3 WC</option>
                    <option value="4">4 WC</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Hướng ban công</label>
                  <select
                    className="input"
                    value={addForm.doorDirection}
                    onChange={(e) => setAddForm({ ...addForm, doorDirection: e.target.value })}
                  >
                    {Object.entries(directionLabel).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Trạng thái *</label>
                  <select
                    className="input font-medium"
                    value={addForm.unitStatus}
                    onChange={(e) => setAddForm({ ...addForm, unitStatus: e.target.value })}
                  >
                    <option value="DANG_BAN">🟢 Còn hàng / Đang bán</option>
                    <option value="DA_BAN">🔴 Đã bán</option>
                    <option value="DANG_CHO_THUE">🔵 Đang cho thuê</option>
                    <option value="TAM_NGUNG">🟠 Tạm ngưng</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Link Phiếu tính giá (URL Google Sheet / PDF / Drive)</label>
                <input
                  className="input font-mono text-[13px]"
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  value={addForm.priceSheetUrl}
                  onChange={(e) => setAddForm({ ...addForm, priceSheetUrl: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-outline flex-1 text-[14px]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={addLoading || addUploading}
                  className="btn-primary flex-1 text-[14px]"
                >
                  {addLoading ? "Đang thêm..." : "Thêm vào Bảng hàng"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PRODUCT MODAL WITH IMAGE UPLOAD & REMOVE */}
      {editingUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-[18px] font-bold text-slate-900">
                Cập nhật thông tin căn {editingUnit.unitCode}
              </h3>
              <button onClick={() => setEditingUnit(null)} className="text-slate-400 hover:text-slate-900 text-lg font-bold">✕</button>
            </div>

            {editError && <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-[13px] text-rose-800 font-medium">{editError}</div>}

            <form onSubmit={handleUpdateProduct} className="space-y-3.5 text-[14px]">
              {/* EDIT IMAGES UPLOAD & MANAGEMENT SECTION */}
              <div className="space-y-2 pt-1 border-b border-slate-100 pb-3">
                <label className="label font-bold text-slate-900">Ảnh mặt bằng căn hộ</label>
                <div className="flex flex-wrap gap-2.5 items-center">
                  {editForm.images.map((url, idx) => (
                    <div key={url} className="relative w-20 h-20 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 group">
                      <img src={url} alt={`Ảnh ${idx + 1}`} className="w-full h-full object-contain" />
                      {idx === 0 ? (
                        <span className="absolute top-1 left-1 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                          Ảnh chính
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            const newImgs = [...editForm.images];
                            const [item] = newImgs.splice(idx, 1);
                            newImgs.unshift(item);
                            setEditForm((prev) => ({ ...prev, images: newImgs }));
                          }}
                          className="absolute bottom-1 left-1 bg-slate-800/80 hover:bg-blue-600 text-white text-[8px] font-bold px-1 py-0.5 rounded transition"
                        >
                          Đặt ảnh chính
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          setEditForm((prev) => ({
                            ...prev,
                            images: prev.images.filter((_, i) => i !== idx),
                          }))
                        }
                        className="absolute top-1 right-1 bg-rose-600 text-white text-[10px] w-5 h-5 rounded-full font-bold flex items-center justify-center shadow cursor-pointer hover:bg-rose-700"
                        title="Xóa ảnh"
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  <label className="w-20 h-20 rounded-xl border-2 border-dashed border-blue-300 hover:border-blue-500 bg-blue-50/50 hover:bg-blue-50 flex flex-col items-center justify-center cursor-pointer transition text-center p-1">
                    <span className="text-xl text-blue-600">+</span>
                    <span className="text-[10px] font-bold text-blue-700 leading-tight">
                      {editUploading ? "Tải lên..." : "Thêm ảnh"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleFileUpload(e.target.files, true)}
                      disabled={editUploading}
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Mã căn *</label>
                  <input
                    className="input"
                    required
                    value={editForm.unitCode}
                    onChange={(e) => setEditForm({ ...editForm, unitCode: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Tòa / Block</label>
                  <input
                    className="input font-bold"
                    value={editForm.block}
                    onChange={(e) => setEditForm({ ...editForm, block: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Tầng</label>
                  <input
                    className="input"
                    value={editForm.floor}
                    onChange={(e) => setEditForm({ ...editForm, floor: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Nội thất</label>
                  <select
                    className="input font-medium cursor-pointer"
                    value={editForm.furnitureStatus}
                    onChange={(e) => setEditForm({ ...editForm, furnitureStatus: e.target.value })}
                  >
                    <option value="FULL_NOI_THAT">Full nội thất</option>
                    <option value="CO_BAN">Nội thất cơ bản</option>
                    <option value="BAN_GIAO_THO">Bàn giao thô</option>
                    <option value="CAN_TRONG">Căn trống</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Giá bán (Tỷ VNĐ)</label>
                  <input
                    type="number"
                    step="0.001"
                    className="input"
                    value={editForm.salePrice}
                    onChange={(e) => setEditForm({ ...editForm, salePrice: e.target.value })}
                  />
                </div>

                <div>
                  <label className="label">Diện tích (m²) *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input"
                    required
                    value={editForm.area}
                    onChange={(e) => setEditForm({ ...editForm, area: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Số phòng ngủ</label>
                  <select
                    className="input"
                    value={editForm.bedrooms}
                    onChange={(e) => setEditForm({ ...editForm, bedrooms: e.target.value })}
                  >
                    <option value="1">1 PN</option>
                    <option value="2">2 PN</option>
                    <option value="3">3 PN</option>
                    <option value="4">4+ PN</option>
                  </select>
                </div>

                <div>
                  <label className="label">Số WC</label>
                  <select
                    className="input"
                    value={editForm.bathrooms}
                    onChange={(e) => setEditForm({ ...editForm, bathrooms: e.target.value })}
                  >
                    <option value="1">1 WC</option>
                    <option value="2">2 WC</option>
                    <option value="3">3 WC</option>
                    <option value="4">4 WC</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Hướng ban công</label>
                  <select
                    className="input"
                    value={editForm.doorDirection}
                    onChange={(e) => setEditForm({ ...editForm, doorDirection: e.target.value })}
                  >
                    {Object.entries(directionLabel).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Trạng thái *</label>
                  <select
                    className="input font-medium"
                    value={editForm.unitStatus}
                    onChange={(e) => setEditForm({ ...editForm, unitStatus: e.target.value })}
                  >
                    <option value="DANG_BAN">🟢 Còn hàng / Đang bán</option>
                    <option value="DA_BAN">🔴 Đã bán</option>
                    <option value="DANG_CHO_THUE">🔵 Đang cho thuê</option>
                    <option value="TAM_NGUNG">🟠 Tạm ngưng</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Link Phiếu tính giá (URL Google Sheet / PDF / Drive)</label>
                <input
                  className="input font-mono text-[13px]"
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  value={editForm.priceSheetUrl}
                  onChange={(e) => setEditForm({ ...editForm, priceSheetUrl: e.target.value })}
                />
              </div>

              <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteError("");
                    setDeletingUnit(editingUnit);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[13px] font-bold transition flex items-center cursor-pointer"
                >
                  <span>Xóa sản phẩm này</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingUnit(null)}
                    className="btn-outline text-[13px] px-4 py-2"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading || editUploading}
                    className="btn-primary text-[13px] px-4 py-2"
                  >
                    {editLoading ? "Đang cập nhật..." : "Lưu thay đổi"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SINGLE INVENTORY DELETE CONFIRMATION MODAL */}
      {deletingUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-[18px] font-bold text-slate-900">
                Xóa căn hộ khỏi Bảng hàng?
              </h3>
              <button
                type="button"
                onClick={() => {
                  setDeletingUnit(null);
                  setDeleteError("");
                }}
                className="text-slate-400 hover:text-slate-900 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-[14px]">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1.5 text-[13px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Mã căn:</span>
                  <code className="font-extrabold text-[#0284C7] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                    {deletingUnit.unitCode}
                  </code>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Tòa & Tầng:</span>
                  <span className="font-bold text-slate-800">
                    🏢 {deletingUnit.block || "—"} {deletingUnit.floor ? `· Tầng ${deletingUnit.floor}` : ""}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Diện tích:</span>
                  <span className="font-bold text-slate-800">📐 {deletingUnit.area} m²</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Giá bán:</span>
                  <span className="font-black text-[#0284C7] text-[15px]">{formatPrice(deletingUnit)}</span>
                </div>
              </div>

              {deleteError && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-[13px] text-rose-800 font-medium">
                  {deleteError}
                </div>
              )}

              <p className="text-[12px] text-slate-500 italic">
                Bạn đang chuẩn bị xóa vĩnh viễn căn hộ này khỏi bảng hàng dự án. Thao tác này không thể hoàn tác.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDeletingUnit(null);
                  setDeleteError("");
                }}
                disabled={isDeletingUnit}
                className="btn-outline flex-1 text-[14px]"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmSingleDelete}
                disabled={isDeletingUnit}
                className="btn-primary bg-rose-600 hover:bg-rose-700 border-rose-600 flex-1 text-[14px] disabled:opacity-50"
              >
                {isDeletingUnit ? "Đang xóa..." : "Xóa căn hộ"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK INVENTORY DELETE CONFIRMATION MODAL */}
      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-[18px] font-bold text-slate-900">
                Xóa {selectedUnitIds.length} căn hộ đã chọn?
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowBulkDeleteConfirm(false);
                  setDeleteError("");
                }}
                className="text-slate-400 hover:text-slate-900 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-[14px]">
              <div className="bg-rose-50/80 p-4 rounded-2xl border border-rose-200 text-[13px] text-rose-900 space-y-1">
                <div className="font-bold text-rose-950 text-[14px]">Xác nhận xóa hàng loạt</div>
                <p>
                  Bạn đang chuẩn bị xóa vĩnh viễn <strong className="text-rose-700 font-black">{selectedUnitIds.length}</strong> căn hộ đã chọn khỏi bảng hàng dự án.
                </p>
              </div>

              {deleteError && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-[13px] text-rose-800 font-medium">
                  {deleteError}
                </div>
              )}

              <p className="text-[12px] text-slate-500 italic">
                Thao tác này sẽ xóa tất cả {selectedUnitIds.length} sản phẩm đã chọn và không thể hoàn tác.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowBulkDeleteConfirm(false);
                  setDeleteError("");
                }}
                disabled={isBulkDeleting}
                className="btn-outline flex-1 text-[14px]"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmBulkDelete}
                disabled={isBulkDeleting}
                className="btn-primary bg-rose-600 hover:bg-rose-700 border-rose-600 flex-1 text-[14px] disabled:opacity-50"
              >
                {isBulkDeleting ? "Đang xóa..." : `Xóa ${selectedUnitIds.length} căn`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
