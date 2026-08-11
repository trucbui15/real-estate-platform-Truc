"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import ListingCard from "@/components/ListingCard";

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
  const [activeTab, setActiveTab] = useState<"overview" | "inventory" | "sales" | "rent">("inventory");

  // Simona Heights block tabs (THE SEA / THE HARBOUR)
  const isSimona = project.slug === "simona-heights-quy-nhon";
  const [blockTab, setBlockTab] = useState<"THE SEA" | "THE HARBOUR">("THE SEA");

  // Inventory Filters
  const [bedroomFilter, setBedroomFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [directionFilter, setDirectionFilter] = useState<string>("ALL");
  const [searchUnitCode, setSearchUnitCode] = useState<string>("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

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

  const role = (session?.user as any)?.role;
  const canEditProduct = role === "ADMIN" || role === "MANAGER" || role === "STAFF";

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

  // Upload handler reusing /api/upload
  async function handleFileUpload(files: FileList | null, isEdit: boolean) {
    if (!files || files.length === 0) return;

    if (isEdit) setEditUploading(true);
    else setAddUploading(true);

    const uploadedUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          if (data.url) uploadedUrls.push(data.url);
        } else {
          const err = await res.json();
          const msg = err.error || "Lỗi upload ảnh";
          if (isEdit) setEditError(msg);
          else setAddError(msg);
        }
      } catch (e) {
        const msg = "Không thể tải ảnh lên server";
        if (isEdit) setEditError(msg);
        else setAddError(msg);
      }
    }

    if (isEdit) {
      setEditForm((prev) => ({ ...prev, images: [...prev.images, ...uploadedUrls] }));
      setEditUploading(false);
    } else {
      setAddForm((prev) => ({ ...prev, images: [...prev.images, ...uploadedUrls] }));
      setAddUploading(false);
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
      <div className="container-page">
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
              {(session?.user as any)?.publicReferralToken && (
                <button
                  type="button"
                  onClick={() => {
                    const token = (session?.user as any)?.publicReferralToken;
                    const shareUrl = `${window.location.origin}/projects/${project.slug}?ref=${token}`;
                    navigator.clipboard.writeText(shareUrl);
                    alert(`✓ Đã sao chép Link Bảng hàng đính kèm Mã CTV (${token})!\nHãy dán để chia sẻ cho khách hàng: ${shareUrl}`);
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 text-[13px] font-bold shadow-xs transition cursor-pointer"
                >
                  <span>🔗</span>
                  <span>Sao chép Link Bảng hàng CTV</span>
                </button>
              )}

              {/* REFERRAL SHARE BUTTON FOR INTERNAL STAFF */}
              {!(session?.user as any)?.publicReferralToken && (session?.user as any)?.referralCode && (
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
        <div className="container-page flex items-center gap-2 overflow-x-auto py-2 scrollbar-none">
          <button
            onClick={() => scrollToSection("inventory-section", "inventory")}
            className={`px-3.5 py-1.5 text-[13px] font-bold rounded-xl whitespace-nowrap transition-all ${
              activeTab === "inventory"
                ? "bg-[#2563EB] text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            Bảng hàng ({inventoryList.length})
          </button>
          <button
            onClick={() => scrollToSection("overview-section", "overview")}
            className={`px-3.5 py-1.5 text-[13px] font-bold rounded-xl whitespace-nowrap transition-all ${
              activeTab === "overview"
                ? "bg-[#2563EB] text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            Tổng quan
          </button>
          <button
            onClick={() => scrollToSection("sales-section", "sales")}
            className={`px-3.5 py-1.5 text-[13px] font-bold rounded-xl whitespace-nowrap transition-all ${
              activeTab === "sales"
                ? "bg-[#2563EB] text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            Căn đang bán ({totalSale})
          </button>
          <button
            onClick={() => scrollToSection("rent-section", "rent")}
            className={`px-3.5 py-1.5 text-[13px] font-bold rounded-xl whitespace-nowrap transition-all ${
              activeTab === "rent"
                ? "bg-[#2563EB] text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            Cho thuê ({totalRent})
          </button>

          <div className="ml-auto flex items-center shrink-0">
            {(session?.user as any)?.publicReferralToken && (
              <button
                type="button"
                onClick={() => {
                  const token = (session?.user as any)?.publicReferralToken;
                  const shareUrl = `${window.location.origin}/projects/${project.slug}?ref=${token}`;
                  navigator.clipboard.writeText(shareUrl);
                  alert(`✓ Đã sao chép Link Bảng hàng CTV (${token})!\nHãy dán để chia sẻ: ${shareUrl}`);
                }}
                className="px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-2xs cursor-pointer flex items-center gap-1"
              >
                <span>🔗</span>
                <span>Sao chép Link CTV</span>
              </button>
            )}

            {!(session?.user as any)?.publicReferralToken && (session?.user as any)?.referralCode && (
              <button
                type="button"
                onClick={() => {
                  const code = (session?.user as any)?.referralCode;
                  const shareUrl = `${window.location.origin}/projects/${project.slug}?ref=${code}`;
                  navigator.clipboard.writeText(shareUrl);
                  alert(`✓ Đã sao chép Link Bảng hàng Nhân viên (${code})!\nHãy dán để chia sẻ: ${shareUrl}`);
                }}
                className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition shadow-2xs cursor-pointer flex items-center gap-1"
              >
                <span>🔗</span>
                <span>Sao chép Link Nhân viên</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container-page space-y-8">
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
                    ? "bg-[#2563EB] text-white border-[#2563EB] shadow-xs"
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
                    ? "bg-[#2563EB] text-white border-[#2563EB] shadow-xs"
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
                        ? "bg-[#2563EB] text-white border-[#2563EB]"
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
                  placeholder="Tìm mã căn (VD: H.11, S.12A)..."
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
                  onClick={() => setViewMode("table")}
                  className={`px-3 py-1 text-[11px] font-bold rounded-lg transition ${
                    viewMode === "table"
                      ? "bg-white text-[#2563EB] shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  📋 Dạng bảng hàng (1 hàng 1 căn)
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`px-3 py-1 text-[11px] font-bold rounded-lg transition ${
                    viewMode === "grid"
                      ? "bg-white text-[#2563EB] shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  🎴 Dạng thẻ
                </button>
              </div>
            </div>
          </div>

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
            /* 1 HÀNG 1 CĂN HỘ (PROFESSIONAL DATA TABLE VIEW) */
            <div className="overflow-x-auto custom-scrollbar rounded-2xl border border-slate-200 bg-white shadow-xs">
              <table className="w-full min-w-[900px] text-left text-[13px]">
                <thead className="bg-slate-50 text-[12px] font-bold uppercase text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3.5">Mã căn</th>
                    <th className="px-4 py-3.5">Tòa & Tầng</th>
                    <th className="px-4 py-3.5">Cấu trúc</th>
                    <th className="px-4 py-3.5">Diện tích</th>
                    <th className="px-4 py-3.5">Hướng cửa</th>
                    <th className="px-4 py-3.5">Giá bán niêm yết</th>
                    <th className="px-4 py-3.5">Trạng thái</th>
                    <th className="px-4 py-3.5">Sơ đồ / Tài liệu</th>
                    {canEditProduct && <th className="px-4 py-3.5 text-right">Quản trị</th>}
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
                      <tr key={unit.id} className={`hover:bg-slate-50/80 transition ${isSold ? "bg-slate-50/40" : ""}`}>
                        {/* 1. MÃ CĂN */}
                        <td className="px-4 py-3.5">
                          <code className="font-black text-[13px] text-slate-900 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
                            {unit.unitCode}
                          </code>
                        </td>

                        {/* 2. TÒA & TẦNG */}
                        <td className="px-4 py-3.5 text-slate-800 font-semibold">
                          🏢 {unit.block || "The Sea"} {unit.floor ? `· Tầng ${unit.floor}` : ""}
                        </td>

                        {/* 3. CẤU TRÚC */}
                        <td className="px-4 py-3.5 text-slate-700">
                          🛏️ {unit.bedrooms || 0} PN · {unit.bathrooms || 0} WC
                        </td>

                        {/* 4. DIỆN TÍCH */}
                        <td className="px-4 py-3.5 text-slate-800 font-bold">
                          📐 {unit.area} m²
                        </td>

                        {/* 5. HƯỚNG CỬA */}
                        <td className="px-4 py-3.5 text-slate-600">
                          {unit.doorDirection ? `🧭 ${directionLabel[unit.doorDirection] || unit.doorDirection}` : "—"}
                        </td>

                        {/* 6. GIÁ BÁN NIÊM YẾT */}
                        <td className="px-4 py-3.5">
                          <span className="font-black text-[#2563EB] text-[15px]">
                            {formatPrice(unit)}
                          </span>
                        </td>

                        {/* 7. TRẠNG THÁI */}
                        <td className="px-4 py-3.5">
                          <span className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border ${statusMeta.badgeStyle}`}>
                            {statusMeta.label}
                          </span>
                        </td>

                        {/* 8. SƠ ĐỒ & BẢNG GIÁ */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
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
                          <td className="px-4 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <select
                                value={unit.unitStatus}
                                onChange={(e) => quickUpdateStatus(unit, e.target.value)}
                                className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[11px] font-bold text-slate-800 outline-none cursor-pointer"
                              >
                                <option value="DANG_BAN">🟢 Còn hàng</option>
                                <option value="DA_BAN">🔴 Đã bán</option>
                                <option value="DANG_CHO_THUE">🔵 Đang cho thuê</option>
                                <option value="TAM_NGUNG">🟠 Tạm ngưng</option>
                              </select>
                              <button
                                onClick={() => startEditUnit(unit)}
                                className="font-bold text-blue-600 hover:text-blue-800 text-[12px] px-1"
                              >
                                ✏️ Sửa
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
            /* DẠNG THẺ (GRID VIEW) - CHỈ HIỂN THỊ KHUNG ẢNH NẾU CÓ ẢNH THẬT */
            <div className="grid gap-3.5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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
                    className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 hover:border-blue-200/80 bg-white p-4 shadow-xs hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)] hover:-translate-y-[1px] transition-all duration-300 ease-out overflow-hidden space-y-2.5 cursor-default"
                  >
                    {/* STAMP OVERLAY FOR SOLD UNITS */}
                    {isSold && (
                      <div className="absolute top-3 -left-8 -rotate-[25deg] bg-rose-600 text-white font-extrabold text-[10px] px-8 py-0.5 shadow-xs z-20 uppercase tracking-wider pointer-events-none border-y border-white">
                        Đã bán
                      </div>
                    )}

                    {/* ONLY SHOW IMAGE CONTAINER IF IMAGE EXISTS */}
                    {hasImage && primaryImg && (
                      <div
                        onClick={() => setPreviewImage(primaryImg)}
                        className="relative w-full h-[140px] rounded-xl border border-slate-100 overflow-hidden flex items-center justify-center p-1.5 bg-slate-50 cursor-pointer hover:bg-slate-100 transition"
                      >
                        <img
                          src={primaryImg}
                          alt={`Sơ đồ căn ${unit.unitCode}`}
                          className="max-h-full max-w-full object-contain rounded-lg transition-transform duration-300 ease-out group-hover:scale-[1.02]"
                        />
                      </div>
                    )}

                    {/* GIÁ & MÃ CĂN */}
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <div className="font-black text-[#2563EB] text-[18px] tracking-tight">
                        {formatPrice(unit)}
                      </div>

                      <div className="font-extrabold text-slate-900 text-[16px] tracking-tight">
                        <code className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg">
                          {unit.unitCode}
                        </code>
                      </div>
                    </div>

                    {/* TÒA · TẦNG */}
                    <div className="text-[12px] font-semibold text-slate-600 flex items-center gap-1">
                      <span>🏢</span>
                      <span>
                        {unit.block || "The Sea"} {unit.floor ? `· Tầng ${unit.floor}` : ""}
                      </span>
                    </div>

                    {/* MÔ TẢ THÔNG SỐ */}
                    <div className="flex flex-wrap gap-1 text-[11px]">
                      {unit.bedrooms && (
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-semibold">
                          🛏️ {unit.bedrooms} PN
                        </span>
                      )}
                      {unit.area && (
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-semibold">
                          📐 {unit.area} m²
                        </span>
                      )}
                      {unit.doorDirection && (
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-semibold">
                          🧭 Hướng {directionLabel[unit.doorDirection] || unit.doorDirection}
                        </span>
                      )}
                    </div>

                    {/* TRẠNG THÁI BADGE & ACTIONS */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className={`px-2 py-0.5 text-[11px] font-bold rounded-md border ${statusMeta.badgeStyle}`}>
                        {statusMeta.label}
                      </span>

                      {priceSheetUrl && (
                        <a
                          href={priceSheetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                        >
                          <span>📄</span>
                          <span>Bảng giá chính thức</span>
                        </a>
                      )}
                    </div>

                    {/* ADMIN EDIT CONTROLS */}
                    {canEditProduct && (
                      <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1 font-bold text-slate-500 text-[11px]">
                          <span>⚙️ Đổi:</span>
                          <select
                            value={unit.unitStatus}
                            onChange={(e) => quickUpdateStatus(unit, e.target.value)}
                            className="rounded border border-slate-200 bg-slate-50 px-1 py-0.5 text-[11px] font-bold text-slate-800 outline-none cursor-pointer"
                          >
                            <option value="DANG_BAN">🟢 Còn hàng</option>
                            <option value="DA_BAN">🔴 Đã bán</option>
                            <option value="DANG_CHO_THUE">🔵 Đang cho thuê</option>
                            <option value="TAM_NGUNG">🟠 Tạm ngưng</option>
                          </select>

                          <button
                            onClick={() => startEditUnit(unit)}
                            className="font-bold text-blue-600 hover:text-blue-800 px-1 text-[11px]"
                          >
                            ✏️ Sửa
                          </button>
                        </div>
                      </div>
                    )}
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
            <h3 className="text-[20px] font-bold">
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
            <img src={previewImage} alt="Mặt bằng căn" className="max-h-[85vh] w-auto object-contain rounded-xl" />
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
                  <label className="label">Hướng cửa</label>
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
                ✏️ Cập nhật thông tin căn {editingUnit.unitCode}
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
                  <label className="label">Hướng cửa</label>
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

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingUnit(null)}
                  className="btn-outline flex-1 text-[14px]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={editLoading || editUploading}
                  className="btn-primary flex-1 text-[14px]"
                >
                  {editLoading ? "Đang cập nhật..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
