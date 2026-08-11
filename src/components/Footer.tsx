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
    <footer className="mt-20 border-t border-gray-100 bg-slate-950 text-slate-300">
      <div className="container-page py-14">
        <div className="grid gap-12 lg:grid-cols-3">
          {/* CỘT 1: THÔNG TIN THƯƠNG HIỆU & DOANH NGHIỆP */}
          <div className="space-y-5">
            <div>
              <div className="font-display text-2xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
                <img
                  src="/logo.png"
                  alt="Minh Dũng Land Logo"
                  className="h-9 w-9 object-contain rounded-lg shadow-md"
                />
                <span>MINH DŨNG LAND</span>
              </div>
              <div className="mt-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                {CONTACT_CONFIG.companyName}
              </div>
            </div>

            <ul className="space-y-3 text-xs text-slate-400 leading-relaxed">
              <li>
                <strong className="text-slate-200">Mã số thuế:</strong> {CONTACT_CONFIG.taxId}
              </li>
              <li>
                <strong className="text-slate-200">Địa chỉ:</strong> {CONTACT_CONFIG.address}
              </li>
              <li>
                <strong className="text-slate-200">Zalo OA:</strong>{" "}
                <a
                  href={CONTACT_CONFIG.zaloOAUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-blue-400 hover:text-white hover:underline transition"
                >
                  {CONTACT_CONFIG.zaloOAName} ↗
                </a>
              </li>
              <li>
                <strong className="text-slate-200">Website:</strong>{" "}
                <a
                  href={CONTACT_CONFIG.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-300 hover:text-white hover:underline transition"
                >
                  {CONTACT_CONFIG.website}
                </a>
              </li>
            </ul>
          </div>

          {/* CỘT 2: DỊCH VỤ CHÍNH */}
          <div className="space-y-4">
            <div className="text-xs font-extrabold uppercase tracking-widest text-slate-200 border-b border-slate-800 pb-3">
              Dịch vụ chính
            </div>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link href="/listings?transactionType=SALE" className="hover:text-white hover:underline transition">
                  ✓ Mua bán căn hộ Quy Nhơn
                </Link>
              </li>
              <li>
                <Link href="/ky-gui" className="hover:text-white hover:underline transition">
                  ✓ Ký gửi bất động sản
                </Link>
              </li>
              <li>
                <Link href="/listings?transactionType=RENT" className="hover:text-white hover:underline transition">
                  ✓ Cho thuê căn hộ Quy Nhơn
                </Link>
              </li>
              <li>
                <Link href="/projects" className="hover:text-white hover:underline transition">
                  ✓ Tư vấn dự án Altara, The Sailing, Simona Heights, TMS, FLC Sea Tower
                </Link>
              </li>
              <li>
                <Link href="/listings" className="hover:text-white hover:underline transition">
                  ✓ Cập nhật giỏ hàng căn hộ theo ngân sách
                </Link>
              </li>
            </ul>
          </div>

          {/* CỘT 3: NHẬN TƯ VẤN */}
          <div className="space-y-4">
            <div className="text-xs font-extrabold uppercase tracking-widest text-slate-200 border-b border-slate-800 pb-3">
              Nhận tư vấn trực tiếp
            </div>
            <div className="space-y-1.5 text-xs text-slate-400">
              <p>
                Kênh Zalo OA chính thức:{" "}
                <a
                  href={CONTACT_CONFIG.zaloOAUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-xs text-blue-400 hover:text-white hover:underline"
                >
                  {CONTACT_CONFIG.zaloOAName} ↗
                </a>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {message && (
                <div
                  className={`rounded-xl p-3 text-xs font-medium ${
                    message.type === "success"
                      ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800"
                      : "bg-rose-950/80 text-rose-300 border border-rose-800"
                  }`}
                >
                  {message.text}
                </div>
              )}

              <div>
                <label htmlFor="footer-fullName" className="sr-only">Họ và Tên</label>
                <input
                  id="footer-fullName"
                  type="text"
                  placeholder="Họ và Tên *"
                  required
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none transition"
                />
              </div>

              <div>
                <label htmlFor="footer-email" className="sr-only">Email</label>
                <input
                  id="footer-email"
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none transition"
                />
              </div>

              <div>
                <label htmlFor="footer-phone" className="sr-only">Số điện thoại</label>
                <input
                  id="footer-phone"
                  type="tel"
                  placeholder="Số điện thoại *"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary !rounded-xl !py-3 text-xs shadow-lg shadow-primary-600/30"
              >
                {loading ? "Đang gửi thông tin..." : "Nhận Tư Vấn Ngay ➔"}
              </button>
            </form>
          </div>
        </div>

        {/* PHẦN DƯỚI FOOTER: DIVIDER + LINKS + COPYRIGHT */}
        <div className="mt-14 border-t border-slate-900 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex flex-wrap gap-4 font-semibold">
            <Link href="/gioi-thieu" className="hover:text-slate-200 transition">
              Giới thiệu
            </Link>
            <span>·</span>
            <Link href="/lien-he" className="hover:text-slate-200 transition">
              Liên hệ
            </Link>
            <span>·</span>
            <Link href="/dieu-khoan" className="hover:text-slate-200 transition">
              Điều khoản sử dụng
            </Link>
            <span>·</span>
            <Link href="/chinh-sach" className="hover:text-slate-200 transition">
              Chính sách bảo mật
            </Link>
          </div>

          <div className="font-medium">
            © 2026 Minh Dũng Land. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}

