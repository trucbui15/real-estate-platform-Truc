"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

export default function BookingFormClient() {
  const { data: session } = useSession();
  const [fullName, setFullName] = useState(session?.user?.name || "");
  const [phone, setPhone] = useState((session?.user as any)?.phone || "");
  const [roomType, setRoomType] = useState("CAN_HO_1PN");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      setErrorMsg("Vui lòng điền Họ và tên cùng Số điện thoại liên hệ.");
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
          demandType: "THUE",
          note: `[ĐẶT PHÒNG/BOOK PHÒNG] Loại phòng: ${roomType} | Check-in: ${checkInDate || 'Tự do'} | Check-out: ${checkOutDate || 'Tự do'} | Ghi chú: ${note}`,
          pageUrl: typeof window !== "undefined" ? window.location.href : null,
        }),
      });

      setLoading(false);
      if (res.ok) {
        setSent(true);
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Gửi yêu cầu đặt phòng thất bại.");
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
          <span>📝</span>
          <span>Gửi yêu cầu Đặt phòng</span>
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Chuyên viên Minh Dũng Land sẽ liên hệ báo giá & kiểm tra phòng trống ngay lập tức.
        </p>
      </div>

      {sent ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center space-y-2">
          <div className="text-2xl">🎉</div>
          <div className="font-bold text-emerald-800 text-sm">Gửi yêu cầu Đặt phòng thành công!</div>
          <div className="text-xs text-emerald-600">
            Cảm ơn bạn! Đội ngũ tư vấn sẽ gọi cho bạn qua số {phone} trong ít phút.
          </div>
          <button
            onClick={() => setSent(false)}
            className="text-xs font-bold text-emerald-700 underline pt-2 cursor-pointer"
          >
            Gửi yêu cầu đặt phòng khác
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
              required
              placeholder="0901234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none bg-slate-50 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Loại phòng nhu cầu</label>
            <select
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none bg-slate-50 focus:bg-white"
            >
              <option value="CAN_HO_1PN">Căn hộ Altara Residences (1PN)</option>
              <option value="CAN_HO_2PN">Căn hộ Altara Residences (2PN)</option>
              <option value="SIMONA_HEIGHTS">Căn hộ Simona Heights (1PN-2PN)</option>
              <option value="PHU_TAI_RESIDENCE">Căn hộ Phú Tài Residence (2PN-3PN)</option>
              <option value="HOMESTAY_VILLA">Homestay / Villa View Biển</option>
              <option value="KHAC">Khác (Tư vấn theo ngân sách)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Ngày Check-in</label>
              <input
                type="date"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none bg-slate-50 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Ngày Check-out</label>
              <input
                type="date"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Ghi chú thêm</label>
            <textarea
              rows={2}
              placeholder="Số lượng khách, yêu cầu đặc biệt..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none bg-slate-50 focus:bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-md cursor-pointer"
          >
            {loading ? "Đang gửi yêu cầu..." : "Xác nhận Đặt phòng →"}
          </button>
        </form>
      )}
    </div>
  );
}
