"use client";

// Key lưu trữ referral token trong sessionStorage
const REF_STORAGE_KEY = "md_public_ref_token";

/**
 * Capture referral token từ URL (ví dụ: ?ref=CTV8K2P) và lưu tạm trong SessionStorage
 */
export function captureReferralToken(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const refParam = urlParams.get("ref")?.trim();

    if (refParam) {
      sessionStorage.setItem(REF_STORAGE_KEY, refParam);
      return refParam;
    }

    return sessionStorage.getItem(REF_STORAGE_KEY) || null;
  } catch (err) {
    console.error("Lỗi khi đọc referral token:", err);
    return null;
  }
}

/**
 * Lấy referral token đang được lưu trữ trong phiên làm việc
 */
export function getStoredReferralToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(REF_STORAGE_KEY) || null;
  } catch {
    return null;
  }
}
