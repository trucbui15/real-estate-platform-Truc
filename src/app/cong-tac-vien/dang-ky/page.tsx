"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { validatePhone, sanitizePhoneInput } from "@/lib/utils";

export default function CTVRegisterPage() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const ref = urlParams.get("ref");
      if (ref) {
        setReferralCode(ref.trim().toUpperCase());
      }
    }
  }, []);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successData, setSuccessData] = useState<any>(null);

  async function handleSubmit(e: React.FormEvent) {
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
    if (!email.trim() || !password || !referralCode.trim()) {
      setErrorMsg("Vui lòng điền đầy đủ các thông tin bắt buộc (*)");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/collaborators/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, phone, email, password, referralCode }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setErrorMsg(data.error || "Đăng ký thất bại");
        return;
      }

      setSuccessData(data);
    } catch (err) {
      setLoading(false);
      setErrorMsg("Lỗi kết nối máy chủ. Vui lòng thử lại.");
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <span className="inline-block px-3 py-1 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-full">
            Đội ngũ Kinh doanh Bất động sản
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            Đăng ký Cộng tác viên
          </h1>
          <p className="text-sm text-slate-600">
            Trở thành CTV chính thức của Minh Dũng Land để nhận hoa hồng hấp dẫn từ mỗi giao dịch thành công.
          </p>
        </div>

        {successData ? (
          <div className="card p-6 space-y-4 bg-emerald-50/60 border-emerald-200">
            <div className="text-center space-y-2">
              <div className="text-3xl">🎉</div>
              <h2 className="text-lg font-bold text-emerald-900">Đăng ký CTV Thành Công!</h2>
              <p className="text-xs text-emerald-800">{successData.message}</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-emerald-200 space-y-3">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Mã Referral công khai của bạn
              </div>
              <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <code className="text-base font-bold text-blue-600">
                  {successData.collaborator.publicReferralToken}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(successData.collaborator.publicReferralToken);
                    alert("Đã sao chép mã Token CTV!");
                  }}
                  className="text-xs font-bold text-slate-700 hover:text-blue-600 px-2 py-1 bg-white border border-slate-200 rounded shadow-2xs"
                >
                  Sao chép Token
                </button>
              </div>

              <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
                💡 <strong>Hướng dẫn bán hàng:</strong> Sau khi đăng nhập tài khoản CTV, bạn chỉ cần mở xem bất kỳ Tin đăng hay Dự án nào trên website. Hệ thống sẽ tự động nhận diện tài khoản CTV và hiển thị nút <strong>🔗 "Sao chép Link giới thiệu"</strong> để bạn chia sẻ cho khách hàng.
              </div>
            </div>

            <div className="flex justify-center pt-2">
              <Link
                href={`/login?email=${encodeURIComponent(successData.collaborator.email || email)}`}
                className="btn-primary text-sm font-bold px-6 py-2"
              >
                Đăng nhập tài khoản CTV →
              </Link>
            </div>
          </div>
        ) : (
          <div className="card p-6 sm:p-8 space-y-6 shadow-sm border-slate-200">
            {errorMsg && (
              <div className="p-3 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
                ⚠️ {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Họ và tên <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
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
                    className={`input ${phone && validatePhone(phone) ? "!border-rose-500 !ring-rose-200 bg-rose-50/20" : ""}`}
                  />
                  {phone && validatePhone(phone) && (
                    <p className="mt-1.5 text-xs text-rose-600 font-semibold flex items-center gap-1">
                      <span>⚠️</span>
                      <span>{validatePhone(phone)}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="ctv@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mật khẩu <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="Tối thiểu 6 ký tự"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                />
              </div>

              <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 space-y-2">
                <label className="block text-xs font-bold text-blue-900">
                  Mã giới thiệu <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: MD_T01, MD_D04, MD_L02, MD_H03"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  className="input font-mono font-bold tracking-wider text-blue-900 uppercase bg-white"
                />
                <p className="text-[11px] text-blue-700">
                  Nhập mã giới thiệu của Nhân viên/Quản lý đã bảo trợ bạn gia nhập Minh Dũng Land.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 text-sm font-bold shadow-xs cursor-pointer"
              >
                {loading ? "Đang xử lý đăng ký..." : "Đăng ký CTV"}
              </button>
            </form>

            <div className="text-center text-xs text-slate-500 border-t border-slate-100 pt-4">
              Đã có tài khoản CTV?{" "}
              <Link href="/login" className="font-bold text-blue-600 hover:underline">
                Đăng nhập ngay
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
