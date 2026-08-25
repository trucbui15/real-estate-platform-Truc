import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quy trình tiếp nhận và giải quyết khiếu nại — Minh Dũng Land",
  description: "Phương thức tiếp nhận, thời gian xử lý và quy trình giải quyết phản ánh, khiếu nại của khách hàng tại Công ty TNHH Thương mại Dịch vụ Minh Dũng Land.",
};

export default function TiepNhanKhieuNaiPage() {
  return (
    <div className="container-page py-12">
      <div className="mx-auto max-w-4xl card p-8 sm:p-10 space-y-6 text-slate-700 bg-white shadow-sm border border-slate-200/80 rounded-2xl">
        <div className="border-b border-slate-100 pb-4">
          <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Chăm sóc khách hàng</div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
            Phương Thức Tiếp Nhận Và Giải Quyết Phản Ánh, Khiếu Nại
          </h1>
          <div className="text-xs text-slate-500 mt-1">CÔNG TY TNHH THƯƠNG MẠI DỊCH VỤ MINH DŨNG LAND</div>
        </div>

        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          <strong>Công ty TNHH Thương mại Dịch vụ Minh Dũng Land</strong> luôn coi trọng quyền lợi của khách hàng và cam kết tiếp nhận, giải quyết mọi phản ánh, khiếu nại một cách minh bạch, nhanh chóng.
        </p>

        <div className="space-y-6 text-sm sm:text-base leading-relaxed">
          {/* MỤC 1 */}
          <section className="space-y-3">
            <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold shrink-0">1</span>
              Các kênh tiếp nhận khiếu nại, phản ánh
            </h2>
            <p className="text-slate-600 pl-8">
              Khách hàng có thể gửi thông tin phản ánh hoặc khiếu nại liên quan đến dịch vụ tư vấn, thông tin dự án bất động sản hiển thị trên website qua các hình thức sau:
            </p>
            <div className="grid gap-3 sm:grid-cols-3 pl-8">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="text-blue-600 font-bold text-sm">📞 Hotline trực tiếp</div>
                <div className="text-xs text-slate-600">Gọi điện trực tiếp đến Hotline công ty hiển thị tại chân trang web.</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="text-blue-600 font-bold text-sm">✉️ Email chính thức</div>
                <div className="text-xs text-slate-600">Gửi thông tin chi tiết qua Email chính thức của công ty.</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="text-blue-600 font-bold text-sm">🏢 Trực tiếp tại văn phòng</div>
                <div className="text-xs text-slate-600">Đến trực tiếp trụ sở văn phòng công ty tại: 125 Trần Cao Vân, Quy Nhơn để làm việc trực tiếp.</div>
              </div>
            </div>
          </section>

          {/* MỤC 2 */}
          <section className="space-y-3 pt-2 border-t border-slate-100">
            <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold shrink-0">2</span>
              Quy trình giải quyết khiếu nại
            </h2>
            
            <div className="space-y-3 pl-8">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="px-2 py-0.5 rounded bg-blue-600 text-white text-xs font-bold shrink-0">Bước 1</span>
                <div>
                  <strong className="text-slate-900">Tiếp nhận:</strong>{" "}
                  <span className="text-slate-600">Bộ phận chăm sóc khách hàng tiếp nhận thông tin khiếu nại, ghi nhận nội dung và kiểm tra tính xác thực.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="px-2 py-0.5 rounded bg-blue-600 text-white text-xs font-bold shrink-0">Bước 2</span>
                <div>
                  <strong className="text-slate-900">Xử lý:</strong>{" "}
                  <span className="text-slate-600">Ban giám đốc phối hợp với các bộ phận liên quan (kinh doanh, pháp lý, tư vấn viên trực tiếp) để xác minh vụ việc và đưa ra phương án giải quyết trong vòng <strong>24h - 48h làm việc</strong> kể từ khi tiếp nhận.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="px-2 py-0.5 rounded bg-blue-600 text-white text-xs font-bold shrink-0">Bước 3</span>
                <div>
                  <strong className="text-slate-900">Phản hồi:</strong>{" "}
                  <span className="text-slate-600">Công ty liên hệ trực tiếp với khách hàng qua số điện thoại hoặc email để thông báo kết quả xử lý và thống nhất phương án khắc phục (nếu có).</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
