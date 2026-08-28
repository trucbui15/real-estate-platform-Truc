"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { validatePhone, sanitizePhoneInput } from "@/lib/utils";

export default function VisaFormClient() {
  const { data: session } = useSession();
  const [fullName, setFullName] = useState(session?.user?.name || "");
  const [phone, setPhone] = useState((session?.user as any)?.phone || "");
  const [visaType, setVisaType] = useState("VISA_DU_LICH");
  const [targetCountry, setTargetCountry] = useState("Mỹ / Hàn Quốc / Nhật / Châu Âu");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          phone,
          demandType: "TU_VAN",
          note: `[DỊCH VỤ VISA] Loại dịch vụ: ${visaType} | Quốc gia / Nhu cầu: ${targetCountry} | Ghi chú: ${note}`,
          pageUrl: typeof window !== "undefined" ? window.location.href : null,
        }),
      });

      setLoading(false);
      if (res.ok) {
        setSent(true);
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Gửi yêu cầu tư vấn Visa thất bại.");
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg("Có lỗi xảy ra, vui lòng thử lại.");
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xl">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <span>🛂</span>
          <span>Đăng ký Tư vấn Visa</span>
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Chuyên viên tư vấn Visa sẽ thẩm định hồ sơ & liên hệ tư vấn miễn phí cho bạn.
        </p>
      </div>

      {sent ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center space-y-2">
          <div className="text-2xl">🎉</div>
          <div className="font-bold text-emerald-800 text-sm">Gửi yêu cầu tư vấn Visa thành công!</div>
          <div className="text-xs text-emerald-600">
            Chuyên viên Visa sẽ liên hệ lại qua số {phone} trong ít phút.
          </div>
          <button
            onClick={() => setSent(false)}
            className="text-xs font-bold text-emerald-700 underline pt-2 cursor-pointer"
          >
            Gửi yêu cầu tư vấn khác
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          {errorMsg && (
            <div className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200 font-medium">
              ⚠️ {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Họ và tên <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Nguyễn Văn A"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none bg-slate-50 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Số điện thoại / Zalo <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              required
              placeholder="VD: 0912345678"
              value={phone}
              onChange={(e) => setPhone(sanitizePhoneInput(e.target.value))}
              className={`w-full rounded-xl border p-2.5 text-xs text-slate-900 focus:outline-none transition ${
                phone && validatePhone(phone)
                  ? "border-rose-400 focus:border-rose-500 bg-rose-50/20"
                  : "border-slate-200 focus:border-blue-600 bg-slate-50 focus:bg-white"
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
            <label className="block text-xs font-bold text-slate-700 mb-1">Hạng mục Visa nhu cầu</label>
            <select
              value={visaType}
              onChange={(e) => setVisaType(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none bg-slate-50 focus:bg-white"
            >
              <option value="VISA_DU_LICH">Visa Du Lịch Quốc Tế</option>
              <option value="VISA_CONG_TAC">Visa Công Tác / Thương Mại</option>
              <option value="GIA_HAN_VISA_VN">Gia Hạn Visa Cho Người Nước Ngoài Tại VN</option>
              <option value="THE_TAM_TRU">Thẻ Tạm Trú / Giấy Phép Lao Động</option>
              <option value="KHAC">Tư vấn thủ tục khác</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Quốc gia / Chi tiết nhu cầu</label>
            <input
              type="text"
              placeholder="VD: Mỹ, Hàn Quốc, Nhật Bản, Úc..."
              value={targetCountry}
              onChange={(e) => setTargetCountry(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none bg-slate-50 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Ghi chú thêm</label>
            <textarea
              rows={2}
              placeholder="Tình trạng hồ sơ, thời gian cần lấy Visa..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none bg-slate-50 focus:bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition shadow-md cursor-pointer"
          >
            {loading ? "Đang gửi..." : "Đăng ký Tư vấn Visa →"}
          </button>
        </form>
      )}
    </div>
  );
}
