"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { formatVND, parseImages, LABELS, validatePhone, sanitizePhoneInput } from "@/lib/utils";
import ListingCard from "@/components/ListingCard";
import ListingGallery from "@/components/ListingGallery";
import { CONTACT_CONFIG } from "@/config/contact";

interface ListingDetailClientProps {
  listing: any;
  relatedListings: any[];
}

export default function ListingDetailClient({
  listing,
  relatedListings,
}: ListingDetailClientProps) {
  const { data: session } = useSession();
  const isBackoffice = session && ["ADMIN", "MANAGER", "STAFF"].includes((session.user as any).role);

  let images = parseImages(listing.images);
  if (images.length === 0 && listing.project?.images) {
    images = parseImages(listing.project.images);
  }

  // Consultation form state
  const [fullName, setFullName] = useState(session?.user?.name || "");
  const [phone, setPhone] = useState((session?.user as any)?.phone || "");
  const [demandType, setDemandType] = useState(listing.transactionType === "RENT" ? "THUE" : "MUA");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [consultModalOpen, setConsultModalOpen] = useState(false);

  const [ctvToken, setCtvToken] = useState<string | null>(null);

  // Auto fill logged in user details (with /api/me fallback for existing sessions)
  useEffect(() => {
    if (session?.user) {
      if ((session.user as any).publicReferralToken) {
        setCtvToken((session.user as any).publicReferralToken);
      }
      if (session.user.name && !fullName) setFullName(session.user.name);
      if ((session.user as any).phone) {
        setPhone((session.user as any).phone);
      }
      fetch("/api/me")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.phone && !phone) setPhone(data.phone);
          if (data?.name && !fullName) setFullName(data.name);
          if (data?.publicReferralToken) setCtvToken(data.publicReferralToken);
        })
        .catch(() => {});
    }
  }, [session]);

  const effectiveCtvToken = (session?.user as any)?.publicReferralToken || ctvToken;

  const price = listing.transactionType === "RENT" ? listing.rentPrice : listing.salePrice;
  const zaloUrl = CONTACT_CONFIG.zaloOAUrl;

  async function handleConsultSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg("Vui lòng nhập họ và tên.");
      return;
    }
    const phoneError = validatePhone(phone);
    if (phoneError) {
      setErrorMsg(phoneError);
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const refToken = typeof window !== "undefined" ? sessionStorage.getItem("md_public_ref_token") : null;

      const res = await fetch("/api/contact-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          phone,
          demandType,
          note,
          listingId: listing.id,
          projectId: listing.projectId || null,
          refToken,
          pageUrl: typeof window !== "undefined" ? window.location.href : null,
        }),
      });
      setLoading(false);
      if (res.ok) {
        setSent(true);
        setConsultModalOpen(false);
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Gửi yêu cầu tư vấn thất bại.");
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg("Có lỗi xảy ra, vui lòng thử lại.");
    }
  }

  const specsList = [
    { label: "Mã sản phẩm", value: listing.productCode || listing.unitCode },
    ...(isBackoffice ? [{ label: "Mã căn (Nội bộ)", value: listing.unitCode }] : []),
    { label: "Diện tích", value: `${listing.area} m²` },
    { label: "Phòng ngủ", value: listing.bedrooms ? `${listing.bedrooms} PN` : null },
    { label: "Nhà vệ sinh", value: listing.bathrooms ? `${listing.bathrooms} WC` : null },
    {
      label: "Hướng ban công",
      value: listing.doorDirection
        ? LABELS.direction[listing.doorDirection as keyof typeof LABELS.direction]
        : null,
    },
    {
      label: "Hướng ban công",
      value: listing.balconyDirection
        ? LABELS.direction[listing.balconyDirection as keyof typeof LABELS.direction]
        : null,
    },
    {
      label: "Nội thất",
      value: listing.furnitureStatus
        ? LABELS.furnitureStatus[listing.furnitureStatus as keyof typeof LABELS.furnitureStatus]
        : null,
    },
    {
      label: "Pháp lý",
      value: listing.legalStatus
        ? LABELS.legalStatus[listing.legalStatus as keyof typeof LABELS.legalStatus]
        : null,
    },
    ...(isBackoffice
      ? [
          { label: "Tòa (Nội bộ)", value: listing.block ? `Tòa ${listing.block}` : null },
          { label: "Tầng (Nội bộ)", value: listing.floor ? `Tầng ${listing.floor}` : null },
        ]
      : []),
    { label: "View", value: listing.view },
  ].filter((s) => s.value !== null && s.value !== undefined);

  return (
    <div className="container-page py-6 space-y-6 pb-24 lg:pb-12">
      {/* ADMIN CONTROL BAR (ONLY FOR BACKOFFICE ROLES) */}
      {isBackoffice && (
        <div className="bg-slate-900 text-white rounded-xl p-3 flex items-center justify-between text-[13px]">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="font-semibold text-amber-300">Quản trị nội bộ:</span>
            <span>Mã căn: <strong className="text-white">{listing.unitCode}</strong></span>
            <span>·</span>
            <span>Trạng thái:</span>
            <span className="font-bold text-white">
              {LABELS.unitStatus[listing.unitStatus as keyof typeof LABELS.unitStatus] || listing.unitStatus}
            </span>
          </div>

          <Link
            href={`/dashboard/listings/${listing.id}/edit`}
            className="rounded-lg bg-amber-400 text-slate-950 font-bold px-3 py-1 text-[12px] hover:bg-amber-300 transition"
          >
            Sửa tin đăng
          </Link>
        </div>
      )}

      {/* BREADCRUMB */}
      <div className="flex items-center gap-2 text-[13px] text-slate-500 overflow-x-auto">
        <Link href="/" className="hover:text-slate-900">
          Trang chủ
        </Link>
        <span>/</span>
        <Link
          href={`/listings?transactionType=${listing.transactionType}`}
          className="hover:text-slate-900"
        >
          {listing.transactionType === "RENT" ? "Cho thuê" : "Mua bán"}
        </Link>
        {listing.project && (
          <>
            <span>/</span>
            <Link
              href={`/projects/${listing.project.slug}`}
              className="hover:text-slate-900"
            >
              {listing.project.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-slate-900 font-semibold truncate">Mã SP: {listing.productCode || listing.unitCode}</span>
      </div>

      {/* MAIN CONTENT LAYOUT: LEFT DETAILS + RIGHT CONTACT SIDEBAR */}
      <div className="grid gap-8 lg:grid-cols-[1fr_340px] items-start">
        <main className="space-y-6 min-w-0">
          {/* 1. GALLERY IMAGE */}
          <ListingGallery
            images={images}
            title={listing.title}
            badges={
              <>
                <span className="rounded-md bg-slate-900/80 backdrop-blur px-2.5 py-1 text-[11px] font-bold text-white">
                  {LABELS.transactionType[listing.transactionType as "SALE" | "RENT"]}
                </span>
                {listing.verified && (
                  <span className="rounded-md bg-emerald-700 px-2.5 py-1 text-[11px] font-bold text-white">
                    Đã xác minh
                  </span>
                )}
              </>
            }
          />

          {/* 2. TITLE & PRICE HEADER */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div className="text-[26px] sm:text-[30px] font-bold text-[#0284C7] tracking-tight">
                {formatVND(price)}
                {listing.transactionType === "RENT" ? (
                  <span className="text-[14px] font-normal text-slate-500"> /tháng</span>
                ) : null}
              </div>

              {isBackoffice ? (
                <div className="flex flex-wrap items-center gap-2 text-[12px] font-mono">
                  <span className="bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded font-bold">
                    Mã SP: {listing.productCode || "—"}
                  </span>
                  <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-bold">
                    Mã căn: {listing.unitCode}
                  </span>
                </div>
              ) : (
                <div className="text-[12px] font-mono font-bold text-blue-800 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded">
                  Mã SP: {listing.productCode || listing.unitCode}
                </div>
              )}
            </div>

            <h1 className="text-[18px] sm:text-[22px] font-bold text-slate-900 leading-snug">
              {listing.title}
            </h1>

            <p className="text-[13px] text-slate-600 font-medium">
              {[listing.address, listing.district?.name, listing.province?.name]
                .filter(Boolean)
                .join(", ")}
            </p>

            {/* MOBILE ONLY CTV/STAFF SHARE BUTTON */}
            {effectiveCtvToken && (
              <div className="lg:hidden pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    const shareUrl = `${window.location.origin}/listings/${listing.slug}?ref=${effectiveCtvToken}`;
                    navigator.clipboard.writeText(shareUrl);
                    alert(`✓ Đã sao chép Link giới thiệu CTV (Mã: ${effectiveCtvToken})!\nHãy dán gửi cho khách hàng: ${shareUrl}`);
                  }}
                  className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-emerald-600 text-white font-bold text-[13px] hover:bg-emerald-700 transition shadow-xs cursor-pointer"
                >
                  <span>🔗</span>
                  <span>Sao chép Link giới thiệu CTV</span>
                </button>
              </div>
            )}

            {!effectiveCtvToken && (session?.user as any)?.referralCode && (
              <div className="lg:hidden pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    const code = (session?.user as any)?.referralCode;
                    const shareUrl = `${window.location.origin}/listings/${listing.slug}?ref=${code}`;
                    navigator.clipboard.writeText(shareUrl);
                    alert(`✓ Đã sao chép Link giới thiệu Nhân viên (Mã: ${code})!\nHãy dán để chia sẻ: ${shareUrl}`);
                  }}
                  className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-slate-800 text-white font-bold text-[13px] hover:bg-slate-700 transition shadow-xs cursor-pointer"
                >
                  <span>🔗</span>
                  <span>Sao chép Link Nhân viên ({ (session?.user as any)?.referralCode })</span>
                </button>
              </div>
            )}
          </div>

          {/* 3. PROJECT CARD LINK (IF ATTACHED) */}
          {listing.project && (
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="text-[12px] text-slate-500 font-medium">Dự án</div>
                <div className="text-[15px] font-bold text-slate-900">
                  {listing.project.name}
                </div>
              </div>

              <Link
                href={`/projects/${listing.project.slug}`}
                className="text-[13px] font-bold text-[#0284C7] hover:underline shrink-0"
              >
                Xem dự án →
              </Link>
            </div>
          )}

          {/* 4. QUICK SPECS */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
            <h2 className="text-[15px] font-bold text-slate-900 border-b border-slate-100 pb-2">
              Đặc điểm sản phẩm
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3">
              {specsList.map((spec, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="text-[12px] text-slate-500">{spec.label}</div>
                  <div className="text-[14px] font-semibold text-slate-900">
                    {spec.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5. DESCRIPTION */}
          {listing.description && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
              <h2 className="text-[15px] font-bold text-slate-900 border-b border-slate-100 pb-2">
                Thông tin chi tiết
              </h2>

              <div className="text-[14px] leading-relaxed text-slate-700 whitespace-pre-line">
                {listing.description}
              </div>
            </div>
          )}

          {/* 6. SIMILAR LISTINGS */}
          {relatedListings.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-[16px] font-bold text-slate-900">
                  Sản phẩm tương tự
                </h2>
                {listing.project && (
                  <Link
                    href={`/listings?project=${listing.project.slug}`}
                    className="text-[13px] font-bold text-[#0284C7] hover:underline"
                  >
                    Xem thêm →
                  </Link>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {relatedListings.map((rel) => (
                  <ListingCard key={rel.id} listing={rel} />
                ))}
              </div>
            </div>
          )}
        </main>

        {/* DESKTOP CONTACT SIDEBAR (STICKY) */}
        <aside className="hidden lg:block sticky top-24 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm">
            <div className="space-y-1 border-b border-slate-100 pb-3">
              <h3 className="text-[16px] font-bold text-slate-900 leading-snug">
                Bạn quan tâm bất động sản này?
              </h3>
              <p className="text-[12px] text-slate-500">
                Để lại thông tin, Minh Dũng Land sẽ liên hệ tư vấn trực tiếp.
              </p>
            </div>

            {/* CONSULT FORM (PUBLIC - NO LOGIN FORCED) */}
            {sent ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-[13px] font-semibold text-emerald-800 text-center space-y-2">
                <div>✓ Đã gửi yêu cầu tư vấn thành công!</div>
                <div className="text-[12px] font-normal text-emerald-700">
                  Đội ngũ Minh Dũng Land sẽ liên hệ lại với bạn trong thời gian sớm nhất.
                </div>
              </div>
            ) : (
              <form onSubmit={handleConsultSubmit} className="space-y-3">
                {errorMsg && (
                  <div className="text-[12px] text-rose-600 font-medium bg-rose-50 p-2 rounded-lg border border-rose-200">
                    {errorMsg}
                  </div>
                )}

                <div>
                  <label className="block text-[12px] font-bold text-slate-700 mb-1">
                    Họ và tên <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nguyễn Văn A"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-[13px] text-slate-900 bg-slate-50 focus:bg-white focus:border-[#0284C7] focus:outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-slate-700 mb-1">
                    Số điện thoại <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    required
                    placeholder="VD: 0912345678"
                    value={phone}
                    onChange={(e) => setPhone(sanitizePhoneInput(e.target.value))}
                    className={`w-full rounded-xl border px-3 py-2 text-[13px] text-slate-900 bg-slate-50 focus:bg-white focus:outline-none transition ${
                      phone && validatePhone(phone)
                        ? "border-rose-400 focus:border-rose-500 bg-rose-50/20"
                        : "border-slate-200 focus:border-[#0284C7]"
                    }`}
                  />
                  {phone && validatePhone(phone) && (
                    <p className="mt-1 text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                      <span>⚠️</span>
                      <span>{validatePhone(phone)}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-slate-700 mb-1">
                    Nhu cầu <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={demandType}
                    onChange={(e) => setDemandType(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-[13px] font-medium text-slate-900 bg-slate-50 focus:bg-white focus:border-[#0284C7] focus:outline-none transition"
                  >
                    <option value="MUA">Mua bất động sản</option>
                    <option value="THUE">Thuê bất động sản</option>
                    <option value="TU_VAN">Cần tư vấn thông tin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-slate-700 mb-1">Ghi chú</label>
                  <textarea
                    rows={2}
                    placeholder="Ghi chú thêm (vd: cần xem nhà chiều nay)..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-[13px] text-slate-900 bg-slate-50 focus:bg-white focus:border-[#0284C7] focus:outline-none transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 text-white font-bold text-[13px] hover:bg-slate-800 transition shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {loading ? "Đang gửi..." : "Gửi yêu cầu tư vấn"}
                </button>
              </form>
            )}

            {/* ACTION BUTTON ZALO OA & CTV SHARE LINK */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <a
                href={zaloUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-[#0284C7] text-white font-bold text-[13px] hover:bg-blue-700 transition shadow-xs"
              >
                <span>💬</span>
                <span>Nhắn Zalo OA tư vấn</span>
              </a>

              {/* BUTTON NẾU DÀNH CHO CTV ĐÃ ĐĂNG NHẬP */}
              {effectiveCtvToken && (
                <button
                  type="button"
                  onClick={() => {
                    const shareUrl = `${window.location.origin}/listings/${listing.slug}?ref=${effectiveCtvToken}`;
                    navigator.clipboard.writeText(shareUrl);
                    alert(`✓ Đã sao chép Link giới thiệu CTV (Mã: ${effectiveCtvToken})!\nHãy dán gửi cho khách hàng: ${shareUrl}`);
                  }}
                  className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-emerald-600 text-white font-bold text-[13px] hover:bg-emerald-700 transition shadow-xs cursor-pointer"
                >
                  <span>🔗</span>
                  <span>Sao chép Link giới thiệu CTV</span>
                </button>
              )}

              {/* BUTTON NẾU DÀNH CHO NHÂN VIÊN NỘI BỘ ĐÃ ĐĂNG NHẬP (ADMIN, MANAGER, STAFF) */}
              {!effectiveCtvToken && (session?.user as any)?.referralCode && (
                <button
                  type="button"
                  onClick={() => {
                    const code = (session?.user as any)?.referralCode;
                    const shareUrl = `${window.location.origin}/listings/${listing.slug}?ref=${code}`;
                    navigator.clipboard.writeText(shareUrl);
                    alert(`✓ Đã sao chép Link giới thiệu Nhân viên (Mã: ${code})!\nHãy dán để chia sẻ: ${shareUrl}`);
                  }}
                  className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-slate-800 text-white font-bold text-[13px] hover:bg-slate-700 transition shadow-xs cursor-pointer"
                >
                  <span>🔗</span>
                  <span>Sao chép Link Nhân viên ({ (session?.user as any)?.referralCode })</span>
                </button>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* MOBILE STICKY BOTTOM ACTION BAR (< 1024PX) */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200 p-3 shadow-lg flex items-center gap-2">
        {/* REFERRAL SHARE BUTTON FOR CTV */}
        {effectiveCtvToken && (
          <button
            type="button"
            onClick={() => {
              const shareUrl = `${window.location.origin}/listings/${listing.slug}?ref=${effectiveCtvToken}`;
              navigator.clipboard.writeText(shareUrl);
              alert(`✓ Đã sao chép Link giới thiệu CTV (Mã: ${effectiveCtvToken})!\nHãy dán gửi cho khách hàng: ${shareUrl}`);
            }}
            className="py-2.5 px-3 rounded-xl bg-emerald-600 text-white font-bold text-[12px] sm:text-[13px] hover:bg-emerald-700 transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
            title="Sao chép Link giới thiệu CTV"
          >
            <span>🔗</span>
            <span>Sao chép link</span>
          </button>
        )}

        {/* REFERRAL SHARE BUTTON FOR INTERNAL STAFF */}
        {!effectiveCtvToken && (session?.user as any)?.referralCode && (
          <button
            type="button"
            onClick={() => {
              const code = (session?.user as any)?.referralCode;
              const shareUrl = `${window.location.origin}/listings/${listing.slug}?ref=${code}`;
              navigator.clipboard.writeText(shareUrl);
              alert(`✓ Đã sao chép Link giới thiệu Nhân viên (Mã: ${code})!\nHãy dán để chia sẻ: ${shareUrl}`);
            }}
            className="py-2.5 px-3 rounded-xl bg-slate-800 text-white font-bold text-[12px] sm:text-[13px] hover:bg-slate-700 transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
            title="Sao chép Link Nhân viên"
          >
            <span>🔗</span>
            <span>Sao chép link</span>
          </button>
        )}

        <a
          href={zaloUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-2.5 px-2 rounded-xl bg-[#0284C7] text-white font-bold text-[12px] sm:text-[13px] text-center shadow-xs flex items-center justify-center gap-1 truncate"
        >
          <span>💬</span>
          <span className="truncate">Nhắn Zalo OA</span>
        </a>

        <button
          onClick={() => setConsultModalOpen(true)}
          className="flex-1 py-2.5 px-2 rounded-xl bg-slate-900 text-white font-bold text-[12px] sm:text-[13px] text-center shadow-xs flex items-center justify-center gap-1 truncate"
        >
          <span>📝</span>
          <span className="truncate">Nhận tư vấn</span>
        </button>
      </div>

      {/* MOBILE CONSULTATION MODAL (PUBLIC - NO LOGIN REQUIRED) */}
      {consultModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl p-5 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-[15px] font-bold text-slate-900">
                Yêu cầu tư vấn - Mã SP: {listing.productCode || listing.unitCode}
              </h3>
              <button
                onClick={() => setConsultModalOpen(false)}
                className="text-slate-400 hover:text-slate-900 font-bold p-1"
              >
                ✕
              </button>
            </div>

            {sent ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-[13px] font-semibold text-emerald-800 text-center">
                Đã gửi yêu cầu tư vấn thành công! Minh Dũng Land sẽ liên hệ lại ngay.
              </div>
            ) : (
              <form onSubmit={handleConsultSubmit} className="space-y-3">
                {errorMsg && (
                  <div className="text-[12px] text-rose-600 font-medium bg-rose-50 p-2 rounded-lg border border-rose-200">
                    {errorMsg}
                  </div>
                )}

                <div>
                  <label className="block text-[12px] font-bold text-slate-700 mb-1">
                    Họ và tên <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nguyễn Văn A"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-[13px] text-slate-900 bg-slate-50 focus:bg-white focus:border-[#0284C7] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-slate-700 mb-1">
                    Số điện thoại <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    required
                    placeholder="VD: 0912345678"
                    value={phone}
                    onChange={(e) => setPhone(sanitizePhoneInput(e.target.value))}
                    className={`w-full rounded-xl border p-2.5 text-[13px] text-slate-900 bg-slate-50 focus:bg-white focus:outline-none transition ${
                      phone && validatePhone(phone)
                        ? "border-rose-400 focus:border-rose-500 bg-rose-50/20"
                        : "border-slate-200 focus:border-[#0284C7]"
                    }`}
                  />
                  {phone && validatePhone(phone) && (
                    <p className="mt-1 text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                      <span>⚠️</span>
                      <span>{validatePhone(phone)}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-slate-700 mb-1">Nhu cầu</label>
                  <select
                    value={demandType}
                    onChange={(e) => setDemandType(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-[13px] text-slate-900 bg-slate-50 focus:bg-white focus:border-[#0284C7] focus:outline-none"
                  >
                    <option value="MUA">Mua bất động sản</option>
                    <option value="THUE">Thuê bất động sản</option>
                    <option value="TU_VAN">Cần tư vấn thông tin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-slate-700 mb-1">Ghi chú</label>
                  <textarea
                    rows={2}
                    placeholder="Ghi chú thêm..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-[13px] text-slate-900 bg-slate-50 focus:bg-white focus:border-[#0284C7] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 text-white font-bold text-[13px] hover:bg-slate-800 transition"
                >
                  {loading ? "Đang gửi..." : "Gửi yêu cầu tư vấn"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
