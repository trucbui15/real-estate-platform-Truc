"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

import { CONTACT_CONFIG } from "@/config/contact";

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
          .catch(() => {});
      }
    }
  }, [session]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (!form.fullName.trim()) {
      setMessage({ type: "error", text: "Vui lòng nhập họ và tên" });
      return;
    }
    if (!form.phone.trim()) {
      setMessage({ type: "error", text: "Vui lòng nhập số điện thoại" });
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
        <div className="grid gap-12 lg:grid-cols-12 items-start">
          {/* CỘT 1: THÔNG TIN THƯƠNG HIỆU & DOANH NGHIỆP (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div>
              <Link href="/" className="inline-flex items-center gap-3 group">
                <img
                  src="/logo.png"
                  alt="Minh Dũng Land Logo"
                  className="h-12 w-auto object-contain drop-shadow-sm group-hover:scale-105 transition-transform"
                />
                <div>
                  <div className="font-display text-xl font-extrabold tracking-tight text-slate-900">
                    MINH DŨNG LAND
                  </div>
                  <div className="text-[11px] font-bold text-amber-600 tracking-wider uppercase">
                    Bất Động Sản Quy Nhơn
                  </div>
                </div>
              </Link>
              <div className="mt-3 text-xs font-semibold text-slate-500">
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
            </ul>
          </div>

          {/* CỘT 2: DỊCH VỤ CHÍNH (4 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-900 border-b border-slate-200 pb-3">
              Dịch vụ nổi bật
            </h3>
            <ul className="space-y-3 text-xs text-slate-600">
              <li>
                <Link
                  href="/listings?transactionType=SALE"
                  className="group flex items-center gap-2 hover:text-blue-600 font-medium transition"
                >
                  <span className="text-blue-500 group-hover:translate-x-1 transition-transform">➔</span>
                  <span>Mua bán căn hộ Quy Nhơn</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/ky-gui"
                  className="group flex items-center gap-2 hover:text-blue-600 font-medium transition"
                >
                  <span className="text-blue-500 group-hover:translate-x-1 transition-transform">➔</span>
                  <span>Ký gửi bất động sản chính chủ</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/listings?transactionType=RENT"
                  className="group flex items-center gap-2 hover:text-blue-600 font-medium transition"
                >
                  <span className="text-blue-500 group-hover:translate-x-1 transition-transform">➔</span>
                  <span>Cho thuê căn hộ du lịch & dài hạn</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/projects"
                  className="group flex items-center gap-2 hover:text-blue-600 font-medium transition"
                >
                  <span className="text-blue-500 group-hover:translate-x-1 transition-transform">➔</span>
                  <span>Dự án Simona Heights, Altara, TMS...</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/listings"
                  className="group flex items-center gap-2 hover:text-blue-600 font-medium transition"
                >
                  <span className="text-blue-500 group-hover:translate-x-1 transition-transform">➔</span>
                  <span>Tra cứu giỏ hàng theo ngân sách</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* CỘT 3: THẺ FORM TƯ VẤN SANG TRỌNG (5 cols) */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-slate-200/90 shadow-xl shadow-slate-200/60 rounded-2xl p-6 relative">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Nhận tư vấn & Báo giá trực tiếp
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Để lại thông tin, chuyên viên sẽ liên hệ trong 5 phút.
                  </p>
                </div>
                <span className="px-2.5 py-1 text-[10px] font-extrabold tracking-wide uppercase bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
                  Miễn phí
                </span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                {message && (
                  <div
                    className={`rounded-xl p-3 text-xs font-medium ${
                      message.type === "success"
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
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="footer-phone" className="sr-only">
                      Số điện thoại
                    </label>
                    <input
                      id="footer-phone"
                      type="tel"
                      placeholder="Số điện thoại *"
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
                    />
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
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-1 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl py-3 text-xs shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 active:scale-[0.99] transition-all"
                >
                  {loading ? "Đang gửi thông tin..." : "Nhận Tư Vấn Ngay ➔"}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* PHẦN DƯỚI FOOTER: DIVIDER + LINKS + COPYRIGHT */}
        <div className="mt-14 border-t border-slate-200/80 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex flex-wrap items-center gap-4 font-semibold text-slate-600">
            <Link href="/gioi-thieu" className="hover:text-blue-600 transition">
              Giới thiệu
            </Link>
            <span className="text-slate-300">·</span>
            <Link href="/lien-he" className="hover:text-blue-600 transition">
              Liên hệ
            </Link>
            <span className="text-slate-300">·</span>
            <Link href="/dieu-khoan" className="hover:text-blue-600 transition">
              Điều khoản sử dụng
            </Link>
            <span className="text-slate-300">·</span>
            <Link href="/chinh-sach" className="hover:text-blue-600 transition">
              Chính sách bảo mật
            </Link>
          </div>

          <div className="font-medium text-slate-500">
            © 2026 Minh Dũng Land. Tất cả quyền được bảo lưu.
          </div>
        </div>
      </div>
    </footer>
  );
}

