import imageCompression from "browser-image-compression";

export type ImagePreset =
  | "DEFAULT"
  | "HERO"
  | "THUMBNAIL"
  | "GALLERY"
  | "FLOOR_PLAN";

export interface CompressionPresetConfig {
  initialQuality: number;
  maxWidthOrHeight: number;
  softTargetMB: number;
}

export const IMAGE_PRESETS: Record<ImagePreset, CompressionPresetConfig> = {
  DEFAULT: {
    initialQuality: 0.82,
    maxWidthOrHeight: 1600,
    softTargetMB: 0.35, // ~350KB
  },
  GALLERY: {
    initialQuality: 0.82,
    maxWidthOrHeight: 1600,
    softTargetMB: 0.35, // ~350KB
  },
  HERO: {
    initialQuality: 0.84,
    maxWidthOrHeight: 1920,
    softTargetMB: 0.50, // ~500KB
  },
  THUMBNAIL: {
    initialQuality: 0.78,
    maxWidthOrHeight: 1200,
    softTargetMB: 0.20, // ~200KB
  },
  FLOOR_PLAN: {
    initialQuality: 0.88,
    maxWidthOrHeight: 1600, // Chuẩn tối đa 1600px theo đề xuất (Readability + Tiết kiệm dung lượng)
    softTargetMB: 0.50, // ~500KB
  },
};

export interface OptimizationResult {
  file: File;
  originalSize: number;
  optimizedSize: number;
  reductionPercent: number;
  originalWidth: number;
  originalHeight: number;
  optimizedWidth: number;
  optimizedHeight: number;
  formattedOriginalSize: string;
  formattedOptimizedSize: string;
  isSkipped: boolean;
  isError?: boolean;
  errorMessage?: string;
  previewUrl: string;
}

export const HARD_LIMIT_BYTES: Record<ImagePreset, number> = {
  DEFAULT: 800 * 1024,   // 800 KB
  GALLERY: 800 * 1024,   // 800 KB
  HERO: 900 * 1024,      // 900 KB
  THUMBNAIL: 400 * 1024, // 400 KB
  FLOOR_PLAN: 700 * 1024 // 700 KB (Hard limit cho sơ đồ căn hộ trước khi upload)
};

export const MAX_INPUT_FILE_SIZE = 15 * 1024 * 1024; // 15 MB

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export async function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !file.type.startsWith("image/")) {
      return resolve({ width: 0, height: 0 });
    }
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      URL.revokeObjectURL(url);
      resolve({ width, height });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ width: 0, height: 0 });
    };
    img.src = url;
  });
}

/**
 * Checks if a PNG file contains transparent pixels (alpha channel)
 */
export async function hasPngAlphaChannel(file: File): Promise<boolean> {
  if (file.type !== "image/png") return false;
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          URL.revokeObjectURL(url);
          return resolve(false);
        }
        // Limit sample size for performance
        const w = Math.min(img.naturalWidth, 400);
        const h = Math.min(img.naturalHeight, 400);
        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(img, 0, 0, w, h);
        const imgData = ctx.getImageData(0, 0, w, h).data;
        for (let i = 3; i < imgData.length; i += 4) {
          if (imgData[i] < 255) {
            URL.revokeObjectURL(url);
            return resolve(true);
          }
        }
      } catch (e) {
        // Ignored
      }
      URL.revokeObjectURL(url);
      resolve(false);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(false);
    };
    img.src = url;
  });
}

/**
 * Main compression & optimization pipeline
 */
export async function compressImage(
  file: File,
  preset: ImagePreset = "DEFAULT"
): Promise<OptimizationResult> {
  const config = IMAGE_PRESETS[preset] || IMAGE_PRESETS.DEFAULT;
  const hardLimit = HARD_LIMIT_BYTES[preset] || 800 * 1024;
  const originalSize = file.size;

  // 1. Kiểm tra đầu vào: Tệp vượt quá 15MB -> Chặn ngay lập tức
  if (originalSize > MAX_INPUT_FILE_SIZE) {
    return {
      file,
      originalSize,
      optimizedSize: originalSize,
      reductionPercent: 0,
      originalWidth: 0,
      originalHeight: 0,
      optimizedWidth: 0,
      optimizedHeight: 0,
      formattedOriginalSize: formatBytes(originalSize),
      formattedOptimizedSize: formatBytes(originalSize),
      isSkipped: false,
      isError: true,
      errorMessage: `Tệp ảnh vượt quá giới hạn đầu vào cho phép (${formatBytes(MAX_INPUT_FILE_SIZE)}). Vui lòng chọn tệp nhỏ hơn.`,
      previewUrl: "",
    };
  }

  const dims = await getImageDimensions(file);
  const originalWidth = dims.width;
  const originalHeight = dims.height;

  const maxDim = Math.max(originalWidth, originalHeight);
  const isWebP = file.type === "image/webp";
  const isSmallEnough = originalSize <= config.softTargetMB * 1024 * 1024;
  const isDimensionOptimal = maxDim > 0 && maxDim <= config.maxWidthOrHeight;

  // Skip re-compression if already WebP & small & dimensions optimal
  if (isWebP && isSmallEnough && isDimensionOptimal) {
    const previewUrl = URL.createObjectURL(file);
    return {
      file,
      originalSize,
      optimizedSize: originalSize,
      reductionPercent: 0,
      originalWidth,
      originalHeight,
      optimizedWidth: originalWidth,
      optimizedHeight: originalHeight,
      formattedOriginalSize: formatBytes(originalSize),
      formattedOptimizedSize: formatBytes(originalSize),
      isSkipped: true,
      isError: false,
      previewUrl,
    };
  }

  // Detect PNG transparency
  const isTransparentPng = await hasPngAlphaChannel(file);

  // For FLOOR_PLAN, prioritize sharpness and legibility over file size.
  let fileType = "image/webp";
  if (file.type === "image/gif" || file.type === "image/svg+xml") {
    // Keep GIF/SVG as is if within hard limit
    const isError = originalSize > hardLimit;
    const previewUrl = URL.createObjectURL(file);
    return {
      file,
      originalSize,
      optimizedSize: originalSize,
      reductionPercent: 0,
      originalWidth,
      originalHeight,
      optimizedWidth: originalWidth,
      optimizedHeight: originalHeight,
      formattedOriginalSize: formatBytes(originalSize),
      formattedOptimizedSize: formatBytes(originalSize),
      isSkipped: true,
      isError,
      errorMessage: isError ? `Tệp định dạng ${file.type} (${formatBytes(originalSize)}) vượt mức trần an toàn (${formatBytes(hardLimit)}).` : undefined,
      previewUrl,
    };
  }

  if (isTransparentPng && preset !== "FLOOR_PLAN") {
    // Keep PNG to preserve exact alpha transparency
    fileType = "image/png";
  }

  const compressionOptions: any = {
    maxSizeMB: config.softTargetMB,
    maxWidthOrHeight: config.maxWidthOrHeight,
    initialQuality: config.initialQuality,
    useWebWorker: true,
    fileType,
    preserveExif: false, // Ensure EXIF orientation is applied to canvas
  };

  try {
    const compressedBlob = await imageCompression(file, compressionOptions);
    
    // Create new File object retaining filename
    const ext = fileType === "image/webp" ? ".webp" : fileType === "image/png" ? ".png" : ".jpg";
    const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
    const newFilename = `${nameWithoutExt}${ext}`;
    
    const optimizedFile = new File([compressedBlob], newFilename, {
      type: compressedBlob.type || fileType,
      lastModified: Date.now(),
    });

    // If compressed file turns out larger than original (rare), fall back to original ONLY if original <= hardLimit
    let finalFile = optimizedFile;
    let finalSize = optimizedFile.size;
    let isSkipped = false;

    if (finalSize >= originalSize && isDimensionOptimal && originalSize <= hardLimit) {
      finalFile = file;
      finalSize = originalSize;
      isSkipped = true;
    }

    // CỬA CHẶN CUỐI: Kiểm tra sau nén có vượt ngưỡng trần an toàn (Hard Limit) hay không
    const isOverHardLimit = finalSize > hardLimit;

    const optDims = await getImageDimensions(finalFile);
    const reductionPercent = originalSize > 0
      ? Math.max(0, Math.round(((originalSize - finalSize) / originalSize) * 100))
      : 0;

    const previewUrl = URL.createObjectURL(finalFile);

    return {
      file: finalFile,
      originalSize,
      optimizedSize: finalSize,
      reductionPercent,
      originalWidth,
      originalHeight,
      optimizedWidth: optDims.width || originalWidth,
      optimizedHeight: optDims.height || originalHeight,
      formattedOriginalSize: formatBytes(originalSize),
      formattedOptimizedSize: formatBytes(finalSize),
      isSkipped,
      isError: isOverHardLimit,
      errorMessage: isOverHardLimit
        ? `Ảnh "${file.name}" sau khi nén vẫn đạt ${formatBytes(finalSize)}, vượt quá mức trần an toàn (${formatBytes(hardLimit)}). Hãy chọn ảnh có độ phân giải phù hợp hơn.`
        : undefined,
      previewUrl,
    };
  } catch (error: any) {
    console.error("Lỗi nén ảnh:", error);
    // QUY TẮC AN TOÀN BẮT BUỘC: Nếu nén lỗi và tệp gốc > hardLimit -> TUYỆT ĐỐI KHÔNG FALLBACK TẢI FILE GỐC!
    const isError = originalSize > hardLimit;
    const previewUrl = URL.createObjectURL(file);
    return {
      file,
      originalSize,
      optimizedSize: originalSize,
      reductionPercent: 0,
      originalWidth,
      originalHeight,
      optimizedWidth: originalWidth,
      optimizedHeight: originalHeight,
      formattedOriginalSize: formatBytes(originalSize),
      formattedOptimizedSize: formatBytes(originalSize),
      isSkipped: !isError,
      isError,
      errorMessage: isError
        ? `Quá trình nén tệp "${file.name}" gặp sự cố. Hệ thống đã chặn tải lên tệp gốc (${formatBytes(originalSize)}) để bảo vệ tài khoản Cloudinary.`
        : undefined,
      previewUrl,
    };
  }
}

/**
 * Concurrency Queue for Multi-Image Compression (Error isolation & memory safe)
 */
export async function compressImagesInBatch(
  files: File[],
  preset: ImagePreset = "DEFAULT",
  concurrencyLimit = 3,
  onProgress?: (index: number, total: number, result: OptimizationResult) => void
): Promise<OptimizationResult[]> {
  const results: OptimizationResult[] = new Array(files.length);
  let currentIndex = 0;

  async function worker() {
    while (currentIndex < files.length) {
      const index = currentIndex++;
      const file = files[index];
      try {
        const res = await compressImage(file, preset);
        results[index] = res;
        if (onProgress) onProgress(index, files.length, res);
      } catch (err: any) {
        const previewUrl = URL.createObjectURL(file);
        const hardLimit = HARD_LIMIT_BYTES[preset] || 800 * 1024;
        const isError = file.size > hardLimit;
        const fallbackRes: OptimizationResult = {
          file,
          originalSize: file.size,
          optimizedSize: file.size,
          reductionPercent: 0,
          originalWidth: 0,
          originalHeight: 0,
          optimizedWidth: 0,
          optimizedHeight: 0,
          formattedOriginalSize: formatBytes(file.size),
          formattedOptimizedSize: formatBytes(file.size),
          isSkipped: !isError,
          isError,
          errorMessage: isError
            ? `Lỗi nén tệp "${file.name}". Không thể upload tệp gốc ${formatBytes(file.size)} chưa qua xử lý.`
            : undefined,
          previewUrl,
        };
        results[index] = fallbackRes;
        if (onProgress) onProgress(index, files.length, fallbackRes);
      }
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrencyLimit, files.length) },
    () => worker()
  );
  await Promise.all(workers);
  return results;
}

/**
 * Revokes object URLs for memory safety
 */
export function revokePreviewUrl(url: string) {
  if (url && url.startsWith("blob:")) {
    try {
      URL.revokeObjectURL(url);
    } catch (e) {
      // Ignored
    }
  }
}
