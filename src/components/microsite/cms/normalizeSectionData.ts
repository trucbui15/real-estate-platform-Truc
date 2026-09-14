import { GalleryItem, MicrositeContentItem, VideoItem } from "./types";

/**
 * Chuẩn hóa dữ liệu Tiện ích (Amenities)
 * Tương thích ngược: { name, desc, image } -> { id, title, description, image, alt, sortOrder }
 */
export function normalizeAmenitiesData(raw: any): {
  title: string;
  description: string;
  items: MicrositeContentItem[];
} {
  if (!raw) {
    return { title: "Hệ thống Tiện ích Độc bản", description: "", items: [] };
  }

  const title = raw.title || "Hệ thống Tiện ích Độc bản";
  const description = raw.description || "";
  const rawList = Array.isArray(raw.items) ? raw.items : [];

  const items: MicrositeContentItem[] = rawList.map((item: any, idx: number) => ({
    id: item.id || `amenity-${idx}-${Date.now().toString(36)}`,
    title: (item.title || item.name || "").trim(),
    description: (item.description || item.desc || "").trim(),
    image: item.image || "",
    alt: item.alt || "",
    sortOrder: typeof item.sortOrder === "number" ? item.sortOrder : idx,
  }));

  return { title, description, items };
}

/**
 * Chuẩn hóa dữ liệu Mặt bằng tầng (Floor Plans)
 * Tương thích ngược: raw.blocks ({ name, image, desc, area }) -> items
 */
export function normalizeFloorPlansData(raw: any): {
  title: string;
  description: string;
  items: MicrositeContentItem[];
} {
  if (!raw) {
    return { title: "Mặt bằng Tổng thể & Chi tiết", description: "", items: [] };
  }

  const title = raw.title || "Mặt bằng Tổng thể & Chi tiết";
  const description = raw.description || "";
  const rawList = Array.isArray(raw.items) ? raw.items : Array.isArray(raw.blocks) ? raw.blocks : [];

  const items: MicrositeContentItem[] = rawList.map((item: any, idx: number) => ({
    id: item.id || `floorplan-${idx}-${Date.now().toString(36)}`,
    title: (item.title || item.name || "").trim(),
    description: (item.description || item.desc || "").trim(),
    image: item.image || "",
    alt: item.alt || "",
    area: item.area || "",
    sortOrder: typeof item.sortOrder === "number" ? item.sortOrder : idx,
  }));

  return { title, description, items };
}

/**
 * Chuẩn hóa dữ liệu Loại căn hộ (Unit Types)
 * Tương thích ngược: raw.units ({ name, area, priceFrom, image }) -> items
 */
export function normalizeUnitTypesData(raw: any): {
  title: string;
  description: string;
  items: MicrositeContentItem[];
} {
  if (!raw) {
    return { title: "Căn hộ Mẫu & Thiết kế", description: "", items: [] };
  }

  const title = raw.title || "Căn hộ Mẫu & Thiết kế";
  const description = raw.description || "";
  const rawList = Array.isArray(raw.items) ? raw.items : Array.isArray(raw.units) ? raw.units : [];

  const items: MicrositeContentItem[] = rawList.map((item: any, idx: number) => ({
    id: item.id || `unittype-${idx}-${Date.now().toString(36)}`,
    title: (item.title || item.name || "").trim(),
    description: (item.description || "").trim(),
    area: item.area || "",
    priceFrom: item.priceFrom || "",
    image: item.image || "",
    alt: item.alt || "",
    sortOrder: typeof item.sortOrder === "number" ? item.sortOrder : idx,
  }));

  return { title, description, items };
}

/**
 * Chuẩn hóa dữ liệu Thư viện ảnh (Gallery)
 * Tương thích ngược: raw.images ({ url, caption }) -> galleryItems
 */
export function normalizeGalleryData(raw: any): {
  title: string;
  description: string;
  items: GalleryItem[];
} {
  if (!raw) {
    return { title: "Hình ảnh Dự án", description: "", items: [] };
  }

  const title = raw.title || "Hình ảnh Dự án";
  const description = raw.description || "";
  const rawList = Array.isArray(raw.galleryItems)
    ? raw.galleryItems
    : Array.isArray(raw.items)
    ? raw.items
    : Array.isArray(raw.images)
    ? raw.images
    : [];

  const items: GalleryItem[] = rawList
    .filter((item: any) => item && (item.image || item.url))
    .map((item: any, idx: number) => ({
      id: item.id || `gallery-${idx}-${Date.now().toString(36)}`,
      image: item.image || item.url || "",
      caption: (item.caption || "").trim(),
      alt: item.alt || "",
      sortOrder: typeof item.sortOrder === "number" ? item.sortOrder : idx,
    }));

  return { title, description, items };
}

/**
 * Chuẩn hóa dữ liệu Video & 360 (Video / Tour 360)
 * Tương thích ngược: raw.videoUrl / raw.tour360Url -> items
 */
export function normalizeVideoData(raw: any): {
  title: string;
  description: string;
  items: VideoItem[];
  legacyVideoUrl?: string;
  legacyTour360Url?: string;
} {
  if (!raw) {
    return { title: "Video Trải Nghiệm 360°", description: "", items: [] };
  }

  const title = raw.title || "Video Trải Nghiệm 360°";
  const description = raw.description || "";
  let items: VideoItem[] = [];

  if (Array.isArray(raw.items) && raw.items.length > 0) {
    items = raw.items.map((it: any, idx: number) => ({
      id: it.id || `video-${idx}-${Date.now().toString(36)}`,
      title: (it.title || "").trim(),
      url: (it.url || "").trim(),
      thumbnail: it.thumbnail || "",
      alt: it.alt || "",
      type: it.type || (it.url?.includes("360") ? "TOUR_360" : "YOUTUBE"),
      sortOrder: typeof it.sortOrder === "number" ? it.sortOrder : idx,
    }));
  } else {
    // Chuyển đổi dữ liệu cũ nếu có
    if (raw.tour360Url) {
      items.push({
        id: "legacy-tour360",
        title: "Khám phá không gian thực tế ảo 360°",
        url: raw.tour360Url,
        type: "TOUR_360",
        sortOrder: 0,
      });
    }
    if (raw.videoUrl) {
      items.push({
        id: "legacy-video",
        title: "Video giới thiệu toàn cảnh dự án",
        url: raw.videoUrl,
        type: "YOUTUBE",
        sortOrder: items.length,
      });
    }
  }

  return {
    title,
    description,
    items,
    legacyVideoUrl: raw.videoUrl,
    legacyTour360Url: raw.tour360Url,
  };
}

/**
 * Chuẩn hóa dữ liệu Tiến độ thi công (Progress)
 * Tương thích ngược: { date, title, image, desc } -> items
 */
export function normalizeProgressData(raw: any): {
  title: string;
  description: string;
  items: MicrositeContentItem[];
} {
  if (!raw) {
    return { title: "Cập nhật Tiến độ Thi công", description: "", items: [] };
  }

  const title = raw.title || "Cập nhật Tiến độ Thi công";
  const description = raw.description || "";
  const rawList = Array.isArray(raw.items) ? raw.items : [];

  const items: MicrositeContentItem[] = rawList.map((item: any, idx: number) => ({
    id: item.id || `progress-${idx}-${Date.now().toString(36)}`,
    date: (item.date || "").trim(),
    title: (item.title || "").trim(),
    description: (item.description || item.desc || "").trim(),
    image: item.image || "",
    alt: item.alt || "",
    sortOrder: typeof item.sortOrder === "number" ? item.sortOrder : idx,
  }));

  return { title, description, items };
}

/**
 * Chuẩn hóa dữ liệu Chính sách bán hàng (Sales Policy)
 * Tương thích ngược: promos string[] -> items
 */
export function normalizeSalesPolicyData(raw: any): {
  title: string;
  description: string;
  pdfUrl: string;
  items: MicrositeContentItem[];
  promos?: string[];
} {
  if (!raw) {
    return { title: "Chính sách Bán hàng & Ưu đãi", description: "", pdfUrl: "", items: [] };
  }

  const title = raw.title || "Chính sách Bán hàng & Ưu đãi";
  const description = raw.description || raw.summary || "";
  const pdfUrl = raw.pdfUrl || "";

  let items: MicrositeContentItem[] = [];
  if (Array.isArray(raw.items) && raw.items.length > 0) {
    items = raw.items.map((it: any, idx: number) => ({
      id: it.id || `policy-${idx}-${Date.now().toString(36)}`,
      title: (it.title || "").trim(),
      description: (it.description || "").trim(),
      image: it.image || "",
      alt: it.alt || "",
      link: it.link || "",
      sortOrder: typeof it.sortOrder === "number" ? it.sortOrder : idx,
    }));
  } else if (Array.isArray(raw.promos) && raw.promos.length > 0) {
    // Chuyển đổi danh sách promos chuỗi string cũ thành items
    items = raw.promos.map((p: any, idx: number) => ({
      id: `legacy-promo-${idx}`,
      title: typeof p === "string" ? p : p.title || `Chính sách #${idx + 1}`,
      description: typeof p === "string" ? "" : p.description || "",
      sortOrder: idx,
    }));
  }

  return { title, description, pdfUrl, items, promos: raw.promos };
}
