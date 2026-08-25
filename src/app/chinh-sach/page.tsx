import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chính sách bảo mật thông tin — Minh Dũng Land",
  description: "Chính sách bảo vệ và bảo mật dữ liệu cá nhân của khách hàng tại Công ty TNHH Thương mại Dịch vụ Minh Dũng Land.",
};

export default function ChinhSachBaoMatPage() {
  return (
    <div className="container-page py-12">
      <div className="mx-auto max-w-4xl card p-8 sm:p-10 space-y-6 text-slate-700 bg-white shadow-sm border border-slate-200/80 rounded-2xl">
        <div className="border-b border-slate-100 pb-4">
          <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Chính sách pháp lý</div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
            Chính Sách Bảo Mật Thông Tin
          </h1>
          <div className="text-xs text-slate-500 mt-1">CÔNG TY TNHH THƯƠNG MẠI DỊCH VỤ MINH DŨNG LAND</div>
        </div>

        <div className="space-y-4 text-sm sm:text-base leading-relaxed">
          <section className="space-y-2">
            <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold shrink-0">1</span>
              Mục đích thu thập thông tin cá nhân
            </h2>
            <p className="text-slate-600 pl-8">
              Website <strong>minhdungland.com.vn</strong> thu thập thông tin khách hàng (bao gồm Họ tên, Số điện thoại, Email) thông qua form đăng ký tư vấn trực tuyến nhằm mục đích:
            </p>
            <ul className="list-disc list-inside pl-8 space-y-1.5 text-slate-600">
              <li>Liên hệ tư vấn, cung cấp thông tin dự án, bảng giá và chính sách ưu đãi bất động sản theo đúng nhu cầu của khách hàng.</li>
              <li>Hỗ trợ khách hàng đặt lịch hẹn xem nhà mẫu hoặc thực địa dự án.</li>
              <li>Giải đáp các thắc mắc liên quan đến thủ tục pháp lý mua bán, chuyển nhượng bất động sản.</li>
            </ul>
          </section>

          <section className="space-y-2 pt-2 border-t border-slate-100">
            <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold shrink-0">2</span>
              Phạm vi sử dụng thông tin
            </h2>
            <p className="text-slate-600 pl-8">
              Thông tin cá nhân thu thập được chỉ được sử dụng nội bộ trong phạm vi hoạt động quản lý, chăm sóc khách hàng của <strong>Công ty TNHH Thương mại Dịch vụ Minh Dũng Land</strong>. Chúng tôi cam kết không bán, không chia sẻ hay trao đổi thông tin này cho bất kỳ bên thứ ba nào khác.
            </p>
          </section>

          <section className="space-y-2 pt-2 border-t border-slate-100">
            <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold shrink-0">3</span>
              Thời gian lưu trữ thông tin
            </h2>
            <p className="text-slate-600 pl-8">
              Dữ liệu cá nhân của khách hàng sẽ được lưu trữ bảo mật trên hệ thống nội bộ của công ty cho đến khi hoàn thành mục đích tư vấn hoặc khi có yêu cầu hủy bỏ từ phía khách hàng.
            </p>
          </section>

          <section className="space-y-2 pt-2 border-t border-slate-100">
            <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold shrink-0">4</span>
              Cam kết bảo mật thông tin cá nhân khách hàng
            </h2>
            <p className="text-slate-600 pl-8">
              Công ty áp dụng các biện pháp kỹ thuật và an ninh thích hợp để bảo vệ dữ liệu cá nhân của khách hàng khỏi việc truy cập, sử dụng hoặc tiết lộ trái phép. Việc thu thập và xử lý thông tin cá nhân luôn tuân thủ <strong>Nghị định 13/2023/NĐ-CP</strong> về bảo vệ dữ liệu cá nhân.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
