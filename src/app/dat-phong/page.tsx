import Link from "next/link";
import BookingFormClient from "./BookingFormClient";

export const metadata = {
  title: "Đặt phòng / Book phòng Căn hộ, Homestay & Khách sạn Quy Nhơn - Minh Dũng Land",
  description: "Dịch vụ cho thuê ngắn hạn, book phòng căn hộ cao cấp, homestay view biển Altara, Simona, Phú Tài Quy Nhơn giá tốt nhất.",
};

export default function DatPhongPage() {
  return (
    <div className="container-page py-10 space-y-10">
      {/* HERO SECTION */}
      <div 
        className="relative overflow-hidden rounded-3xl p-6 sm:p-12 shadow-2xl text-white bg-cover bg-center bg-no-repeat min-h-[380px] flex items-center border border-slate-200/20"
        style={{ backgroundImage: "url('/quynhon_homestay_hero_bg.jpg')" }}
      >
        <div className="max-w-2xl space-y-4 relative z-10 bg-slate-900/35 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-white/20 shadow-xl">
          <span className="inline-block rounded-full bg-amber-400/20 border border-amber-400/40 px-3.5 py-1 text-xs font-bold text-amber-300 backdrop-blur-sm shadow-xs">
            🏨 Dịch Vụ Đặt Phòng Quy Nhơn
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight drop-shadow-md">
            Book Phòng Căn Hộ, Homestay & Khách Sạn View Biển Quy Nhơn
          </h1>
          <p className="text-sm sm:text-base text-slate-100 leading-relaxed font-medium drop-shadow-sm">
            Hệ thống căn hộ nghỉ dưỡng cao cấp theo ngày/tháng tại Altara Residences, Simona Heights, Phú Tài Residence... Đầy đủ tiện nghi, view biển tuyệt đẹp, hỗ trợ 24/7.
          </p>
          <div className="flex flex-wrap gap-3 text-xs font-bold pt-2">
            <span className="bg-white/20 backdrop-blur-sm px-3.5 py-1.5 rounded-lg border border-white/30 text-white shadow-xs">✨ Căn hộ mới 100%</span>
            <span className="bg-white/20 backdrop-blur-sm px-3.5 py-1.5 rounded-lg border border-white/30 text-white shadow-xs">🌊 View biển trực diện</span>
            <span className="bg-white/20 backdrop-blur-sm px-3.5 py-1.5 rounded-lg border border-white/30 text-white shadow-xs">🔑 Check-in tự động</span>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid gap-8 lg:grid-cols-[1fr_400px] items-start">
        {/* LEFT: ROOM TYPES & FEATURES */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Danh mục phòng & Căn hộ nổi bật</h2>

          <div className="grid gap-6 sm:grid-cols-2">
            {/* ITEM 1 */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs hover:border-blue-600 transition">
              <div className="text-2xl">🏢</div>
              <h3 className="font-bold text-slate-900 text-base">Căn hộ Altara Residences 1PN-2PN</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Nằm tại trung tâm Quy Nhơn, cách biển 150m, có hồ bơi vô cực ngắm trọn vẹn vịnh biển.
              </p>
              <div className="text-xs font-bold text-blue-600">Từ 700.000đ / đêm</div>
            </div>

            {/* ITEM 2 */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs hover:border-blue-600 transition">
              <div className="text-2xl">🏬</div>
              <h3 className="font-bold text-slate-900 text-base">Căn hộ Simona Heights Cao Cấp</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Thiết kế hiện đại, nội thất sang trọng, dịch vụ dọn dẹp hàng ngày theo tiêu chuẩn 5 sao.
              </p>
              <div className="text-xs font-bold text-blue-600">Từ 850.000đ / đêm</div>
            </div>

            {/* ITEM 3 */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs hover:border-blue-600 transition">
              <div className="text-2xl">🏡</div>
              <h3 className="font-bold text-slate-900 text-base">Căn hộ Phú Tài Residence 2PN-3PN</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Thích hợp cho gia đình & nhóm bạn du lịch, view đầm Thị Nại tuyệt đẹp, không gian rộng rãi.
              </p>
              <div className="text-xs font-bold text-blue-600">Từ 900.000đ / đêm</div>
            </div>

            {/* ITEM 4 */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs hover:border-blue-600 transition">
              <div className="text-2xl">🏖️</div>
              <h3 className="font-bold text-slate-900 text-base">Homestay & Villa View Biển</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Không gian riêng tư, sân vườn nướng BBQ, phục vụ du lịch nghỉ dưỡng trọn gói.
              </p>
              <div className="text-xs font-bold text-blue-600">Từ 1.200.000đ / đêm</div>
            </div>
          </div>
        </div>

        {/* RIGHT: BOOKING REQUEST FORM CLIENT */}
        <div className="sticky top-24">
          <BookingFormClient />
        </div>
      </div>
    </div>
  );
}
