import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chính sách giá cả dịch vụ và sản phẩm — Minh Dũng Land",
  description: "Chính sách về giá bán, giá thuê và phí dịch vụ môi giới bất động sản tại Công ty TNHH Thương mại Dịch vụ Minh Dũng Land.",
};

export default function ChinhSachGiaPage() {
  return (
    <div className="container-page py-12">
      <div className="mx-auto max-w-4xl card p-8 sm:p-10 space-y-6 text-slate-700 bg-white shadow-sm border border-slate-200/80 rounded-2xl">
        <div className="border-b border-slate-100 pb-4">
          <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Chính sách pháp lý</div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
            Chính Sách Giá Cả Dịch Vụ Và Sản Phẩm
          </h1>
          <div className="text-xs text-slate-500 mt-1">CÔNG TY TNHH THƯƠNG MẠI DỊCH VỤ MINH DŨNG LAND</div>
        </div>

        <div className="space-y-4 text-sm sm:text-base leading-relaxed">
          <section className="space-y-2">
            <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold shrink-0">1</span>
              Bản chất thông tin giá cả trên website
            </h2>
            <p className="text-slate-600 pl-8">
              Mọi thông tin về giá bán, giá cho thuê, hoặc giá chuyển nhượng các căn hộ, bất động sản (Phú Tài Residence, Altara, Simona Heights...) hiển thị trên website <strong>minhdungland.com.vn</strong> đều là thông tin trần mang tính chất tham khảo, được cập nhật theo bảng giá gốc từ Chủ đầu tư dự án hoặc do chủ sở hữu tài sản ký gửi cung cấp tại thời điểm đăng tin.
            </p>
          </section>

          <section className="space-y-2 pt-2 border-t border-slate-100">
            <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold shrink-0">2</span>
              Chính sách phí dịch vụ đối với khách hàng mua / thuê
            </h2>
            <p className="text-slate-600 pl-8">
              <strong>Công ty TNHH Thương mại Dịch vụ Minh Dũng Land</strong> cam kết: Khách hàng sử dụng tính năng điền form tư vấn, nhận báo giá, và tham gia xem bất động sản thực tế thông qua sự hỗ trợ của chuyên viên công ty <strong>hoàn toàn không phải trả bất kỳ khoản phí dịch vụ hay chi phí môi giới nào</strong>.
            </p>
            <p className="text-slate-600 pl-8">
              Nguồn thu của công ty được chi trả dưới hình thức phí hoa hồng từ phía Chủ đầu tư hoặc Chủ sở hữu bất động sản chi trả theo thỏa thuận hợp đồng môi giới riêng biệt giữa hai bên.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
