export function formatVND(value?: number | null) {
  if (value === null || value === undefined) return "Thoả thuận";
  if (value >= 1_000_000_000) {
    const ty = value / 1_000_000_000;
    return `${ty % 1 === 0 ? ty : ty.toFixed(2)} tỷ`;
  }
  if (value >= 1_000_000) {
    const trieu = value / 1_000_000;
    return `${trieu % 1 === 0 ? trieu : trieu.toFixed(1)} triệu`;
  }
  return value.toLocaleString("vi-VN") + " đ";
}

export function formatVNDText(value?: number | string | null): string {
  if (value === null || value === undefined || value === "") return "";
  const num = typeof value === "number" ? value : Number(value);
  if (isNaN(num) || num <= 0) return "";

  const billion = Math.floor(num / 1_000_000_000);
  const million = Math.floor((num % 1_000_000_000) / 1_000_000);
  const thousand = Math.floor((num % 1_000_000) / 1_000);
  const remainder = Math.floor(num % 1_000);

  const parts: string[] = [];

  if (billion > 0) parts.push(`${billion} tỷ`);
  if (million > 0) parts.push(`${million} triệu`);
  if (thousand > 0) parts.push(`${thousand} nghìn`);
  if (remainder > 0 && parts.length === 0) parts.push(`${remainder} đồng`);

  if (parts.length === 0) return "";

  return parts.join(" ") + " VNĐ";
}

/**
 * Chuẩn hóa số điện thoại:
 * - trim khoảng trắng
 * - loại bỏ space, dấu chấm '.', dấu gạch ngang '-'
 * - hỗ trợ chuyển đổi đầu số quốc tế +84 hoặc 84 sang 0
 */
export function normalizePhone(phone?: string | null): string {
  if (!phone) return "";
  let p = phone.trim().replace(/[\s.-]/g, "");
  if (p.startsWith("+84")) {
    p = "0" + p.slice(3);
  } else if (p.startsWith("84") && p.length === 11) {
    p = "0" + p.slice(2);
  }
  return p;
}

/**
 * Regex kiểm tra số điện thoại Việt Nam chuẩn:
 * - Đúng 10 chữ số
 * - Bắt đầu bằng chữ số 0
 */
export const VIETNAM_PHONE_REGEX = /^0\d{9}$/;

export const PHONE_ERROR_REQUIRED = "Vui lòng nhập số điện thoại.";
export const PHONE_ERROR_INVALID = "Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0.";

/**
 * Kiểm tra tính hợp lệ của số điện thoại Việt Nam (sau khi normalize)
 */
export function isValidPhone(phone?: string | null): boolean {
  if (!phone) return false;
  const normalized = normalizePhone(phone);
  return VIETNAM_PHONE_REGEX.test(normalized);
}

/**
 * Validate số điện thoại và trả về thông báo lỗi chuẩn nếu không hợp lệ
 * @returns string thông báo lỗi nếu có, hoặc null nếu hợp lệ
 */
export function validatePhone(phone?: string | null): string | null {
  if (!phone || !phone.trim()) {
    return PHONE_ERROR_REQUIRED;
  }
  const normalized = normalizePhone(phone);
  if (!VIETNAM_PHONE_REGEX.test(normalized)) {
    return PHONE_ERROR_INVALID;
  }
  return null;
}

/**
 * Ràng buộc nhập số điện thoại trên UI:
 * - Chỉ cho phép nhập chữ số 0-9
 * - Tự động chuyển đổi +84 thành 0 nếu dán vào
 * - Giới hạn tối đa 10 chữ số
 */
export function sanitizePhoneInput(val: string): string {
  if (!val) return "";
  let digits = val.trim();
  if (digits.startsWith("+84")) {
    digits = "0" + digits.slice(3);
  } else if (digits.startsWith("84") && digits.length === 11) {
    digits = "0" + digits.slice(2);
  }
  return digits.replace(/\D/g, "").slice(0, 10);
}

export function slugify(str: string) {
  const map: Record<string, string> = {
    à: "a", á: "a", ạ: "a", ả: "a", ã: "a", â: "a", ầ: "a", ấ: "a", ậ: "a", ẩ: "a", ẫ: "a",
    ă: "a", ằ: "a", ắ: "a", ặ: "a", ẳ: "a", ẵ: "a",
    è: "e", é: "e", ẹ: "e", ẻ: "e", ẽ: "e", ê: "e", ề: "e", ế: "e", ệ: "e", ể: "e", ễ: "e",
    ì: "i", í: "i", ị: "i", ỉ: "i", ĩ: "i",
    ò: "o", ó: "o", ọ: "o", ỏ: "o", õ: "o", ô: "o", ồ: "o", ố: "o", ộ: "o", ổ: "o", ỗ: "o",
    ơ: "o", ờ: "o", ớ: "o", ợ: "o", ở: "o", ỡ: "o",
    ù: "u", ú: "u", ụ: "u", ủ: "u", ũ: "u", ư: "u", ừ: "u", ứ: "u", ự: "u", ử: "u", ữ: "u",
    ỳ: "y", ý: "y", ỵ: "y", ỷ: "y", ỹ: "y",
    đ: "d",
  };
  return str
    .toLowerCase()
    .split("")
    .map((c) => map[c] ?? c)
    .join("")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function parseImages(images?: string | string[] | null): string[] {
  if (!images) return [];
  if (Array.isArray(images)) return images.map((s) => String(s).trim()).filter(Boolean);
  if (typeof images !== "string") return [];

  const trimmed = images.trim();
  if (!trimmed) return [];

  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean);
      }
    } catch (e) {
      // Fallback
    }
  }

  if (trimmed.includes("\n") || trimmed.includes(",")) {
    return trimmed
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  return [trimmed];
}

export function optimizeCloudinaryUrl(url: string, width = 800): string {
  if (!url || typeof url !== "string") return url;
  if (!url.includes("res.cloudinary.com")) return url;
  if (url.includes("/upload/f_auto,q_auto")) return url;
  return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width},c_limit/`);
}

export const LABELS = {
  propertyType: {
    CAN_HO: "Căn hộ",
    OFFICETEL: "Officetel",
    CONDOTEL: "Condotel",
    PENTHOUSE: "Penthouse",
    DUPLEX: "Duplex",
    SHOPHOUSE_KHOI_DE: "Shophouse khối đế",
    NHA_LIEN_KE: "Nhà liền kề",
    DAT_NEN: "Đất nền",
    SHOPHOUSE_LIEN_KE: "Shophouse liên kế",
    BIET_THU_SONG_LAP: "Biệt thự song lập",
    BIET_THU_DON_LAP: "Biệt thự đơn lập",
    NHA_PHO: "Nhà phố",
    DAT_NEN_DU_AN: "Đất nền dự án",
    DAT_THO_CU: "Đất thổ cư",
  },
  direction: {
    DONG: "Đông", TAY: "Tây", NAM: "Nam", BAC: "Bắc",
    DONG_NAM: "Đông Nam", TAY_NAM: "Tây Nam", TAY_BAC: "Tây Bắc", DONG_BAC: "Đông Bắc",
  },
  furnitureStatus: {
    FULL_NOI_THAT: "Full nội thất",
    CO_BAN: "Nội thất cơ bản",
    BAN_GIAO_THO: "Bàn giao thô",
    CAN_TRONG: "Căn trống",
  },
  legalStatus: {
    SO_DO_HONG: "Sổ đỏ/hồng",
    HOP_DONG_MUA_BAN: "Hợp đồng mua bán",
    DANG_CHO_SO: "Đang chờ sổ",
    VI_BANG: "Vi bằng",
  },
  unitStatus: {
    DANG_BAN: "Đang bán",
    DANG_CHO_THUE: "Đang cho thuê",
    DA_BAN: "Đã bán",
    DA_CHO_THUE: "Đã cho thuê",
    TAM_NGUNG: "Tạm ngưng",
    CHO_DUYET: "Chờ duyệt",
  },
  transactionType: { SALE: "Bán", RENT: "Cho thuê" },
  leadStatus: {
    MOI: "Mới", DANG_LIEN_HE: "Đang liên hệ", DA_HEN_GAP: "Đã hẹn gặp",
    DA_CHOT: "Đã chốt", KHONG_TIEM_NANG: "Không tiềm năng", DONG: "Đóng",
  },
  demandType: {
    MUA: "Mua", THUE: "Thuê", KY_GUI_BAN: "Ký gửi bán",
    KY_GUI_CHO_THUE: "Ký gửi cho thuê", TU_VAN: "Tư vấn",
  },
  leadSource: {
    LISTING: "Tin đăng BĐS",
    PROJECT: "Trang Dự án",
    FOOTER: "Chân trang (Footer)",
    CONTACT: "Trang Liên hệ",
    CONSIGNMENT: "Ký gửi BĐS",
    DIRECT: "Trực tiếp",
    CTV: "Cộng tác viên (CTV)",
    WEBSITE: "Website",
    HOTLINE: "Hotline",
    ZALO: "Zalo OA",
    FACEBOOK: "Facebook",
    GIOI_THIEU: "Giới thiệu",
    KY_GUI: "Ký gửi BĐS",
    KHAC: "Nguồn khác",
  },
  projectResourceType: {
    WEBSITE: "Website",
    TOUR_360: "Link 360°",
    GENERAL_INFO: "Tổng thông tin",
    DRIVER_TT: "Driver TT",
    PRICE_LIST: "Bảng giá",
    SALES_POLICY: "Chính sách bán hàng",
    FLOOR_PLAN: "Mặt bằng",
    BROCHURE: "Brochure",
    LEGAL: "Pháp lý",
    PROGRESS: "Tiến độ",
    VIDEO: "Video",
    DESIGN_FILE: "File thiết kế",
    IMAGE: "Hình ảnh",
    GOOGLE_DRIVE: "Google Drive",
    OTHER: "Khác",
  },
} as const;

export function getProjectCoverImage(project: any): string | null {
  if (!project) return null;
  if (project.thumbnail && typeof project.thumbnail === "string" && project.thumbnail.trim() !== "" && !project.thumbnail.includes("placeholder")) {
    return project.thumbnail;
  }
  const projectImages = parseImages(project.images);
  if (projectImages.length > 0) {
    return projectImages[0];
  }
  if (project.listings && Array.isArray(project.listings) && project.listings.length > 0) {
    for (const listing of project.listings) {
      const listingImages = parseImages(listing.images);
      if (listingImages.length > 0) {
        return listingImages[0];
      }
    }
  }
  return null;
}

