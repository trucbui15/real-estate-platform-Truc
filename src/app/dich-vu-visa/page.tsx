import VisaFormClient from "./VisaFormClient";

export const metadata = {
  title: "Dịch Vụ Visa Du Lịch, Công Tác & Gia Hạn Visa - Minh Dũng Land",
  description: "Dịch vụ tư vấn thủ tục Visa du lịch, công tác các nước và gia hạn Visa cho người nước ngoài tại Việt Nam nhanh chóng, trọn gói.",
};

export default function DichVuVisaPage() {
  return (
    <div className="container-page py-10 space-y-10">
      {/* HERO SECTION */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
        <div className="max-w-2xl space-y-4 relative z-10">
          <span className="inline-block rounded-full bg-blue-400/20 border border-blue-400/30 px-3.5 py-1 text-xs font-bold text-blue-300 backdrop-blur">
            🛂 Dịch Vụ Visa Chuyên Nghiệp
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Dịch Vụ Visa Du Lịch, Công Tác & Gia Hạn Visa Trọn Gói
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Hỗ trợ tư vấn thủ tục xin Visa du lịch/công tác các nước (Mỹ, Châu Âu, Nhật Bản, Hàn Quốc, Úc...) và gia hạn Visa người nước ngoài tại Việt Nam nhanh chóng, tỷ lệ đậu cao.
          </p>
          <div className="flex flex-wrap gap-4 text-xs font-bold pt-2">
            <span className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">⚡ Xử lý hồ sơ thần tốc</span>
            <span className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">🛡️ Tỷ lệ thành công 99%</span>
            <span className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">🤝 Tư vấn 1-1 miễn phí</span>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid gap-8 lg:grid-cols-[1fr_400px] items-start">
        {/* LEFT: VISA SERVICES */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Các hạng mục Dịch vụ Visa</h2>

          <div className="grid gap-6 sm:grid-cols-2">
            {/* ITEM 1 */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs hover:border-blue-600 transition">
              <div className="text-2xl">🌍</div>
              <h3 className="font-bold text-slate-900 text-base">Visa Du Lịch Các Nước</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Xin Visa du lịch Châu Âu (Schengen), Mỹ, Úc, Hàn Quốc, Nhật Bản, Đài Loan... Thủ tục đơn giản, hỗ trợ chứng minh tài chính.
              </p>
            </div>

            {/* ITEM 2 */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs hover:border-blue-600 transition">
              <div className="text-2xl">💼</div>
              <h3 className="font-bold text-slate-900 text-base">Visa Công Tác & Thư Mời</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Hỗ trợ doanh nghiệp xin Visa công tác ngắn/dài hạn, hợp pháp hóa thư mời đối tác quốc tế chuyên nghiệp.
              </p>
            </div>

            {/* ITEM 3 */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs hover:border-blue-600 transition">
              <div className="text-2xl">🪪</div>
              <h3 className="font-bold text-slate-900 text-base">Gia Hạn Visa Cho Người Nước Ngoài</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Gia hạn Visa Việt Nam cho du khách, chuyên gia, nhà đầu tư nước ngoài cư trú tại Bình Định / Việt Nam nhanh gọn.
              </p>
            </div>

            {/* ITEM 4 */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs hover:border-blue-600 transition">
              <div className="text-2xl">📄</div>
              <h3 className="font-bold text-slate-900 text-base">Thẻ Tạm Trú & Giấy Phép Lao Động</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tư vấn trọn gói giấy phép lao động (Work Permit) và Thẻ tạm trú (TRC) 2-5 năm cho người nước ngoài.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT: VISA REQUEST FORM CLIENT */}
        <div className="sticky top-24">
          <VisaFormClient />
        </div>
      </div>
    </div>
  );
}
