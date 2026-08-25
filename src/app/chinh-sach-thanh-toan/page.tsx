import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chính sách về thanh toán — Minh Dũng Land",
  description: "Quy định về thanh toán và giao dịch bất động sản tại Công ty TNHH Thương mại Dịch vụ Minh Dũng Land.",
};

export default function ChinhSachThanhToanPage() {
  return (
    <div className="container-page py-12">
      <div className="mx-auto max-w-4xl card p-8 sm:p-10 space-y-6 text-slate-700 bg-white shadow-sm border border-slate-200/80 rounded-2xl">
        <div className="border-b border-slate-100 pb-4">
          <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Chính sách pháp lý</div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
            Chính Sách Về Thanh Toán
          </h1>
          <div className="text-xs text-slate-500 mt-1">CÔNG TY TNHH THƯƠNG MẠI DỊCH VỤ MINH DŨNG LAND</div>
        </div>

        <div className="space-y-4 text-sm sm:text-base leading-relaxed">
          <section className="space-y-2">
            <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold shrink-0">1</span>
              Quy định về giao dịch trên website
            </h2>
            <p className="text-slate-600 pl-8">
              Website <strong>minhdungland.com.vn</strong> hoàn toàn không tích hợp bất kỳ tính năng thanh toán trực tuyến nào, không thu tiền đặt cọc, không yêu cầu người dùng chuyển khoản trực tiếp qua hệ thống trang web. Do đó, không có rủi ro về giao dịch tài chính trực tuyến trên nền tảng của chúng tôi.
            </p>
          </section>

          <section className="space-y-2 pt-2 border-t border-slate-100">
            <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold shrink-0">2</span>
              Phương thức thanh toán giao dịch bất động sản
            </h2>
            <p className="text-slate-600 pl-8">
              Mọi giao dịch liên quan đến việc mua bán, thuê mua, chuyển nhượng bất động sản do Minh Dũng Land môi giới sẽ được thực hiện trực tiếp giữa bên mua và bên bán (hoặc giữa bên mua và Chủ đầu tư dự án).
            </p>
            <p className="text-slate-600 pl-8">
              Phương thức thanh toán (Tiền mặt hoặc Chuyển khoản ngân hàng) và tiến độ thanh toán sẽ được quy định rõ ràng, hợp pháp bằng văn bản trong Hợp đồng đặt cọc hoặc Hợp đồng mua bán chính thức được ký kết trực tiếp tại văn phòng công ty hoặc phòng giao dịch của ngân hàng.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
