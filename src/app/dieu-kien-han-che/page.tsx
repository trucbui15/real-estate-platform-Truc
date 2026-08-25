import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Điều kiện và hạn chế cung cấp dịch vụ — Minh Dũng Land",
  description: "Các điều kiện và giới hạn trong việc cung cấp dịch vụ tư vấn, môi giới bất động sản tại Công ty TNHH Thương mại Dịch vụ Minh Dũng Land.",
};

export default function DieuKienHanChePage() {
  return (
    <div className="container-page py-12">
      <div className="mx-auto max-w-4xl card p-8 sm:p-10 space-y-6 text-slate-700 bg-white shadow-sm border border-slate-200/80 rounded-2xl">
        <div className="border-b border-slate-100 pb-4">
          <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Quy định pháp lý</div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
            Các Điều Kiện Hoặc Hạn Chế Trong Việc Cung Cấp Dịch Vụ Môi Giới
          </h1>
          <div className="text-xs text-slate-500 mt-1">CÔNG TY TNHH THƯƠNG MẠI DỊCH VỤ MINH DŨNG LAND</div>
        </div>

        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          <strong>Công ty TNHH Thương mại Dịch vụ Minh Dũng Land</strong> thiết lập một số điều kiện và hạn chế trong việc cung cấp dịch vụ tư vấn bất động sản nhằm đảm bảo tính pháp lý và an toàn giao dịch:
        </p>

        <div className="space-y-4 text-sm sm:text-base leading-relaxed">
          <section className="space-y-2">
            <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold shrink-0">1</span>
              Đối tượng khách hàng
            </h2>
            <p className="text-slate-600 pl-8">
              Khách hàng sử dụng form tư vấn và dịch vụ môi giới phải là cá nhân có đầy đủ năng lực hành vi dân sự theo quy định của pháp luật Việt Nam, hoặc tổ chức, doanh nghiệp có tư cách pháp nhân hợp pháp.
            </p>
          </section>

          <section className="space-y-2 pt-2 border-t border-slate-100">
            <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold shrink-0">2</span>
              Hạn chế về tính chính xác của thông tin cung cấp
            </h2>
            <p className="text-slate-600 pl-8">
              Khách hàng có trách nhiệm cung cấp chính xác thông tin liên hệ (Họ tên, Số điện thoại) khi điền form. Chúng tôi có quyền từ chối cung cấp dịch vụ hoặc ngừng liên hệ tư vấn đối với những trường hợp cố tình cung cấp thông tin giả mạo, thông tin sai lệch nhằm mục đích phá hoại hệ thống hoặc spam dữ liệu.
            </p>
          </section>

          <section className="space-y-2 pt-2 border-t border-slate-100">
            <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold shrink-0">3</span>
              Phạm vi khu vực cung cấp dịch vụ
            </h2>
            <p className="text-slate-600 pl-8">
              Dịch vụ môi giới, hỗ trợ xem nhà đất thực tế hiện tại chỉ áp dụng tập trung cho các dự án bất động sản nằm trong phạm vi khu vực tỉnh Bình Định và các khu vực lân cận được công ty phân phối chính thức theo giấy phép hoạt động kinh doanh.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
