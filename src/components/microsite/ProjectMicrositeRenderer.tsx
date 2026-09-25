"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Script from "next/script";
import { useSession } from "next-auth/react";
import { isBackofficeRole } from "@/lib/permissions";
import { validatePhone, sanitizePhoneInput, normalizeUnitCode } from "@/lib/utils";
import { getOptimizedCloudinaryUrl } from "@/lib/cloudinaryImage";
import ListingCard from "@/components/ListingCard";
import {
  normalizeAmenitiesData,
  normalizeFloorPlansData,
  normalizeUnitTypesData,
  normalizeGalleryData,
  normalizeVideoData,
  normalizeProgressData,
  normalizeSalesPolicyData,
} from "@/components/microsite/cms/normalizeSectionData";
import OverviewBentoGrid from "@/components/microsite/OverviewBentoGrid";

interface ProjectMicrositeRendererProps {
  projectId: string;
  projectSlug: string;
  projectName: string;
  developer?: string | null;
  address?: string | null;
  sectionsConfig: any[];
  contentJson: any;
  inventories?: any[];
  listings?: any[];
  resources?: any[];
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
  isPreview?: boolean;
}

const MENU_LABEL_MAP: Record<string, string> = {
  overview: "Tổng quan",
  location: "Vị trí",
  amenities: "Tiện ích",
  floor_plans: "Mặt bằng",
  unit_types: "Căn hộ",
  gallery: "Thư viện",
  video: "Video 360°",
  progress: "Tiến độ",
  sales_policy: "Chính sách",
  documents: "Tài liệu",
  contact: "Liên hệ",
};

const unitStatusLabel: Record<string, { label: string; style: string; badgeStyle: string }> = {
  DANG_BAN: {
    label: "Còn hàng",
    style: "bg-emerald-50 border-emerald-200 text-emerald-800",
    badgeStyle: "bg-emerald-100 text-emerald-800 border-emerald-300",
  },
  DANG_CHO_THUE: {
    label: "Đang cho thuê",
    style: "bg-blue-50 border-blue-200 text-blue-800",
    badgeStyle: "bg-blue-100 text-blue-800 border-blue-300",
  },
  DA_BAN: {
    label: "Đã bán",
    style: "bg-rose-50 border-rose-200 text-rose-800",
    badgeStyle: "bg-rose-100 text-rose-800 border-rose-300",
  },
  DA_CHO_THUE: {
    label: "Đã cho thuê",
    style: "bg-rose-50 border-rose-200 text-rose-800",
    badgeStyle: "bg-rose-100 text-rose-800 border-rose-300",
  },
  TAM_NGUNG: {
    label: "Tạm ngưng",
    style: "bg-amber-50 border-amber-200 text-amber-800",
    badgeStyle: "bg-amber-100 text-amber-800 border-amber-300",
  },
  CHO_DUYET: {
    label: "Chờ duyệt",
    style: "bg-amber-50 border-amber-200 text-amber-800",
    badgeStyle: "bg-amber-100 text-amber-800 border-amber-300",
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

const resourceTypeBadge: Record<string, { label: string; icon: string }> = {
  BROCHURE: { label: "Brochure", icon: "📘" },
  LEGAL: { label: "Hồ sơ Pháp lý", icon: "⚖️" },
  PRICE_LIST: { label: "Bảng giá", icon: "📊" },
  SALES_POLICY: { label: "Chính sách bán hàng", icon: "📜" },
  FLOOR_PLAN: { label: "Mặt bằng", icon: "📐" },
  TOUR_360: { label: "Tour 360°", icon: "🌐" },
  VIDEO: { label: "Video", icon: "🎬" },
  GOOGLE_DRIVE: { label: "Thư mục Drive", icon: "📁" },
  DRIVER_TT: { label: "Tài liệu TT", icon: "📂" },
  DESIGN_FILE: { label: "File Thiết kế", icon: "🎨" },
  WEBSITE: { label: "Website", icon: "🔗" },
  OTHER: { label: "Tài liệu khác", icon: "📄" },
};

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

function parseImagesList(imagesRaw: any): string[] {
  if (!imagesRaw) return [];
  if (Array.isArray(imagesRaw)) return imagesRaw;
  try {
    const parsed = JSON.parse(imagesRaw);
    if (Array.isArray(parsed)) return parsed;
  } catch (e) {}
  return [];
}

function getPageNumbers(current: number, total: number): (number | string)[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 4) {
    return [1, 2, 3, 4, 5, "...", total];
  }
  if (current >= total - 3) {
    return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  }
  return [1, "...", current - 1, current, current + 1, "...", total];
}

export default function ProjectMicrositeRenderer({
  projectId,
  projectSlug,
  projectName,
  developer,
  address,
  sectionsConfig,
  contentJson,
  inventories = [],
  listings = [],
  resources = [],
  metaTitle,
  metaDescription,
  ogImage,
  isPreview = false,
}: ProjectMicrositeRendererProps) {
  const { data: session } = useSession();
  const isBackoffice = session && isBackofficeRole((session.user as any)?.role);

  // Track active navigation section on scroll
  const [activeSection, setActiveSection] = useState<string>("overview");

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll("section[id]");
      const scrollPosition = window.scrollY + 100;

      sections.forEach((section) => {
        const top = (section as HTMLElement).offsetTop;
        const height = (section as HTMLElement).offsetHeight;
        const id = section.getAttribute("id");

        if (scrollPosition >= top && scrollPosition < top + height && id) {
          setActiveSection(id);
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Hash Navigation Fix (Load URL #section smoothly)
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const targetId = window.location.hash.replace("#", "");
      setTimeout(() => {
        const elem = document.getElementById(targetId);
        if (elem) {
          elem.scrollIntoView({ behavior: "smooth" });
        }
      }, 300);
    }
  }, []);

  // Referral Token CTV/Staff
  const [ctvToken, setCtvToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const refParam = urlParams.get("ref");
      if (refParam) {
        setCtvToken(refParam);
      }
    }
  }, []);

  // Form Lead Contact Modal, Mobile Menu & Explore Dropdown State
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [exploreDropdownOpen, setExploreDropdownOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [galleryPreview, setGalleryPreview] = useState<{
    images: string[];
    currentIndex: number;
  } | null>(null);

  const [leadForm, setLeadForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    demandType: "TU_VAN",
    note: "Đăng ký nhận báo giá & thông tin dự án " + projectName,
  });
  const [submittingLead, setSubmittingLead] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);
  const [leadError, setLeadError] = useState("");

  // Tab State cho Floor Plans
  const [activeFloorBlock, setActiveFloorBlock] = useState(0);

  // Filter Inventory State
  const [blockTab, setBlockTab] = useState<string>("ALL");
  const [bedroomFilter, setBedroomFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [directionFilter, setDirectionFilter] = useState<string>("ALL");
  const [searchUnitCode, setSearchUnitCode] = useState<string>("");

  // Blocks list in inventories
  const blockOptions = useMemo(() => {
    const set = new Set<string>();
    inventories.forEach((u) => {
      if (u.block) set.add(u.block.toUpperCase().trim());
    });
    return Array.from(set);
  }, [inventories]);

  // Set default block if Simona or multi-block
  useEffect(() => {
    if (blockOptions.length > 0 && blockTab === "ALL") {
      if (projectSlug === "simona-heights-quy-nhon" && blockOptions.includes("THE SEA")) {
        setBlockTab("THE SEA");
      } else {
        setBlockTab(blockOptions[0]);
      }
    }
  }, [blockOptions, projectSlug, blockTab]);

  // Filtered Inventories
  const filteredInventory = useMemo(() => {
    return inventories.filter((u) => {
      // 1. Block Filter
      if (blockTab !== "ALL" && blockOptions.length > 1) {
        const uBlock = (u.block || "").toUpperCase().trim();
        if (uBlock !== blockTab && !(blockTab === "THE SEA" && uBlock.includes("SEA")) && !(blockTab === "THE HARBOUR" && uBlock.includes("HARBOUR"))) {
          return false;
        }
      }
      // 2. Bedroom
      if (bedroomFilter !== "ALL") {
        if (bedroomFilter === "1" && u.bedrooms !== 1) return false;
        if (bedroomFilter === "2" && u.bedrooms !== 2) return false;
        if (bedroomFilter === "3" && u.bedrooms !== 3) return false;
        if (bedroomFilter === "4+" && (u.bedrooms || 0) < 4) return false;
      }
      // 3. Status
      if (statusFilter !== "ALL" && u.unitStatus !== statusFilter) return false;
      // 4. Direction
      if (directionFilter !== "ALL" && u.doorDirection !== directionFilter) return false;
      // 5. Search (chuẩn hóa bỏ khoảng trắng, "-", ".", "_", lowercase)
      if (searchUnitCode.trim() !== "") {
        const normKw = normalizeUnitCode(searchUnitCode);
        const normCode = normalizeUnitCode(u.unitCode);
        const floorKw = searchUnitCode.trim().toLowerCase();
        const floor = (u.floor || "").toLowerCase();
        const matchCode = normKw ? normCode.includes(normKw) : false;
        const matchFloor = floor.includes(floorKw);
        if (!matchCode && !matchFloor) return false;
      }
      return true;
    });
  }, [inventories, blockTab, blockOptions, bedroomFilter, statusFilter, directionFilter, searchUnitCode]);

  const hasActiveFilters = bedroomFilter !== "ALL" || statusFilter !== "ALL" || directionFilter !== "ALL" || searchUnitCode !== "";

  function resetFilters() {
    setBedroomFilter("ALL");
    setStatusFilter("ALL");
    setDirectionFilter("ALL");
    setSearchUnitCode("");
  }

  // Phân trang Bảng hàng trực tiếp (mỗi trang hiển thị đúng 5 sản phẩm/căn)
  const INVENTORY_PAGE_SIZE = 5;
  const [inventoryPage, setInventoryPage] = useState<number>(1);

  // Tự động chuyển về trang 1 khi đổi bộ lọc hoặc tòa
  useEffect(() => {
    setInventoryPage(1);
  }, [blockTab, bedroomFilter, statusFilter, directionFilter, searchUnitCode]);

  const totalInventoryPages = Math.max(1, Math.ceil(filteredInventory.length / INVENTORY_PAGE_SIZE));

  const paginatedInventory = useMemo(() => {
    const start = (inventoryPage - 1) * INVENTORY_PAGE_SIZE;
    return filteredInventory.slice(start, start + INVENTORY_PAGE_SIZE);
  }, [filteredInventory, inventoryPage]);

  const inventoryFromIndex = filteredInventory.length > 0 ? (inventoryPage - 1) * INVENTORY_PAGE_SIZE + 1 : 0;
  const inventoryToIndex = Math.min(inventoryPage * INVENTORY_PAGE_SIZE, filteredInventory.length);

  // Public Resources (Active & Public)
  const publicResources = useMemo(() => {
    return (resources || []).filter((r) => r.isActive && r.isPublic);
  }, [resources]);

  const tour360Resource = useMemo(() => {
    return publicResources.find((r) => r.type === "TOUR_360");
  }, [publicResources]);

  // Section Content Extractors with normalization
  const hero = contentJson?.hero || {};
  const overview = contentJson?.overview || {};
  const location = contentJson?.location || {};
  const amenities = useMemo(() => normalizeAmenitiesData(contentJson?.amenities), [contentJson?.amenities]);
  const floorPlans = useMemo(() => normalizeFloorPlansData(contentJson?.floor_plans), [contentJson?.floor_plans]);
  const unitTypes = useMemo(() => normalizeUnitTypesData(contentJson?.unit_types), [contentJson?.unit_types]);
  const gallery = useMemo(() => normalizeGalleryData(contentJson?.gallery), [contentJson?.gallery]);
  const video = useMemo(() => normalizeVideoData(contentJson?.video), [contentJson?.video]);
  const progress = useMemo(() => normalizeProgressData(contentJson?.progress), [contentJson?.progress]);
  const salesPolicy = useMemo(() => normalizeSalesPolicyData(contentJson?.sales_policy), [contentJson?.sales_policy]);
  const documents = contentJson?.documents || {};

  // Check section content validity to hide empty sections
  const hasAmenitiesContent = amenities.items.length > 0;
  const hasFloorPlansContent = floorPlans.items.length > 0 || publicResources.some((r) => r.type === "FLOOR_PLAN" || r.type === "DESIGN_FILE");
  const hasUnitTypesContent = inventories.length > 0 || listings.length > 0 || unitTypes.items.length > 0;
  const hasGalleryContent = gallery.items.length > 0 || publicResources.some((r) => r.type === "IMAGE");
  const hasVideoContent = video.items.length > 0 || !!video.legacyTour360Url || !!video.legacyVideoUrl || !!tour360Resource || publicResources.some((r) => r.type === "VIDEO");
  const hasProgressContent = progress.items.length > 0;
  const hasPolicyContent = salesPolicy.items.length > 0 || !!salesPolicy.description || !!salesPolicy.pdfUrl || publicResources.some((r) => r.type === "SALES_POLICY" || r.type === "PRICE_LIST");
  const hasDocsContent = publicResources.length > 0 || !!documents.title;

  // Lọc các Section enabled, loại bỏ "hero" khỏi menu và sắp xếp theo order
  const activeSections = (sectionsConfig || [])
    .filter((s: any) => {
      if (!s.enabled) return false;
      if (s.id === "amenities" && !hasAmenitiesContent) return false;
      if (s.id === "floor_plans" && !hasFloorPlansContent) return false;
      if (s.id === "unit_types" && !hasUnitTypesContent) return false;
      if (s.id === "gallery" && !hasGalleryContent) return false;
      if (s.id === "video" && !hasVideoContent) return false;
      if (s.id === "progress" && !hasProgressContent) return false;
      if (s.id === "sales_policy" && !hasPolicyContent) return false;
      if (s.id === "documents" && !hasDocsContent) return false;
      return true;
    })
    .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

  const navSections = activeSections.filter((s: any) => s.id !== "hero" && MENU_LABEL_MAP[s.id]);

  const PRIMARY_SECTION_IDS = ["overview", "location", "amenities", "floor_plans", "unit_types", "progress"];
  const primaryNavSections = navSections.filter((s: any) => PRIMARY_SECTION_IDS.includes(s.id));
  const exploreNavSections = navSections.filter((s: any) => !PRIMARY_SECTION_IDS.includes(s.id));

  // Handle Lead Submit
  async function handleLeadSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLeadError("");
    setLeadSuccess(false);

    if (!leadForm.fullName.trim()) {
      setLeadError("Vui lòng nhập họ và tên.");
      return;
    }
    const phoneError = validatePhone(leadForm.phone);
    if (phoneError) {
      setLeadError(phoneError);
      return;
    }

    setSubmittingLead(true);

    try {
      const pageUrl = typeof window !== "undefined" ? window.location.href : `/du-an/${projectSlug}`;
      const refToken = typeof window !== "undefined" ? sessionStorage.getItem("md_public_ref_token") : null;
      const res = await fetch("/api/contact-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: leadForm.fullName,
          phone: leadForm.phone,
          email: leadForm.email,
          demandType: leadForm.demandType,
          note: leadForm.note,
          projectId: projectId,
          source: "PROJECT",
          pageUrl: pageUrl,
          refToken: refToken,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Không thể gửi yêu cầu");
      }

      setLeadSuccess(true);
      setLeadForm({ fullName: "", phone: "", email: "", demandType: "TU_VAN", note: "" });
    } catch (err: any) {
      setLeadError(err.message || "Lỗi gửi thông tin. Vui lòng liên hệ Hotline.");
    } finally {
      setSubmittingLead(false);
    }
  }

  // Sale & Rent Listings
  const saleListings = useMemo(() => (listings || []).filter((l: any) => l.transactionType === "SALE"), [listings]);
  const rentListings = useMemo(() => (listings || []).filter((l: any) => l.transactionType === "RENT"), [listings]);

  // Phân trang Bất động sản chuyển nhượng / rao bán (6 BĐS mỗi trang = 2 hàng x 3 cột)
  const SALE_PAGE_SIZE = 6;
  const [salePage, setSalePage] = useState<number>(1);
  const totalSalePages = Math.max(1, Math.ceil(saleListings.length / SALE_PAGE_SIZE));
  const paginatedSaleListings = useMemo(() => {
    const start = (salePage - 1) * SALE_PAGE_SIZE;
    return saleListings.slice(start, start + SALE_PAGE_SIZE);
  }, [saleListings, salePage]);
  const saleFromIndex = saleListings.length > 0 ? (salePage - 1) * SALE_PAGE_SIZE + 1 : 0;
  const saleToIndex = Math.min(salePage * SALE_PAGE_SIZE, saleListings.length);

  // Phân trang Bất động sản cho thuê (6 BĐS mỗi trang)
  const RENT_PAGE_SIZE = 6;
  const [rentPage, setRentPage] = useState<number>(1);
  const totalRentPages = Math.max(1, Math.ceil(rentListings.length / RENT_PAGE_SIZE));
  const paginatedRentListings = useMemo(() => {
    const start = (rentPage - 1) * RENT_PAGE_SIZE;
    return rentListings.slice(start, start + RENT_PAGE_SIZE);
  }, [rentListings, rentPage]);
  const rentFromIndex = rentListings.length > 0 ? (rentPage - 1) * RENT_PAGE_SIZE + 1 : 0;
  const rentToIndex = Math.min(rentPage * RENT_PAGE_SIZE, rentListings.length);

  // Dynamic Tracking IDs
  const projectGaId = contentJson?.seo?.gaId;
  const projectFbPixelId = contentJson?.seo?.fbPixelId;
  const projectGtmId = contentJson?.seo?.gtmId;

  return (
    <div className="w-full overflow-x-hidden min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-amber-400 selection:text-slate-950 pb-28 sm:pb-16 relative">
      {/* DYNAMIC PROJECT TRACKING SCRIPTS */}
      {projectGaId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${projectGaId}`} strategy="afterInteractive" />
          <Script id={`ga-project-${projectId}`} strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${projectGaId}');
            `}
          </Script>
        </>
      )}

      {projectFbPixelId && (
        <Script id={`fb-pixel-${projectId}`} strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${projectFbPixelId}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}

      {projectGtmId && (
        <Script id={`gtm-${projectId}`} strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${projectGtmId}');
          `}
        </Script>
      )}
      {/* 1. MỎNG & GỌN: BANNER DRAFT PREVIEW NỘI BỘ */}
      {isPreview && (
        <div className="bg-amber-500/90 backdrop-blur-md text-slate-950 px-4 py-1 text-[11px] font-bold sticky top-0 z-50 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>⚠️ DRAFT PREVIEW</span>
            <span className="bg-slate-950/20 text-slate-950 px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase">Bản nháp nội bộ</span>
          </div>
          {isBackoffice && (
            <Link
              href={`/dashboard/projects/${projectId}/website`}
              className="bg-slate-950 text-amber-300 hover:bg-slate-900 text-[11px] font-extrabold px-2.5 py-0.5 rounded transition flex items-center gap-1 shadow-xs"
            >
              <span>✏️</span> Chỉnh sửa trang
            </Link>
          )}
        </div>
      )}

      {/* 2. DYNAMIC SECTION RENDERER */}
      <main className="space-y-16 sm:space-y-24">
        {activeSections.map((sec: any) => {
          switch (sec.id) {
            // --- SECTION 1: HERO BANNER & PROJECT SECTION NAVIGATOR ---
            case "hero":
              return (
                <div key="hero-wrapper" className="space-y-0">
                  <section id="hero" className="relative h-[380px] sm:h-[460px] lg:h-[500px] flex items-center overflow-hidden py-6 sm:py-8">
                    {hero.bgImage ? (
                      <div className="absolute inset-0 z-0">
                        <img
                          src={getOptimizedCloudinaryUrl(hero.bgImage, "HERO")}
                          srcSet={`${getOptimizedCloudinaryUrl(hero.bgImage, "MOBILE")} 800w, ${getOptimizedCloudinaryUrl(hero.bgImage, "GALLERY")} 1200w, ${getOptimizedCloudinaryUrl(hero.bgImage, "HERO")} 1920w`}
                          sizes="100vw"
                          alt={hero.title || projectName}
                          loading="eager"
                          style={{
                            transform: `scale(${hero.bgScale || 1})`,
                            transformOrigin:
                              hero.bgPosition === "top"
                                ? "top center"
                                : hero.bgPosition === "bottom"
                                ? "bottom center"
                                : "center",
                          }}
                          className={`w-full h-full object-cover opacity-100 transition-transform duration-300 ${
                            hero.bgPosition === "top"
                              ? "object-top"
                              : hero.bgPosition === "bottom"
                              ? "object-bottom"
                              : "object-center"
                          }`}
                        />
                        {/* Soft localized gradient on content area only, preserving bright natural colors */}
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/25 via-slate-950/5 to-transparent pointer-events-none"></div>
                      </div>
                    ) : (
                      <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-900"></div>
                    )}

                    <div className="container-page relative z-10 px-4">
                      <div className="max-w-lg sm:max-w-xl space-y-3.5 bg-slate-950/20 sm:bg-slate-950/15 backdrop-blur-[2px] p-5 sm:p-7 rounded-3xl border border-white/10 text-white shadow-xl">
                        {hero.tagLine && (
                          <span className="inline-block rounded-full bg-amber-400 text-slate-950 px-3.5 py-1 text-xs font-black shadow-md">
                            {hero.tagLine}
                          </span>
                        )}

                        <h1 className="text-xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] line-clamp-3">
                          {hero.title || projectName}
                        </h1>

                        <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] line-clamp-2">
                          {hero.subtitle || address || `Dự án bất động sản hàng đầu tại Quy Nhơn.`}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 pt-1">
                          <button
                            onClick={() => setShowInquiryModal(true)}
                            className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm px-5 py-3 rounded-xl shadow-xl transition transform hover:-translate-y-0.5 flex items-center gap-2 min-h-[44px]"
                          >
                            <span>✨</span> {hero.ctaText || "Đăng ký nhận Bảng giá"}
                          </button>

                          {(() => {
                            const heroVideoUrl = hero.videoUrl || video.legacyVideoUrl || video.items.find((v) => v.type === "YOUTUBE" || v.type === "VIDEO")?.url;
                            if (!heroVideoUrl) return null;
                            return (
                              <a
                                href={heroVideoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-white/25 hover:bg-white/40 text-white font-bold text-xs sm:text-sm px-4 py-3 rounded-xl border border-white/40 backdrop-blur-xs transition flex items-center gap-2 min-h-[44px] drop-shadow-md"
                              >
                                <span>▶</span> Xem Video
                              </a>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* PROJECT SECTION NAVIGATOR - STICKY */}
                  <div className="sticky top-[64px] md:top-[68px] z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs transition-all">
                    <div className="container-page px-4">
                      {/* DESKTOP NAV ITEMS */}
                      <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-700 h-12">
                        {primaryNavSections.map((sec: any) => (
                          <a
                            key={sec.id}
                            href={`#${sec.id}`}
                            className="hover:text-blue-600 transition tracking-tight py-3 border-b-2 border-transparent hover:border-blue-600 -mb-[1px]"
                          >
                            {MENU_LABEL_MAP[sec.id]}
                          </a>
                        ))}

                        {/* DROPDOWN KHÁM PHÁ ▾ */}
                        {exploreNavSections.length > 0 && (
                          <div
                            className="relative py-3"
                            onMouseEnter={() => setExploreDropdownOpen(true)}
                            onMouseLeave={() => setExploreDropdownOpen(false)}
                          >
                            <button
                              type="button"
                              onClick={() => setExploreDropdownOpen(!exploreDropdownOpen)}
                              className="flex items-center gap-1 hover:text-blue-600 transition font-semibold text-slate-700 cursor-pointer"
                            >
                              <span>Khám phá</span>
                              <span className={`text-[10px] transition-transform duration-200 ${exploreDropdownOpen ? "rotate-180" : ""}`}>▾</span>
                            </button>

                            {exploreDropdownOpen && (
                              <div className="absolute top-full left-0 mt-1 w-44 bg-white border border-slate-200 shadow-lg rounded-xl p-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                                {exploreNavSections.map((sec: any) => (
                                  <a
                                    key={sec.id}
                                    href={`#${sec.id}`}
                                    onClick={() => setExploreDropdownOpen(false)}
                                    className="block px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition"
                                  >
                                    {MENU_LABEL_MAP[sec.id]}
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </nav>

                      {/* MOBILE NAV BUTTON & DROPDOWN (< 768px) */}
                      <div className="md:hidden flex items-center justify-between h-11 py-1">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mục lục dự án</span>
                        <button
                          type="button"
                          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                          className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 rounded-lg hover:bg-slate-200 transition cursor-pointer"
                        >
                          <span>Khám phá dự án</span>
                          <span className={`text-[10px] transition-transform duration-200 ${mobileMenuOpen ? "rotate-180" : ""}`}>▾</span>
                        </button>
                      </div>

                      {/* MOBILE DROPDOWN DRAWER */}
                      {mobileMenuOpen && (
                        <div className="md:hidden bg-white border-t border-slate-200 p-3 space-y-1 text-xs font-bold shadow-lg animate-in slide-in-from-top-2 duration-200 rounded-b-2xl">
                          {navSections.map((sec: any) => (
                            <a
                              key={sec.id}
                              href={`#${sec.id}`}
                              onClick={() => setMobileMenuOpen(false)}
                              className="block py-2 px-3 rounded-lg text-slate-800 hover:bg-slate-50 hover:text-blue-600 transition"
                            >
                              {MENU_LABEL_MAP[sec.id]}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );

            // --- SECTION 2: OVERVIEW ---
            case "overview":
              return (
                <section key="overview" id="overview" className="container-page px-4">
                  <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-12 shadow-sm space-y-8">
                    <div className="max-w-3xl space-y-3">
                      <span className="text-xs font-extrabold text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full border border-amber-200/60 inline-block">
                        Tổng Quan
                      </span>
                      <h2 className="text-xl sm:text-3xl font-black text-slate-900">
                        {overview.headline || `Thông tin tổng thể dự án ${projectName}`}
                      </h2>
                      {overview.summary && <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">{overview.summary}</p>}
                    </div>

                    {/* SPECS BENTO GRID */}
                    {overview.specs && overview.specs.length > 0 && (
                      <OverviewBentoGrid specs={overview.specs} />
                    )}
                  </div>
                </section>
              );

            // --- SECTION 3: LOCATION ---
            case "location":
              return (
                <section key="location" id="location" className="container-page px-4 space-y-8">
                  <div className="max-w-3xl space-y-2">
                    <span className="text-xs font-extrabold text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full border border-amber-200/60 inline-block">
                      Vị Trí Đắt Giá
                    </span>
                    <h2 className="text-xl sm:text-3xl font-black text-slate-900">Tâm điểm kết nối giao thông</h2>
                    {(location.address || address) && (
                      <p className="text-xs sm:text-sm text-slate-600">📍 Địa chỉ: <span className="font-bold text-slate-900">{location.address || address}</span></p>
                    )}
                  </div>

                  <div className="grid gap-6 lg:grid-cols-2 items-center">
                    {(() => {
                      let mapSrc = (location.googleMapUrl || "").trim();
                      const match = mapSrc.match(/src=["']([^"']+)["']/);
                      if (match) mapSrc = match[1];

                      if (mapSrc && (mapSrc.startsWith("https://") || mapSrc.startsWith("http://"))) {
                        return (
                          <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-md h-[300px] sm:h-[340px]">
                            <iframe src={mapSrc} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy"></iframe>
                          </div>
                        );
                      }
                      if (location.mapImage) {
                        return (
                          <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-md aspect-[16/10]">
                            <img src={getOptimizedCloudinaryUrl(location.mapImage, "GALLERY")} alt="Sơ đồ vị trí" loading="lazy" className="w-full h-full object-cover" />
                          </div>
                        );
                      }
                      return (
                        <div className="rounded-3xl bg-slate-100 border border-slate-200 p-8 text-center text-xs text-slate-500 h-[240px] flex items-center justify-center">
                          Vị trí kết nối thuận tiện tại {address || projectName}
                        </div>
                      );
                    })()}

                    <div className="space-y-4">
                      <h3 className="font-bold text-sm sm:text-base text-slate-900">Khả năng kết nối khu vực</h3>
                      <div className="space-y-2.5">
                        {location.connectivity && location.connectivity.length > 0 ? (
                          location.connectivity.map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs text-xs">
                              <span className="font-medium text-slate-700">{item.title}</span>
                              <span className="font-bold text-amber-600">{item.distance}</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-xs text-slate-600 leading-relaxed bg-white border border-slate-200 p-4 rounded-2xl">
                            Dự án sở hữu vị trí đắc địa tại {address || "trung tâm thành phố"}, dễ dàng kết nối tới các hạ tầng giao thông trọng điểm, tiện ích thương mại, trường học và khu du lịch nổi tiếng.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              );

            // --- SECTION 4: AMENITIES ---
            case "amenities": {
              const validItems = (amenities.items || []).filter((item: any) => item.title || item.image);
              if (validItems.length === 0) return null;

              return (
                <section key="amenities" id="amenities" className="container-page px-4 space-y-8">
                  <div className="max-w-3xl space-y-2">
                    <span className="text-xs font-extrabold text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full border border-amber-200/60 inline-block">
                      Tiện Ích
                    </span>
                    <h2 className="text-xl sm:text-3xl font-black text-slate-900">{amenities.title || "Hệ thống tiện ích nội khu đỉnh cao"}</h2>
                    {amenities.description && <p className="text-xs sm:text-sm text-slate-600">{amenities.description}</p>}
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {validItems.map((item: any, idx: number) => (
                      <div key={item.id || idx} className="rounded-3xl bg-white border border-slate-200/80 overflow-hidden shadow-sm hover:border-amber-400 hover:shadow-md transition group space-y-3 p-4 flex flex-col justify-between">
                        <div className="space-y-3">
                          {item.image ? (
                            <div className="aspect-[16/10] overflow-hidden rounded-2xl bg-slate-100 cursor-pointer" onClick={() => setPreviewImage(item.image)}>
                              <img
                                src={getOptimizedCloudinaryUrl(item.image, "CARD")}
                                alt={item.alt || `${projectName} - ${item.title || "Tiện ích"}`}
                                loading="lazy"
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                              />
                            </div>
                          ) : (
                            <div className="aspect-[16/10] bg-slate-100 rounded-2xl flex items-center justify-center text-3xl">
                              🏊
                            </div>
                          )}
                          <h3 className="font-bold text-sm sm:text-base text-slate-900">{item.title}</h3>
                          {item.description && (
                            <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            }

            // --- SECTION 5: FLOOR PLANS ---
            case "floor_plans": {
              const validBlocks = (floorPlans.items || []).filter((b: any) => b.title || b.image);
              if (validBlocks.length === 0 && !publicResources.some((r) => r.type === "FLOOR_PLAN" || r.type === "DESIGN_FILE")) return null;

              const activeBlock = validBlocks[activeFloorBlock] || validBlocks[0];

              return (
                <section key="floor_plans" id="floor_plans" className="container-page px-4 space-y-8">
                  <div className="max-w-3xl space-y-2">
                    <span className="text-xs font-extrabold text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full border border-amber-200/60 inline-block">
                      Mặt Bằng Kiến Trúc
                    </span>
                    <h2 className="text-xl sm:text-3xl font-black text-slate-900">{floorPlans.title || "Thiết kế mặt bằng kiến trúc chi tiết"}</h2>
                    {floorPlans.description && <p className="text-xs sm:text-sm text-slate-600">{floorPlans.description}</p>}
                  </div>

                  {validBlocks.length > 0 && (
                    <div className="space-y-6">
                      {validBlocks.length > 1 && (
                        <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                          {validBlocks.map((block: any, idx: number) => (
                            <button
                              key={block.id || idx}
                              onClick={() => setActiveFloorBlock(idx)}
                              className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition shrink-0 min-h-[40px] ${
                                activeFloorBlock === idx
                                  ? "bg-amber-400 text-slate-950 shadow-sm"
                                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                              }`}
                            >
                              {block.title || `Sơ đồ #${idx + 1}`}
                            </button>
                          ))}
                        </div>
                      )}

                      {activeBlock && (
                        <div className="bg-white border border-slate-200/80 rounded-3xl p-4 sm:p-6 flex flex-col items-center shadow-sm space-y-4">
                          {activeBlock.image ? (
                            <img
                              src={getOptimizedCloudinaryUrl(activeBlock.image, "FLOOR_PLAN")}
                              alt={activeBlock.alt || `${projectName} - ${activeBlock.title || "Mặt bằng"}`}
                              loading="lazy"
                              className="max-h-[480px] w-auto object-contain rounded-xl cursor-pointer hover:opacity-95 transition"
                              onClick={() => setPreviewImage(activeBlock.image || null)}
                            />
                          ) : (
                            <div className="h-48 flex items-center justify-center text-slate-400 text-xs">Chưa cập nhật sơ đồ mặt bằng</div>
                          )}
                          <div className="text-center space-y-1">
                            <h3 className="font-bold text-sm sm:text-base text-slate-900">{activeBlock.title}</h3>
                            {activeBlock.description && (
                              <p className="text-xs text-slate-600 font-medium max-w-2xl">{activeBlock.description}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </section>
              );
            }

            // --- SECTION 6: UNIT TYPES & INVENTORY & LISTINGS ---
            case "unit_types":
              return (
                <section key="unit_types" id="unit_types" className="container-page px-4 space-y-10">
                  {/* A. BẢNG HÀNG PROJECT INVENTORY (DỮ LIỆU THẬT) */}
                  {inventories.length > 0 && (
                    <div className="space-y-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                        <div>
                          <span className="text-xs font-extrabold text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full border border-amber-200/60 inline-block mb-1.5">
                            Bảng Hàng Trực Tiếp
                          </span>
                          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                            <span>📋</span>
                            <span>Bảng Hàng Căn Hộ {projectName} ({inventories.length} căn)</span>
                          </h2>
                          <p className="text-xs text-slate-500 mt-1">Tra cứu trực tiếp giá bán, diện tích, hướng cửa và trạng thái từ dữ liệu chính thức.</p>
                        </div>

                        {ctvToken && (
                          <button
                            type="button"
                            onClick={() => {
                              const shareUrl = `${window.location.origin}/du-an/${projectSlug}?ref=${ctvToken}`;
                              navigator.clipboard.writeText(shareUrl);
                              alert(`✓ Đã sao chép Link Bảng hàng CTV (${ctvToken})!\nChia sẻ cho khách: ${shareUrl}`);
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                          >
                            <span>🔗</span> Sao chép Link CTV
                          </button>
                        )}
                      </div>

                      {/* BLOCK TABS (NẾU CÓ NHIỀU BLOCK, VD: THE SEA / THE HARBOUR) */}
                      {blockOptions.length > 1 && (
                        <div className="flex flex-wrap items-center gap-2">
                          {blockOptions.map((b) => {
                            const count = inventories.filter((u) => (u.block || "").toUpperCase().trim() === b).length;
                            return (
                              <button
                                key={b}
                                onClick={() => setBlockTab(b)}
                                className={`px-4 py-2 text-xs font-black rounded-xl transition-all flex items-center gap-2 border ${
                                  blockTab === b
                                    ? "bg-[#0284C7] text-white border-[#0284C7] shadow-xs"
                                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                                }`}
                              >
                                <span>Tòa {b}</span>
                                <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${blockTab === b ? "bg-white/20 text-white" : "bg-blue-50 text-blue-700"}`}>
                                  {count}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* MULTI-FILTER BAR */}
                      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-500 mr-1">PN:</span>
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
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition border ${
                                  bedroomFilter === btn.key
                                    ? "bg-[#0284C7] text-white border-[#0284C7]"
                                    : "bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300"
                                }`}
                              >
                                {btn.label}
                              </button>
                            ))}
                          </div>

                          <div className="relative flex-1 min-w-[160px] max-w-xs">
                            <input
                              type="text"
                              placeholder={(session?.user as any)?.role === "COLLABORATOR_PRO" ? "Tìm theo tầng, diện tích..." : "Tìm mã căn (VD: A.05, B.12)..."}
                              value={searchUnitCode}
                              onChange={(e) => setSearchUnitCode(e.target.value)}
                              className="w-full pl-7 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                            />
                            <span className="absolute left-2.5 top-2 text-[11px] text-slate-400">🔍</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
                          <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-bold text-slate-500">Trạng thái:</span>
                              <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-800 outline-none"
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
                                className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-800 outline-none"
                              >
                                <option value="ALL">Tất cả hướng</option>
                                {Object.entries(directionLabel).map(([k, v]) => (
                                  <option key={k} value={k}>{v}</option>
                                ))}
                              </select>
                            </div>

                            {hasActiveFilters && (
                              <button onClick={resetFilters} className="text-[11px] font-bold text-rose-600 hover:underline">
                                ✕ Bỏ lọc
                              </button>
                            )}
                          </div>

                          <div className="text-[11px] text-slate-500 font-semibold">
                            {filteredInventory.length > INVENTORY_PAGE_SIZE ? (
                              <>
                                Đang xem: <strong className="text-slate-900">{inventoryFromIndex} - {inventoryToIndex}</strong> / {filteredInventory.length} căn
                                <span className="text-slate-400 font-normal ml-1">(Trang {inventoryPage}/{totalInventoryPages})</span>
                              </>
                            ) : (
                              <>Hiển thị: <strong>{filteredInventory.length}</strong> / {inventories.length} căn</>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* INVENTORY TABLE */}
                      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                                <th className="py-3 px-4">Mã Căn</th>
                                <th className="py-3 px-3">Tòa/Tầng</th>
                                <th className="py-3 px-3">PN/WC</th>
                                <th className="py-3 px-3">Diện Tích</th>
                                <th className="py-3 px-3">Hướng Cửa</th>
                                <th className="py-3 px-3">Giá Bán Niêm Yết</th>
                                <th className="py-3 px-3">Trạng Thái</th>
                                <th className="py-3 px-4 text-right">Thao Tác</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                              {paginatedInventory.length > 0 ? (
                                paginatedInventory.map((unit) => {
                                  const st = unitStatusLabel[unit.unitStatus] || unitStatusLabel.DANG_BAN;
                                  const images = parseImagesList(unit.images);
                                  return (
                                    <tr key={unit.id} className="hover:bg-amber-50/40 transition">
                                      <td className="py-3 px-4 font-black text-slate-900 flex items-center gap-2">
                                        <span>{unit.unitCode || "••••"}</span>
                                        {images.length > 0 && (
                                          <button
                                            type="button"
                                            onClick={() => setGalleryPreview({ images, currentIndex: 0 })}
                                            className="text-blue-600 hover:text-blue-800 text-[11px] underline font-semibold cursor-pointer"
                                          >
                                            🖼️ Xem sơ đồ {images.length > 1 && `(${images.length})`}
                                          </button>
                                        )}
                                      </td>
                                      <td className="py-3 px-3 text-slate-600">
                                        {unit.block ? `Tòa ${unit.block}` : "—"} {unit.floor ? `· Tầng ${unit.floor}` : ""}
                                      </td>
                                      <td className="py-3 px-3">{unit.bedrooms || 0} PN · {unit.bathrooms || 0} WC</td>
                                      <td className="py-3 px-3 font-bold">{unit.area} m²</td>
                                      <td className="py-3 px-3">{unit.doorDirection ? directionLabel[unit.doorDirection] || unit.doorDirection : "—"}</td>
                                      <td className="py-3 px-3 font-black text-amber-600 text-sm">{formatPrice(unit)}</td>
                                      <td className="py-3 px-3">
                                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${st.badgeStyle}`}>
                                          {st.label}
                                        </span>
                                      </td>
                                      <td className="py-3 px-4 text-right">
                                        <button
                                          onClick={() => {
                                            setLeadForm((prev) => ({
                                              ...prev,
                                              note: unit.unitCode
                                                ? `Tư vấn báo giá căn ${unit.unitCode} (${unit.area}m2) dự án ${projectName}`
                                                : `Tư vấn báo giá căn (${unit.area}m2) dự án ${projectName}`,
                                            }));
                                            setShowInquiryModal(true);
                                          }}
                                          className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-[11px] shadow-xs transition"
                                        >
                                          Nhận báo giá
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })
                              ) : (
                                <tr>
                                  <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                                    Không tìm thấy căn hộ phù hợp với bộ lọc.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>

                        {/* PHÂN TRANG BẢNG HÀNG (5 CĂN / TRANG) */}
                        {filteredInventory.length > INVENTORY_PAGE_SIZE && (
                          <div className="p-3.5 sm:p-4 bg-slate-50/90 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 select-none">
                            <div className="text-xs text-slate-600 font-medium text-center sm:text-left">
                              Đang hiển thị căn <strong className="text-slate-900 font-bold">{inventoryFromIndex} - {inventoryToIndex}</strong> / <strong className="text-slate-900 font-bold">{filteredInventory.length}</strong> căn
                              {totalInventoryPages > 1 && (
                                <span className="text-slate-400 ml-1.5">(Trang {inventoryPage} trên {totalInventoryPages})</span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center justify-center gap-1.5">
                              {/* Nút mũi tên lùi */}
                              <button
                                type="button"
                                disabled={inventoryPage <= 1}
                                onClick={() => {
                                  setInventoryPage((p) => Math.max(1, p - 1));
                                }}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-bold border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-35 disabled:hover:bg-white disabled:cursor-not-allowed transition flex items-center gap-1 cursor-pointer shadow-2xs"
                                title="Trang trước"
                              >
                                <span>‹</span>
                                <span className="hidden sm:inline">Trước</span>
                              </button>

                              {/* Danh sách các số trang */}
                              {getPageNumbers(inventoryPage, totalInventoryPages).map((p, idx) => {
                                if (p === "...") {
                                  return (
                                    <span key={`ellipsis-${idx}`} className="px-1 text-xs text-slate-400 font-bold">
                                      ...
                                    </span>
                                  );
                                }
                                const pageNum = Number(p);
                                const isActive = pageNum === inventoryPage;
                                return (
                                  <button
                                    key={pageNum}
                                    type="button"
                                    onClick={() => setInventoryPage(pageNum)}
                                    className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-bold border transition cursor-pointer ${
                                      isActive
                                        ? "bg-[#0284C7] text-white border-[#0284C7] shadow-xs font-black"
                                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                                    }`}
                                  >
                                    {pageNum}
                                  </button>
                                );
                              })}

                              {/* Nút mũi tên tới */}
                              <button
                                type="button"
                                disabled={inventoryPage >= totalInventoryPages}
                                onClick={() => {
                                  setInventoryPage((p) => Math.min(totalInventoryPages, p + 1));
                                }}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-bold border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-35 disabled:hover:bg-white disabled:cursor-not-allowed transition flex items-center gap-1 cursor-pointer shadow-2xs"
                                title="Trang sau"
                              >
                                <span className="hidden sm:inline">Sau</span>
                                <span>›</span>
                              </button>

                              {/* Nút Xem thêm trang tiếp theo */}
                              {inventoryPage < totalInventoryPages && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setInventoryPage((p) => Math.min(totalInventoryPages, p + 1));
                                  }}
                                  className="ml-1 sm:ml-2 px-3 py-1.5 rounded-lg text-xs font-extrabold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-xs transition flex items-center gap-1 cursor-pointer"
                                  title="Xem 5 căn tiếp theo"
                                >
                                  <span>Xem thêm</span>
                                  <span>➔</span>
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* B. BẤT ĐỘNG SẢN ĐANG GIAO DỊCH (PUBLIC LISTINGS) */}
                  {listings.length > 0 && (
                    <div className="space-y-5 pt-4">
                      <div className="max-w-3xl space-y-2">
                        <span className="text-xs font-extrabold text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full border border-amber-200/60 inline-block">
                          Thị Trường Giao Dịch
                        </span>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900">Bất động sản đang rao bán & cho thuê ({listings.length} tin)</h2>
                      </div>

                      {saleListings.length > 0 && (
                        <div className="space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                              <span>🏷️</span> Căn hộ chuyển nhượng / Rao bán ({saleListings.length})
                            </h3>
                            {saleListings.length > SALE_PAGE_SIZE && (
                              <span className="text-xs text-slate-500 font-medium">
                                Đang xem <strong>{saleFromIndex} - {saleToIndex}</strong> / {saleListings.length} tin (Trang {salePage}/{totalSalePages})
                              </span>
                            )}
                          </div>

                          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {paginatedSaleListings.map((listing) => (
                              <ListingCard key={listing.id} listing={listing} />
                            ))}
                          </div>

                          {/* PHÂN TRANG HÀNG CHUYỂN NHƯỢNG (6 BĐS / TRANG) */}
                          {saleListings.length > SALE_PAGE_SIZE && (
                            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs select-none">
                              <div className="text-xs text-slate-600 font-medium text-center sm:text-left">
                                Hiển thị <strong className="text-slate-900 font-bold">{saleFromIndex} - {saleToIndex}</strong> / <strong className="text-slate-900 font-bold">{saleListings.length}</strong> BĐS chuyển nhượng
                                {totalSalePages > 1 && (
                                  <span className="text-slate-400 ml-1.5">(Trang {salePage} trên {totalSalePages})</span>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  disabled={salePage <= 1}
                                  onClick={() => setSalePage((p) => Math.max(1, p - 1))}
                                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-35 disabled:hover:bg-white disabled:cursor-not-allowed transition flex items-center gap-1 cursor-pointer shadow-2xs"
                                  title="Trang trước"
                                >
                                  <span>‹</span>
                                  <span className="hidden sm:inline">Trước</span>
                                </button>

                                {getPageNumbers(salePage, totalSalePages).map((p, idx) => {
                                  if (p === "...") {
                                    return (
                                      <span key={`sale-ellipsis-${idx}`} className="px-1 text-xs text-slate-400 font-bold">
                                        ...
                                      </span>
                                    );
                                  }
                                  const pageNum = Number(p);
                                  const isActive = pageNum === salePage;
                                  return (
                                    <button
                                      key={`sale-page-${pageNum}`}
                                      type="button"
                                      onClick={() => setSalePage(pageNum)}
                                      className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-bold border transition cursor-pointer ${
                                        isActive
                                          ? "bg-[#0284C7] text-white border-[#0284C7] shadow-xs font-black"
                                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                                      }`}
                                    >
                                      {pageNum}
                                    </button>
                                  );
                                })}

                                <button
                                  type="button"
                                  disabled={salePage >= totalSalePages}
                                  onClick={() => setSalePage((p) => Math.min(totalSalePages, p + 1))}
                                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-35 disabled:hover:bg-white disabled:cursor-not-allowed transition flex items-center gap-1 cursor-pointer shadow-2xs"
                                  title="Trang sau"
                                >
                                  <span className="hidden sm:inline">Sau</span>
                                  <span>›</span>
                                </button>

                                {salePage < totalSalePages && (
                                  <button
                                    type="button"
                                    onClick={() => setSalePage((p) => Math.min(totalSalePages, p + 1))}
                                    className="ml-1 sm:ml-2 px-3 py-1.5 rounded-lg text-xs font-extrabold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-xs transition flex items-center gap-1 cursor-pointer"
                                    title="Xem 6 tin tiếp theo"
                                  >
                                    <span>Xem thêm</span>
                                    <span>➔</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {rentListings.length > 0 && (
                        <div className="space-y-4 pt-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                              <span>🔑</span> Căn hộ cho thuê ({rentListings.length})
                            </h3>
                            {rentListings.length > RENT_PAGE_SIZE && (
                              <span className="text-xs text-slate-500 font-medium">
                                Đang xem <strong>{rentFromIndex} - {rentToIndex}</strong> / {rentListings.length} tin (Trang {rentPage}/{totalRentPages})
                              </span>
                            )}
                          </div>

                          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {paginatedRentListings.map((listing) => (
                              <ListingCard key={listing.id} listing={listing} />
                            ))}
                          </div>

                          {/* PHÂN TRANG HÀNG CHO THUÊ (6 BĐS / TRANG) */}
                          {rentListings.length > RENT_PAGE_SIZE && (
                            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs select-none">
                              <div className="text-xs text-slate-600 font-medium text-center sm:text-left">
                                Hiển thị <strong className="text-slate-900 font-bold">{rentFromIndex} - {rentToIndex}</strong> / <strong className="text-slate-900 font-bold">{rentListings.length}</strong> BĐS cho thuê
                                {totalRentPages > 1 && (
                                  <span className="text-slate-400 ml-1.5">(Trang {rentPage} trên {totalRentPages})</span>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  disabled={rentPage <= 1}
                                  onClick={() => setRentPage((p) => Math.max(1, p - 1))}
                                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-35 disabled:hover:bg-white disabled:cursor-not-allowed transition flex items-center gap-1 cursor-pointer shadow-2xs"
                                  title="Trang trước"
                                >
                                  <span>‹</span>
                                  <span className="hidden sm:inline">Trước</span>
                                </button>

                                {getPageNumbers(rentPage, totalRentPages).map((p, idx) => {
                                  if (p === "...") {
                                    return (
                                      <span key={`rent-ellipsis-${idx}`} className="px-1 text-xs text-slate-400 font-bold">
                                        ...
                                      </span>
                                    );
                                  }
                                  const pageNum = Number(p);
                                  const isActive = pageNum === rentPage;
                                  return (
                                    <button
                                      key={`rent-page-${pageNum}`}
                                      type="button"
                                      onClick={() => setRentPage(pageNum)}
                                      className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-bold border transition cursor-pointer ${
                                        isActive
                                          ? "bg-[#0284C7] text-white border-[#0284C7] shadow-xs font-black"
                                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                                      }`}
                                    >
                                      {pageNum}
                                    </button>
                                  );
                                })}

                                <button
                                  type="button"
                                  disabled={rentPage >= totalRentPages}
                                  onClick={() => setRentPage((p) => Math.min(totalRentPages, p + 1))}
                                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-35 disabled:hover:bg-white disabled:cursor-not-allowed transition flex items-center gap-1 cursor-pointer shadow-2xs"
                                  title="Trang sau"
                                >
                                  <span className="hidden sm:inline">Sau</span>
                                  <span>›</span>
                                </button>

                                {rentPage < totalRentPages && (
                                  <button
                                    type="button"
                                    onClick={() => setRentPage((p) => Math.min(totalRentPages, p + 1))}
                                    className="ml-1 sm:ml-2 px-3 py-1.5 rounded-lg text-xs font-extrabold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-xs transition flex items-center gap-1 cursor-pointer"
                                    title="Xem 6 tin tiếp theo"
                                  >
                                    <span>Xem thêm</span>
                                    <span>➔</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* C. CĂN HỘ MẪU & THIẾT KẾ CĂN HỘ (CMS STRUCTURED DATA) */}
                  {unitTypes.items.length > 0 && (
                    <div className="space-y-6 pt-4">
                      <div className="max-w-3xl space-y-2">
                        <span className="text-xs font-extrabold text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full border border-amber-200/60 inline-block">
                          Căn Hộ Mẫu & Thiết Kế
                        </span>
                        <h2 className="text-xl sm:text-3xl font-black text-slate-900">{unitTypes.title || "Các loại diện tích & thiết kế căn hộ"}</h2>
                        {unitTypes.description && (
                          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{unitTypes.description}</p>
                        )}
                      </div>

                      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {unitTypes.items.map((unit) => (
                          <div key={unit.id} className="rounded-3xl bg-white border border-slate-200/80 p-5 space-y-4 shadow-sm hover:shadow-md transition">
                            {unit.image && (
                              <div
                                className="aspect-[16/10] rounded-2xl overflow-hidden bg-slate-100 cursor-pointer group relative"
                                onClick={() => setPreviewImage(unit.image!)}
                              >
                                <img
                                  src={getOptimizedCloudinaryUrl(unit.image, "CARD")}
                                  alt={unit.alt || unit.title || `${projectName} căn hộ`}
                                  loading="lazy"
                                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                />
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold">
                                  🔍 Xem ảnh lớn
                                </div>
                              </div>
                            )}
                            <div>
                              <h3 className="font-bold text-sm sm:text-base text-slate-900">{unit.title}</h3>
                              {unit.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{unit.description}</p>}
                            </div>
                            {unit.priceFrom && <div className="text-sm font-black text-amber-600">Từ {unit.priceFrom}</div>}
                            <button
                              onClick={() => {
                                setLeadForm((prev) => ({
                                  ...prev,
                                  note: `Đăng ký nhận báo giá cho loại căn: ${unit.title} (${projectName})`,
                                }));
                                setShowInquiryModal(true);
                              }}
                              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-xl transition min-h-[40px]"
                            >
                              Nhận thông báo giá căn này
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              );

            // --- SECTION 7: GALLERY ---
            case "gallery": {
              if (gallery.items.length === 0) return null;
              return (
                <section key="gallery" id="gallery" className="container-page px-4 space-y-8">
                  <div className="max-w-3xl space-y-2">
                    <span className="text-xs font-extrabold text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full border border-amber-200/60 inline-block">
                      Thư Viện Ảnh
                    </span>
                    <h2 className="text-xl sm:text-3xl font-black text-slate-900">{gallery.title || "Bộ sưu tập hình ảnh thực tế"}</h2>
                    {gallery.description && (
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{gallery.description}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                    {gallery.items.map((img) => (
                      <div
                        key={img.id}
                        className="rounded-2xl overflow-hidden border border-slate-200 aspect-[4/3] group relative bg-slate-100 cursor-pointer shadow-2xs hover:shadow-md transition"
                        onClick={() => setPreviewImage(img.image)}
                      >
                        {img.image ? (
                          <img
                            src={getOptimizedCloudinaryUrl(img.image, "CARD")}
                            srcSet={`${getOptimizedCloudinaryUrl(img.image, "THUMBNAIL")} 300w, ${getOptimizedCloudinaryUrl(img.image, "CARD")} 600w`}
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            alt={img.alt || img.caption || `${projectName} ảnh thực tế`}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">📷</div>
                        )}
                        {img.caption && (
                          <div className="absolute inset-x-0 bottom-0 bg-slate-900/80 p-2 text-[11px] text-white font-medium text-center truncate">
                            {img.caption}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              );
            }

            // --- SECTION 8: VIDEO & 360 ---
            case "video": {
              const hasVideoOrTour = video.items.length > 0 || video.legacyVideoUrl || video.legacyTour360Url || tour360Resource;
              if (!hasVideoOrTour) return null;

              return (
                <section key="video" id="video" className="container-page px-4 space-y-8">
                  <div className="max-w-3xl space-y-2">
                    <span className="text-xs font-extrabold text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full border border-amber-200/60 inline-block">
                      Video & Tour 360°
                    </span>
                    <h2 className="text-xl sm:text-3xl font-black text-slate-900">{video.title || "Trải nghiệm hình ảnh thực tế ảo 360°"}</h2>
                    {video.description && (
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{video.description}</p>
                    )}
                  </div>

                  <div className="space-y-6">
                    {/* Render structured items if present */}
                    {video.items.length > 0 ? (
                      <div className="grid gap-6 sm:grid-cols-2">
                        {video.items.map((item) => {
                          const isYoutube = item.type === "YOUTUBE" || item.url.includes("youtube.com") || item.url.includes("youtu.be");
                          const isTour360 = item.type === "TOUR_360";

                          if (isTour360) {
                            return (
                              <div key={item.id} className="bg-slate-900 rounded-3xl p-6 text-white space-y-4 shadow-xl flex flex-col justify-between">
                                <div className="space-y-2">
                                  <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Virtual Tour 360°</span>
                                  <h3 className="text-lg font-black text-white">{item.title || "Khám phá không gian thực tế 360°"}</h3>
                                  {item.thumbnail && (
                                    <div className="aspect-video rounded-2xl overflow-hidden bg-slate-800 my-2">
                                      <img src={getOptimizedCloudinaryUrl(item.thumbnail, "CARD")} alt={item.alt || item.title || "Tour 360"} className="w-full h-full object-cover" />
                                    </div>
                                  )}
                                </div>
                                <a
                                  href={item.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-amber-400 text-slate-950 font-black text-xs px-6 py-3.5 rounded-2xl shadow-md hover:bg-amber-300 transition min-h-[44px] flex items-center justify-center gap-2"
                                >
                                  <span>🌐</span> Mở Tour 360° Toàn Màn Hình
                                </a>
                              </div>
                            );
                          }

                          if (isYoutube) {
                            const embedUrl = item.url.includes("watch?v=")
                              ? item.url.replace("watch?v=", "embed/")
                              : item.url.includes("youtu.be/")
                              ? item.url.replace("youtu.be/", "www.youtube.com/embed/")
                              : item.url;
                            return (
                              <div key={item.id} className="space-y-2">
                                {item.title && <h3 className="font-bold text-sm sm:text-base text-slate-900">{item.title}</h3>}
                                <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-lg aspect-video bg-black">
                                  <iframe
                                    src={embedUrl}
                                    title={item.title || "Video Showcase"}
                                    className="w-full h-full"
                                    allowFullScreen
                                  ></iframe>
                                </div>
                              </div>
                            );
                          }

                          // Standard HTML5 video or external link
                          return (
                            <div key={item.id} className="space-y-2">
                              {item.title && <h3 className="font-bold text-sm sm:text-base text-slate-900">{item.title}</h3>}
                              <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-lg aspect-video bg-black">
                                <video src={item.url} poster={item.thumbnail} controls className="w-full h-full object-contain" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      /* Legacy Fallback */
                      <>
                        {(video.legacyTour360Url || tour360Resource?.url) && (
                          <div className="bg-slate-900 rounded-3xl p-6 text-white space-y-4 shadow-xl">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="space-y-1">
                                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Virtual Tour 360°</span>
                                <h3 className="text-lg font-black text-white">Khám phá không gian căn hộ 360° thực tế</h3>
                                <p className="text-xs text-slate-300">Trải nghiệm góc nhìn toàn cảnh không giới hạn trực tiếp từ điện thoại & máy tính.</p>
                              </div>
                              <a
                                href={video.legacyTour360Url || tour360Resource?.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-amber-400 text-slate-950 font-black text-xs px-6 py-3.5 rounded-2xl shadow-md hover:bg-amber-300 transition shrink-0 min-h-[44px] flex items-center justify-center gap-2"
                              >
                                <span>🌐</span> Mở Tour 360° Toàn Màn Hình
                              </a>
                            </div>
                          </div>
                        )}

                        {video.legacyVideoUrl && (
                          <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-lg aspect-video bg-black">
                            <iframe
                              src={video.legacyVideoUrl.includes("youtube.com") ? video.legacyVideoUrl.replace("watch?v=", "embed/") : video.legacyVideoUrl}
                              className="w-full h-full"
                              allowFullScreen
                            ></iframe>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </section>
              );
            }

            // --- SECTION 9: PROGRESS ---
            case "progress": {
              if (progress.items.length === 0) return null;
              return (
                <section key="progress" id="progress" className="container-page px-4 space-y-8">
                  <div className="max-w-3xl space-y-2">
                    <span className="text-xs font-extrabold text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full border border-amber-200/60 inline-block">
                      Tiến Độ
                    </span>
                    <h2 className="text-xl sm:text-3xl font-black text-slate-900">{progress.title || "Cập nhật tiến độ xây dựng công trình"}</h2>
                    {progress.description && (
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{progress.description}</p>
                    )}
                  </div>

                  <div className="space-y-4">
                    {progress.items.map((p) => (
                      <div key={p.id} className="bg-white border border-slate-200/80 rounded-3xl p-5 flex flex-col sm:flex-row gap-5 items-start shadow-sm hover:shadow-md transition">
                        {p.image && (
                          <div
                            className="w-full sm:w-56 aspect-[16/10] rounded-2xl overflow-hidden bg-slate-100 shrink-0 cursor-pointer group relative"
                            onClick={() => setPreviewImage(p.image!)}
                          >
                            <img
                              src={getOptimizedCloudinaryUrl(p.image, "CARD")}
                              alt={p.alt || p.title || "Tiến độ thi công"}
                              loading="lazy"
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold">
                              🔍 Xem ảnh
                            </div>
                          </div>
                        )}
                        <div className="space-y-2 flex-1">
                          {p.date && (
                            <span className="inline-block text-xs font-extrabold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/60">
                              📅 {p.date}
                            </span>
                          )}
                          <h3 className="font-bold text-base sm:text-lg text-slate-900">{p.title}</h3>
                          {p.description && (
                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">{p.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            }

            // --- SECTION 10: SALES POLICY ---
            case "sales_policy": {
              const hasContent = salesPolicy.items.length > 0 || salesPolicy.description || salesPolicy.pdfUrl;
              if (!hasContent) return null;

              return (
                <section key="sales_policy" id="sales_policy" className="container-page px-4 space-y-8">
                  <div className="bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-white border border-amber-300/80 rounded-3xl p-6 sm:p-10 space-y-6 shadow-sm">
                    <div className="max-w-3xl space-y-2">
                      <span className="text-xs font-extrabold text-amber-600 uppercase tracking-widest bg-amber-100/80 px-3 py-1 rounded-full border border-amber-200 inline-block">
                        Chính Sách Bán Hàng & Ưu Đãi
                      </span>
                      <h2 className="text-xl sm:text-3xl font-black text-slate-900">{salesPolicy.title || "Ưu đãi thanh toán & tiến độ hỗ trợ vay"}</h2>
                      {salesPolicy.description && <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{salesPolicy.description}</p>}
                    </div>

                    {salesPolicy.items.length > 0 && (
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 pt-2">
                        {salesPolicy.items.map((item) => (
                          <div key={item.id} className="bg-white rounded-2xl p-4 border border-amber-200/80 shadow-2xs space-y-3 flex flex-col justify-between">
                            <div className="space-y-2">
                              {item.image && (
                                <div
                                  className="aspect-video rounded-xl overflow-hidden bg-slate-100 cursor-pointer"
                                  onClick={() => setPreviewImage(item.image!)}
                                >
                                  <img src={getOptimizedCloudinaryUrl(item.image, "CARD")} alt={item.alt || item.title} className="w-full h-full object-cover" />
                                </div>
                              )}
                              <h3 className="font-bold text-sm text-slate-900">{item.title}</h3>
                              {item.description && (
                                <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
                              )}
                            </div>
                            {item.link && (
                              <a
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 pt-1"
                              >
                                <span>Xem chi tiết</span> <span>→</span>
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-4 pt-2">
                      <button
                        onClick={() => setShowInquiryModal(true)}
                        className="bg-amber-400 text-slate-950 font-black text-xs px-6 py-3.5 rounded-2xl shadow-md hover:bg-amber-300 transition min-h-[44px]"
                      >
                        Tải chính sách chi tiết & Bảng tính dòng tiền
                      </button>
                      {salesPolicy.pdfUrl && (
                        <a
                          href={salesPolicy.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-white text-slate-900 font-bold text-xs px-5 py-3.5 rounded-2xl border border-slate-300 hover:bg-slate-50 transition flex items-center gap-2 min-h-[44px]"
                        >
                          <span>📄</span> Xem file PDF Chính sách
                        </a>
                      )}
                    </div>
                  </div>
                </section>
              );
            }

            // --- SECTION 11: DOCUMENTS ---
            case "documents":
              return (
                <section key="documents" id="documents" className="container-page px-4 space-y-6">
                  <div className="max-w-3xl space-y-2">
                    <span className="text-xs font-extrabold text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full border border-amber-200/60 inline-block">
                      Tài Liệu
                    </span>
                    <h2 className="text-xl sm:text-3xl font-black text-slate-900">{documents.title || `Hồ sơ & Tài liệu chính thức ${projectName}`}</h2>
                  </div>

                  {publicResources.length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {publicResources.map((res) => {
                        const badge = resourceTypeBadge[res.type] || resourceTypeBadge.OTHER;
                        return (
                          <div key={res.id} className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-2 shadow-2xs hover:border-amber-400 transition flex flex-col justify-between">
                            <div className="space-y-1.5">
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200/60 px-2.5 py-0.5 rounded-full">
                                <span>{badge.icon}</span>
                                <span>{badge.label}</span>
                              </span>
                              <h3 className="font-bold text-sm text-slate-900 line-clamp-2">{res.title}</h3>
                              {res.description && <p className="text-xs text-slate-500 line-clamp-2">{res.description}</p>}
                            </div>
                            <div className="pt-2">
                              <a
                                href={res.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs py-2 rounded-xl transition flex items-center justify-center gap-1.5"
                              >
                                <span>Xem / Tải về</span> ↗
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                      <div className="space-y-1">
                        <h3 className="font-bold text-sm text-slate-900">Xem trọn bộ tài liệu dự án {projectName}</h3>
                        <p className="text-xs text-slate-500">Bao gồm Brochure, Pháp lý, Bảng giá & Thiết kế căn hộ.</p>
                      </div>
                      <button
                        onClick={() => setShowInquiryModal(true)}
                        className="bg-slate-900 hover:bg-slate-800 text-amber-300 text-xs font-bold px-5 py-3 rounded-2xl transition shrink-0 min-h-[44px]"
                      >
                        Đăng ký tải bộ tài liệu
                      </button>
                    </div>
                  )}
                </section>
              );

            // --- SECTION 12: CONTACT ---
            case "contact":
              return null;

            default:
              return null;
          }
        })}
      </main>

      {/* FLOATING MOBILE CONTACT BAR */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 border-t border-slate-200 p-3 sm:hidden backdrop-blur-md flex items-center justify-around gap-2 shadow-2xl">
        <button
          onClick={() => setShowInquiryModal(true)}
          className="flex-1 bg-amber-400 text-slate-950 font-black text-xs py-3 rounded-xl text-center min-h-[44px] flex items-center justify-center gap-1.5 shadow-md"
        >
          <span>📞</span> Nhận Bảng Giá & Tư Vấn
        </button>
      </div>

      {/* IMAGE PREVIEW MODAL */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-10 right-0 text-white font-bold text-lg bg-white/20 px-3 py-1 rounded-full hover:bg-white/40 transition"
            >
              ✕ Đóng
            </button>
            <img src={getOptimizedCloudinaryUrl(previewImage, "NEWS_HERO")} alt="Preview" className="max-h-[85vh] w-auto object-contain rounded-xl shadow-2xl" />
          </div>
        </div>
      )}

      {/* GALLERY PREVIEW MODAL */}
      {galleryPreview && galleryPreview.images.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-none cursor-pointer"
          onClick={() => setGalleryPreview(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[92vh] flex flex-col bg-slate-950/95 border border-white/10 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/10 text-white">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base text-slate-100">Sơ đồ mặt bằng</span>
                {galleryPreview.images.length > 1 && (
                  <span className="bg-amber-500 text-slate-950 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full">
                    {galleryPreview.currentIndex + 1} / {galleryPreview.images.length}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setGalleryPreview(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold flex items-center justify-center text-sm transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Main image */}
            <div className="relative flex-1 min-h-[300px] sm:min-h-[420px] max-h-[68vh] flex items-center justify-center p-3 sm:p-6 bg-slate-900/50">
              {galleryPreview.images.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setGalleryPreview((p) =>
                      p
                        ? {
                            ...p,
                            currentIndex:
                              (p.currentIndex - 1 + p.images.length) % p.images.length,
                          }
                        : null
                    )
                  }
                  className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-amber-500 hover:text-slate-950 text-white font-bold text-xl sm:text-2xl flex items-center justify-center shadow-lg transition backdrop-blur-xs cursor-pointer"
                >
                  ‹
                </button>
              )}

              <img
                key={galleryPreview.images[galleryPreview.currentIndex]}
                src={getOptimizedCloudinaryUrl(
                  galleryPreview.images[galleryPreview.currentIndex],
                  "FLOOR_PLAN"
                )}
                alt="Sơ đồ"
                className="max-h-[64vh] w-auto max-w-full object-contain rounded-xl shadow-lg transition-all duration-200"
              />

              {galleryPreview.images.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setGalleryPreview((p) =>
                      p
                        ? {
                            ...p,
                            currentIndex: (p.currentIndex + 1) % p.images.length,
                          }
                        : null
                    )
                  }
                  className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-amber-500 hover:text-slate-950 text-white font-bold text-xl sm:text-2xl flex items-center justify-center shadow-lg transition backdrop-blur-xs cursor-pointer"
                >
                  ›
                </button>
              )}
            </div>

            {/* Thumbnails */}
            {galleryPreview.images.length > 1 && (
              <div className="px-4 py-2.5 bg-slate-900/90 border-t border-white/10 flex items-center justify-center gap-2 overflow-x-auto">
                {galleryPreview.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() =>
                      setGalleryPreview((p) => (p ? { ...p, currentIndex: idx } : null))
                    }
                    className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden border-2 transition shrink-0 cursor-pointer ${
                      idx === galleryPreview.currentIndex
                        ? "border-amber-400 ring-2 ring-amber-300 scale-105"
                        : "border-white/20 opacity-50 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={getOptimizedCloudinaryUrl(img, "FLOOR_PLAN_THUMB")}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* INQUIRY MODAL */}
      {showInquiryModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative text-slate-900">
            <button
              onClick={() => setShowInquiryModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 font-bold text-sm p-1"
            >
              ✕
            </button>
            <h3 className="font-extrabold text-lg text-slate-900">Đăng Ký Tư Vấn {projectName}</h3>

            {leadSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-xl text-center space-y-2">
                <div>✓ Cảm ơn bạn. Chúng tôi sẽ liên hệ tư vấn trong thời gian sớm nhất!</div>
                <button onClick={() => setShowInquiryModal(false)} className="bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded-xl">Đóng</button>
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit} className="space-y-3 text-xs">
                {leadError && <div className="p-2 bg-red-50 text-red-700 rounded">{leadError}</div>}
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Họ tên *</label>
                  <input
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                    required
                    value={leadForm.fullName}
                    onChange={(e) => setLeadForm({ ...leadForm, fullName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Số điện thoại *</label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="VD: 0912345678"
                    className={`w-full px-3 py-2.5 rounded-xl border font-mono transition ${
                      leadForm.phone && validatePhone(leadForm.phone)
                        ? "border-rose-400 focus:border-rose-500 bg-rose-50/20 text-slate-900"
                        : "border-slate-200 bg-slate-50 text-slate-900"
                    }`}
                    required
                    value={leadForm.phone}
                    onChange={(e) => setLeadForm({ ...leadForm, phone: sanitizePhoneInput(e.target.value) })}
                  />
                  {leadForm.phone && validatePhone(leadForm.phone) && (
                    <p className="mt-1 text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                      <span>⚠️</span>
                      <span>{validatePhone(leadForm.phone)}</span>
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Nhu cầu *</label>
                  <select
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold"
                    value={leadForm.demandType}
                    onChange={(e) => setLeadForm({ ...leadForm, demandType: e.target.value })}
                  >
                    <option value="MUA">Cần Mua căn hộ</option>
                    <option value="THUE">Cần Thuê căn hộ</option>
                    <option value="TU_VAN">Cần Tư vấn tổng quan dự án</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Ghi chú</label>
                  <textarea
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                    value={leadForm.note}
                    onChange={(e) => setLeadForm({ ...leadForm, note: e.target.value })}
                  />
                </div>
                <button
                  type="submit"
                  disabled={submittingLead}
                  className="w-full bg-amber-400 text-slate-950 font-black py-3 rounded-xl shadow min-h-[44px]"
                >
                  {submittingLead ? "Đang gửi..." : "Gửi Đăng Ký"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
