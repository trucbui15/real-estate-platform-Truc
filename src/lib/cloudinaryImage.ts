/**
 * Cloudinary Delivery & Optimization Utility
 * 
 * Centralized utility to ensure ALL public frontend image requests are delivered
 * using standardized presets, auto WebP/AVIF formats, and optimal widths to prevent
 * credit and bandwidth exhaustion.
 * 
 * Allowed fixed breakpoints ONLY: [300, 600, 800, 1200, 1600, 1920, 2400]
 */

export type CloudinaryDeliveryPreset =
  | "THUMBNAIL"
  | "CARD"
  | "MOBILE"
  | "GALLERY"
  | "NEWS_HERO"
  | "HERO"
  | "FLOOR_PLAN"
  | "FLOOR_PLAN_PREVIEW"
  | "FLOOR_PLAN_THUMB";

export interface CloudinaryPresetConfig {
  width: number;
  quality: string;
  crop: string;
}

export const ALLOWED_BREAKPOINTS = [300, 400, 600, 800, 1200, 1600, 1920, 2400] as const;
export type AllowedBreakpoint = typeof ALLOWED_BREAKPOINTS[number];

export const CLOUDINARY_PRESETS: Record<CloudinaryDeliveryPreset, CloudinaryPresetConfig> = {
  THUMBNAIL: {
    width: 300,
    quality: "auto",
    crop: "limit",
  },
  CARD: {
    width: 600,
    quality: "auto",
    crop: "limit",
  },
  MOBILE: {
    width: 800,
    quality: "auto",
    crop: "limit",
  },
  GALLERY: {
    width: 1200,
    quality: "auto",
    crop: "limit",
  },
  NEWS_HERO: {
    width: 1600,
    quality: "auto",
    crop: "limit",
  },
  HERO: {
    width: 1920,
    quality: "auto",
    crop: "limit",
  },
  FLOOR_PLAN: {
    width: 1400, // Chuẩn Full 1200–1600px cho sơ đồ chi tiết
    quality: "auto",
    crop: "limit",
  },
  FLOOR_PLAN_PREVIEW: {
    width: 800, // Chuẩn Preview trung gian 800px
    quality: "auto",
    crop: "limit",
  },
  FLOOR_PLAN_THUMB: {
    width: 400, // Chuẩn Thumbnail 300–400px (tạo url: w_400,q_auto,f_auto)
    quality: "auto",
    crop: "limit",
  },
};

/**
 * Normalizes any width to the nearest allowed fixed breakpoint
 * to prevent random transformation counts (e.g. w_731, w_842)
 */
export function normalizeBreakpoint(w: number): AllowedBreakpoint {
  for (const bp of ALLOWED_BREAKPOINTS) {
    if (w <= bp) return bp;
  }
  return 2400;
}

/**
 * Returns an optimized delivery URL for Cloudinary images.
 * If the input URL is not a Cloudinary URL (e.g. local /logo.png or external CDN),
 * it safely returns the original URL without modifications.
 */
export function getOptimizedCloudinaryUrl(
  url: string | null | undefined,
  presetOrWidth: CloudinaryDeliveryPreset | number = "CARD"
): string {
  if (!url || typeof url !== "string") return "";
  const trimmedUrl = url.trim();
  if (!trimmedUrl) return "";

  // Fail-safe: Non-Cloudinary URLs returned as-is
  if (!trimmedUrl.includes("res.cloudinary.com")) {
    return trimmedUrl;
  }

  let width: number;
  let quality = "auto";
  let crop = "limit";

  if (typeof presetOrWidth === "number") {
    width = normalizeBreakpoint(presetOrWidth);
  } else {
    const config = CLOUDINARY_PRESETS[presetOrWidth] || CLOUDINARY_PRESETS.CARD;
    width = config.width;
    quality = config.quality;
    crop = config.crop;
  }

  const transformParams = `f_auto,q_${quality},w_${width},c_${crop}`;

  if (trimmedUrl.includes("/upload/")) {
    const uploadIndex = trimmedUrl.indexOf("/upload/");
    const prefix = trimmedUrl.substring(0, uploadIndex + 8);
    const afterUpload = trimmedUrl.substring(uploadIndex + 8);
    const segments = afterUpload.split("/");

    // Detect if first segment is an existing transformation string
    const firstSegment = segments[0] || "";
    const isTransformSegment =
      segments.length > 1 &&
      (firstSegment.startsWith("f_") ||
        firstSegment.startsWith("w_") ||
        firstSegment.startsWith("q_") ||
        firstSegment.startsWith("c_") ||
        firstSegment.includes(","));

    if (isTransformSegment) {
      // Replace existing transformation with the standardized preset
      segments[0] = transformParams;
      return prefix + segments.join("/");
    }

    // Insert new transformation segment
    return prefix + `${transformParams}/` + afterUpload;
  }

  return trimmedUrl;
}

/**
 * Generates standard responsive srcset string using fixed breakpoints
 */
export function getCloudinarySrcSet(
  url: string | null | undefined,
  breakpoints: AllowedBreakpoint[] = [300, 600, 800, 1200]
): string {
  if (!url || typeof url !== "string" || !url.includes("res.cloudinary.com")) {
    return "";
  }
  return breakpoints
    .map((bp) => `${getOptimizedCloudinaryUrl(url, bp)} ${bp}w`)
    .join(", ");
}
