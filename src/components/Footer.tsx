"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

import { CONTACT_CONFIG } from "@/config/contact";
import { validatePhone, sanitizePhoneInput } from "@/lib/utils";

export default function Footer() {
  const { data: session } = useSession();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (session?.user) {
      setForm((f) => ({
        ...f,
        fullName: f.fullName || session.user.name || "",
        phone: f.phone || (session.user as any).phone || "",
        email: f.email || session.user.email || "",
      }));

      if (!(session.user as any).phone) {
        fetch("/api/me")
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data?.phone) {
              setForm((f) => ({ ...f, phone: f.phone || data.phone }));
            }
          })
          .catch(() => { });
      }
    }
  }, [session]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (!form.fullName.trim()) {
      setMessage({ type: "error", text: "Vui lòng nhập họ và tên." });
      return;
    }
    const phoneError = validatePhone(form.phone);
    if (phoneError) {
      setMessage({ type: "error", text: phoneError });
      return;
    }

    setLoading(true);

    try {
      const refToken = typeof window !== "undefined" ? sessionStorage.getItem("md_public_ref_token") : null;
      const res = await fetch("/api/tu-van", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          source: "FOOTER",
          refToken,
          pageUrl: typeof window !== "undefined" ? window.location.href : null,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Gửi tư vấn thất bại" });
        return;
      }

      setMessage({ type: "success", text: data.message || "Đã gửi thông tin tư vấn thành công!" });
      setForm({ fullName: "", email: "", phone: "" });
    } catch (err) {
      setLoading(false);
      setMessage({ type: "error", text: "Có lỗi xảy ra khi gửi thông tin." });
    }
  }

  return (
    <footer className="mt-24 border-t border-slate-200/80 bg-gradient-to-b from-slate-50 via-slate-100/60 to-slate-100 text-slate-700 relative overflow-hidden">
      {/* Decorative top accent line */}
      <div className="h-1 w-full bg-gradient-to-r from-amber-400 via-blue-600 to-amber-500" />

      <div className="container-page py-16">
        <div className="grid gap-10 lg:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 items-start">
          {/* CỘT 1: THÔNG TIN THƯƠNG HIỆU & DOANH NGHIỆP (4 cols) */}
          <div className="sm:col-span-2 lg:col-span-4 space-y-6">
            <div>
              <Link href="/" className="inline-flex items-center gap-3 group notranslate" translate="no">
                <img
                  src="/logo.png"
                  alt="Minh Dũng Land Logo"
                  className="h-12 w-auto object-contain drop-shadow-sm group-hover:scale-105 transition-transform"
                />
                <div>
                  <div className="font-display text-xl font-extrabold tracking-tight text-slate-900 notranslate" translate="no">
                    MINH DŨNG LAND
                  </div>
                  <div className="text-[11px] font-bold text-amber-600 tracking-wider uppercase">
                    Bất Động Sản Quy Nhơn
                  </div>
                </div>
              </Link>
              <div className="mt-3 text-xs font-semibold text-slate-600 notranslate" translate="no">
                {CONTACT_CONFIG.companyName}
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Nền tảng mua bán, cho thuê căn hộ và nhà đất xác thực tại Quy Nhơn. Đồng hành cùng khách hàng và cộng tác viên minh bạch, hiệu quả.
            </p>

            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <span className="font-semibold text-slate-900 shrink-0">📍 Địa chỉ:</span>
                <span>{CONTACT_CONFIG.address}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="font-semibold text-slate-900 shrink-0">📋 Mã số thuế:</span>
                <span>{CONTACT_CONFIG.taxId}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-slate-900 shrink-0">🏛️ Nơi cấp:</span>
                <span>{CONTACT_CONFIG.taxIssuedBy}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="font-semibold text-slate-900 shrink-0">💬 Zalo OA:</span>
                <a
                  href={CONTACT_CONFIG.zaloOAUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-bold text-blue-600 hover:text-blue-700 hover:underline transition"
                >
                  {CONTACT_CONFIG.zaloOAName}
                  <span className="text-[10px]">↗</span>
                </a>
              </li>
              <li className="flex items-center gap-2">
                <span className="font-semibold text-slate-900 shrink-0">🌐 Website:</span>
                <a
                  href={CONTACT_CONFIG.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-700 hover:text-blue-600 hover:underline transition font-medium"
                >
                  {CONTACT_CONFIG.website}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <span className="font-semibold text-slate-900 shrink-0">📞 Số điện thoại:</span>
                <a
                  href={`tel:${CONTACT_CONFIG.phone}`}
                  className="text-slate-700 hover:text-blue-600 hover:underline transition font-medium"
                >
                  {CONTACT_CONFIG.phone}
                </a>
              </li>
            </ul>
          </div>

          {/* CỘT 2: DỊCH VỤ NỔI BẬT (2 cols) */}
          <div className="sm:col-span-1 lg:col-span-2 space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-900 border-b border-slate-200 pb-3">
              Dịch vụ nổi bật
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li>
                <Link
                  href="/listings?transactionType=SALE"
                  className="group flex items-center gap-1.5 hover:text-blue-600 font-medium transition"
                >
                  <span className="text-slate-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all text-[11px]">➔</span>
                  <span>Mua bán căn hộ</span>
                </Link>
              </li>
              <li>
                {/* <Link
                  href="/ky-gui"
                  className="group flex items-center gap-1.5 hover:text-blue-600 font-medium transition"
                >
                  <span className="text-slate-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all text-[11px]">➔</span>
                  <span>Ký gửi bất động sản</span>
                </Link> */}
              </li>
              <li>
                <Link
                  href="/listings?transactionType=RENT"
                  className="group flex items-center gap-1.5 hover:text-blue-600 font-medium transition"
                >
                  <span className="text-slate-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all text-[11px]">➔</span>
                  <span>Cho thuê căn hộ</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/projects"
                  className="group flex items-center gap-1.5 hover:text-blue-600 font-medium transition"
                >
                  <span className="text-slate-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all text-[11px]">➔</span>
                  <span>Dự án BĐS Quy Nhơn</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/listings"
                  className="group flex items-center gap-1.5 hover:text-blue-600 font-medium transition"
                >
                  <span className="text-slate-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all text-[11px]">➔</span>
                  <span>Tra cứu giỏ hàng</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* CỘT 3: CHÍNH SÁCH & PHÁP LÝ (3 cols) */}
          <div className="sm:col-span-1 lg:col-span-3 space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-900 border-b border-slate-200 pb-3">
              Chính sách & Quy định
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li>
                <Link
                  href="/dieu-khoan"
                  className="group flex items-center gap-1.5 hover:text-blue-600 font-medium transition"
                >
                  <span className="text-slate-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all text-[11px]">➔</span>
                  <span>Điều khoản sử dụng</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/chinh-sach"
                  className="group flex items-center gap-1.5 hover:text-blue-600 font-medium transition"
                >
                  <span className="text-slate-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all text-[11px]">➔</span>
                  <span>Chính sách bảo mật thông tin</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/chinh-sach-gia"
                  className="group flex items-center gap-1.5 hover:text-blue-600 font-medium transition"
                >
                  <span className="text-slate-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all text-[11px]">➔</span>
                  <span>Chính sách giá cả & Phí dịch vụ</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/chinh-sach-thanh-toan"
                  className="group flex items-center gap-1.5 hover:text-blue-600 font-medium transition"
                >
                  <span className="text-slate-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all text-[11px]">➔</span>
                  <span>Chính sách thanh toán</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/phuong-thuc-cung-cap-dich-vu"
                  className="group flex items-center gap-1.5 hover:text-blue-600 font-medium transition"
                >
                  <span className="text-slate-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all text-[11px]">➔</span>
                  <span>Phương thức cung cấp dịch vụ</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/dieu-kien-han-che"
                  className="group flex items-center gap-1.5 hover:text-blue-600 font-medium transition"
                >
                  <span className="text-slate-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all text-[11px]">➔</span>
                  <span>Điều kiện hạn chế dịch vụ</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/chinh-sach-mua-hang"
                  className="group flex items-center gap-1.5 hover:text-blue-600 font-medium transition"
                >
                  <span className="text-slate-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all text-[11px]">➔</span>
                  <span>Quy trình mua hàng trực tuyến</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/quyen-va-nghia-vu"
                  className="group flex items-center gap-1.5 hover:text-blue-600 font-medium transition"
                >
                  <span className="text-slate-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all text-[11px]">➔</span>
                  <span>Quyền và nghĩa vụ các bên</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/chinh-sach-giao-nhan"
                  className="group flex items-center gap-1.5 hover:text-blue-600 font-medium transition"
                >
                  <span className="text-slate-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all text-[11px]">➔</span>
                  <span>Chính sách vận chuyển &amp; giao nhận</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/tiep-nhan-khieu-nai"
                  className="group flex items-center gap-1.5 hover:text-blue-600 font-medium transition"
                >
                  <span className="text-slate-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all text-[11px]">➔</span>
                  <span>Tiếp nhận & Giải quyết khiếu nại</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* CỘT 4: THẺ FORM TƯ VẤN SANG TRỌNG (3 cols) */}
          <div className="sm:col-span-2 lg:col-span-3">
            <div className="bg-white border border-slate-200/90 shadow-lg shadow-slate-200/50 rounded-2xl p-5 relative">
              <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-100">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">
                    Nhận tư vấn & Báo giá
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Chuyên viên liên hệ trong 5 phút.
                  </p>
                </div>
                <span className="px-2 py-0.5 text-[9px] font-extrabold tracking-wide uppercase bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
                  Miễn phí
                </span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-2.5">
                {message && (
                  <div
                    className={`rounded-lg p-2 text-[11px] font-medium ${message.type === "success"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-rose-50 text-rose-800 border border-rose-200"
                      }`}
                  >
                    {message.text}
                  </div>
                )}

                <div>
                  <label htmlFor="footer-fullName" className="sr-only">
                    Họ và Tên
                  </label>
                  <input
                    id="footer-fullName"
                    type="text"
                    placeholder="Họ và Tên *"
                    required
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
                  />
                </div>

                <div>
                  <label htmlFor="footer-phone" className="sr-only">
                    Số điện thoại
                  </label>
                  <input
                    id="footer-phone"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="Số điện thoại (VD: 0912345678) *"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: sanitizePhoneInput(e.target.value) })}
                    className={`w-full rounded-lg border bg-slate-50/50 px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none transition ${form.phone && validatePhone(form.phone)
                        ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 bg-rose-50/20"
                        : "border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      }`}
                  />
                  {form.phone && validatePhone(form.phone) && (
                    <p className="mt-1 text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                      <span>⚠️</span>
                      <span>{validatePhone(form.phone)}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="footer-email" className="sr-only">
                    Email
                  </label>
                  <input
                    id="footer-email"
                    type="email"
                    placeholder="Email (không bắt buộc)"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-1 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-lg py-2.5 text-xs shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 active:scale-[0.99] transition-all"
                >
                  {loading ? "Đang gửi..." : "Nhận Tư Vấn Ngay ➔"}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* PHẦN DƯỚI FOOTER: DIVIDER + LINKS + COPYRIGHT */}
        <div className="mt-12 border-t border-slate-200/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-4 font-semibold text-slate-600">
            <Link href="/gioi-thieu" className="hover:text-blue-600 transition">
              Giới thiệu
            </Link>
            <span className="text-slate-300">·</span>
            <Link href="/lien-he" className="hover:text-blue-600 transition">
              Liên hệ
            </Link>
            <span className="text-slate-300">·</span>
            {/* <Link href="/ky-gui" className="hover:text-blue-600 transition">
              Ký gửi BĐS
            </Link> */}
          </div>

          <div className="font-medium text-slate-500">
            © 2026 Minh Dũng Land. Tất cả quyền được bảo lưu.
          </div>
        </div>
      </div>
    </footer>
  );
}

