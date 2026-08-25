import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Phương thức cung cấp dịch vụ — Minh Dũng Land",
  description: "Quy trình và phương thức cung cấp dịch vụ môi giới, tư vấn bất động sản tại Công ty TNHH Thương mại Dịch vụ Minh Dũng Land.",
};

export default function PhuongThucCungCapDichVuPage() {
  return (
    <div className="container-page py-12">
      <div className="mx-auto max-w-4xl card p-8 sm:p-10 space-y-6 text-slate-700 bg-white shadow-sm border border-slate-200/80 rounded-2xl">
        <div className="border-b border-slate-100 pb-4">
          <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Quy trình vận hành</div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
            Phương Thức Cung Cấp Dịch Vụ Môi Giới Bất Động Sản
          </h1>
          <div className="text-xs text-slate-500 mt-1">CÔNG TY TNHH THƯƠNG MẠI DỊCH VỤ MINH DŨNG LAND</div>
        </div>

        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Vì đặc thù hoạt động trong lĩnh vực dịch vụ môi giới và tư vấn bất động sản, quy trình cung cấp dịch vụ của <strong>Công ty TNHH Thương mại Dịch vụ Minh Dũng Land</strong> được thực hiện theo các bước minh bạch sau:
        </p>

        <div className="grid gap-4 sm:gap-6 pt-2">
          {/* BƯỚC 1 */}
          <div className="flex gap-4 p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-sm">
              01
            </div>
            <div className="space-y-1">
              <h3 className="font-display font-bold text-slate-900 text-base">Bước 1: Tiếp nhận nhu cầu</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Khách hàng tìm hiểu thông tin căn hộ trên website và để lại thông tin tại Form <em>&quot;Nhận tư vấn & Báo giá trực tiếp&quot;</em>.
              </p>
            </div>
          </div>

          {/* BƯỚC 2 */}
          <div className="flex gap-4 p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-sm">
              02
            </div>
            <div className="space-y-1">
              <h3 className="font-display font-bold text-slate-900 text-base">Bước 2: Liên hệ tư vấn</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Trong vòng <strong>tối đa 2 giờ làm việc</strong> kể từ khi hệ thống tiếp nhận dữ liệu, chuyên viên tư vấn của Minh Dũng Land sẽ gọi điện trực tiếp để làm rõ nhu cầu, gửi bảng giá chi tiết và thiết kế mặt bằng qua Zalo/Email cho khách hàng.
              </p>
            </div>
          </div>

          {/* BƯỚC 3 */}
          <div className="flex gap-4 p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-sm">
              03
            </div>
            <div className="space-y-1">
              <h3 className="font-display font-bold text-slate-900 text-base">Bước 3: Khảo sát thực tế</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Công ty sắp xếp nhân sự điều xe hỗ trợ dẫn khách hàng tham quan căn hộ mẫu và thực địa vị trí dự án bất động sản <strong>hoàn toàn miễn phí</strong>.
              </p>
            </div>
          </div>

          {/* BƯỚC 4 */}
          <div className="flex gap-4 p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-sm">
              04
            </div>
            <div className="space-y-1">
              <h3 className="font-display font-bold text-slate-900 text-base">Bước 4: Hỗ trợ giao dịch</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Nếu khách hàng đồng ý giao dịch, Minh Dũng Land sẽ hỗ trợ kiểm tra tính pháp lý của tài sản, hướng dẫn thủ tục làm việc trực tiếp với Chủ đầu tư hoặc Chủ nhà để ký kết hợp đồng đặt cọc/mua bán theo đúng quy định của pháp luật.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
