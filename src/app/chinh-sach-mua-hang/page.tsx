import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Quy trình mua hàng trực tuyến — Minh Dũng Land",
  description:
    "Quy trình từng bước tìm kiếm, đăng ký tư vấn, đặt cọc và giao kết hợp đồng mua bán, thuê bất động sản tại Minh Dũng Land.",
};

export default function ChinhSachMuaHangPage() {
  return (
    <div className="container-page py-12">
      <div className="mx-auto max-w-4xl card p-8 sm:p-10 space-y-8 text-slate-700 bg-white shadow-sm border border-slate-200/80 rounded-2xl">
        {/* Header */}
        <div className="border-b border-slate-100 pb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2">
            Hướng dẫn giao dịch trực tuyến
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
            Quy Trình Mua Hàng Trực Tuyến
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 font-medium">
            CÔNG TY TNHH THƯƠNG MẠI DỊCH VỤ MINH DŨNG LAND
          </p>
        </div>

        <div className="space-y-8 text-sm sm:text-base leading-relaxed">
          {/* MỤC 1 */}
          <section className="space-y-4">
            <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-bold shrink-0">
                1
              </span>
              Quy trình đăng ký dịch vụ &amp; Giao dịch trực tuyến
            </h2>
            <p className="text-slate-600 pl-9">
              Để tìm kiếm, đăng ký tư vấn hoặc thực hiện các giao dịch mua bán, cho thuê bất động sản và căn hộ trên hệ thống của Minh Dũng Land, Quý khách hàng thực hiện theo các bước chuẩn sau:
            </p>

            <div className="pl-9 grid gap-3 sm:gap-4">
              {[
                {
                  step: "Bước 1",
                  title: "Tìm kiếm & Lựa chọn bất động sản",
                  desc: "Truy cập hệ thống website của Minh Dũng Land, chọn danh mục (Mua bán / Cho thuê) và tìm kiếm các dự án căn hộ, nhà đất, bất động sản (như Altara Residences, Phú Tài Residence, Simona Heights, The Sailing Quy Nhơn...) phù hợp với nhu cầu.",
                },
                {
                  step: "Bước 2",
                  title: "Xem chi tiết thông số & Pháp lý",
                  desc: "Nhấp vào từng sản phẩm/căn hộ để tìm hiểu chi tiết về diện tích, số phòng ngủ, hướng, tình trạng nội thất, giá niêm yết, vị trí tầng, hình ảnh thực tế và thông tin pháp lý đi kèm.",
                },
                {
                  step: "Bước 3",
                  title: "Kiểm tra thông tin & Điều kiện giao dịch",
                  desc: "Rà soát kỹ các thông số kỹ thuật, khoảng giá, chính sách ưu đãi, tiến độ thanh toán hoặc điều kiện thuê/mua bất động sản.",
                },
                {
                  step: "Bước 4",
                  title: "Chọn sản phẩm & Yêu cầu tư vấn",
                  desc: 'Lựa chọn sản phẩm bất động sản phù hợp, nhấn "Đăng ký tư vấn", "Liên hệ" hoặc gửi yêu cầu đặt lịch xem nhà thực tế.',
                },
                {
                  step: "Bước 5",
                  title: "Điền thông tin cá nhân / Đại diện",
                  desc: "Cung cấp chính xác thông tin người đăng ký giao dịch bao gồm: Họ và tên, Số điện thoại liên hệ, Địa chỉ Email cá nhân hoặc Email công tác.",
                },
                {
                  step: "Bước 6",
                  title: "Điền nhu cầu chi tiết & Thông tin giao nhận hồ sơ",
                  desc: "Cung cấp thông tin chi tiết về nhu cầu tài chính, nhu cầu ở/đầu tư, tên Công ty/Tổ chức, Mã số thuế (nếu cần xuất hóa đơn VAT dịch vụ/hợp đồng thuê) và địa chỉ nhận hồ sơ/hợp đồng cọc.",
                },
                {
                  step: "Bước 7",
                  title: "Rà soát thông tin & Chọn phương thức thanh toán / Đặt cọc",
                  desc: "Kiểm tra lại toàn bộ thông tin đăng ký, giá giao dịch, chi phí dịch vụ (nếu có) và lựa chọn hình thức thanh toán/đặt cọc (Chuyển khoản ngân hàng, thanh toán theo tiến độ hợp đồng cọc/mua bán...).",
                },
                {
                  step: "Bước 8",
                  title: "Hoàn tất đăng ký & Gửi yêu cầu",
                  desc: 'Nhấn "Gửi yêu cầu" để gửi thông tin trực tiếp về hệ thống xử lý trung tâm của Công ty TNHH Thương mại Dịch vụ Minh Dũng Land.',
                },
                {
                  step: "Bước 9",
                  title: "Nhận thông báo & Xác nhận giao dịch",
                  desc: "Hệ thống hoặc Chuyên viên tư vấn sẽ gửi thông báo xác nhận. Trong vòng 24 giờ làm việc, tư vấn viên của Minh Dũng Land sẽ liên hệ trực tiếp để tư vấn chuyên sâu, dẫn Quý khách đi xem thực tế bất động sản và hỗ trợ các thủ tục đặt cọc, ký kết hợp đồng mua bán/cho thuê.",
                },
              ].map((item) => (
                <div key={item.step} className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-xs font-bold shrink-0">
                      {item.step}
                    </span>
                    {item.title}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 pl-0 sm:pl-12 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* MỤC 2 */}
          <section className="space-y-3 pt-6 border-t border-slate-100">
            <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-bold shrink-0">
                2
              </span>
              Quy định &amp; Điều khoản giao dịch
            </h2>
            <div className="pl-9 space-y-3 text-slate-600">
              <div className="space-y-1">
                <h3 className="font-bold text-slate-800">Độ tuổi &amp; Quyền đại diện giao dịch</h3>
                <p>
                  Khách hàng cá nhân thực hiện giao dịch mua bán/cho thuê phải từ đủ 18 tuổi trở lên, có đầy đủ năng lực hành vi dân sự theo quy định của pháp luật. Đối với giao dịch doanh nghiệp, người thực hiện phải là Đại diện theo pháp luật hoặc người được ủy quyền hợp pháp.
                </p>
              </div>

              <div className="space-y-1">
                <h3 className="font-bold text-slate-800">Năng lực hành vi dân sự</h3>
                <p>
                  Khách hàng cam kết có đầy đủ năng lực hành vi dân sự để ký kết, thực hiện và chịu trách nhiệm pháp lý đối với các giao dịch cọc, mua bán, cho thuê hoặc sử dụng dịch vụ tư vấn trên nền tảng của Minh Dũng Land.
                </p>
              </div>

              <div className="space-y-1">
                <h3 className="font-bold text-slate-800">Tính chính xác của thông tin</h3>
                <p>
                  Khách hàng có trách nhiệm cung cấp đầy đủ, trung thực và chính xác các thông tin liên hệ, nhu cầu thực tế và thông tin pháp lý cá nhân/doanh nghiệp. Trong trường hợp phát hiện thông tin giả mạo hoặc có dấu hiệu gian lận thương mại, Minh Dũng Land có quyền từ chối phục vụ, ngừng cung cấp dịch vụ tư vấn hoặc hủy bỏ yêu cầu giao dịch mà không chịu trách nhiệm bồi thường.
                </p>
              </div>

              <div className="space-y-1">
                <h3 className="font-bold text-slate-800">Quyền từ chối / Hủy yêu cầu giao dịch từ phía Minh Dũng Land</h3>
                <p>
                  Chúng tôi có quyền tạm dừng hoặc hủy bỏ yêu cầu dịch vụ/giao dịch trong các trường hợp: bất động sản đã được chủ nhà/chủ đầu tư giao dịch thành công trước đó, phát hiện lợi dụng lỗ hổng hệ thống, sự cố kỹ thuật dẫn đến sai lệch thông tin báo giá/diện tích/mô tả sản phẩm, hoặc các trường hợp bất khả kháng theo quy định của pháp luật.
                </p>
              </div>
            </div>
          </section>

          {/* LIÊN HỆ */}
          <section className="space-y-4 pt-6 border-t border-slate-100">
            <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-bold shrink-0">
                ★
              </span>
              Thông tin liên hệ &amp; Bảo hành dịch vụ
            </h2>

            <div className="ml-9 p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs sm:text-sm">
              <div className="font-bold text-slate-900 uppercase">
                CÔNG TY TNHH THƯƠNG MẠI DỊCH VỤ MINH DŨNG LAND
              </div>
              <div className="text-slate-600">
                <strong>Địa chỉ:</strong> 125 Trần Cao Vân, Phường Quy Nhơn, Tỉnh Gia Lai
              </div>
              <div className="text-slate-600">
                <strong>Zalo OA:</strong>{" "}
                <a
                  href="https://zalo.me/2926236115682535802"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-medium"
                >
                  https://zalo.me/2926236115682535802
                </a>
              </div>
              <div className="text-slate-600">
                <strong>Website:</strong>{" "}
                <span className="text-slate-800 font-medium">www.minhdungland.com.vn</span>
              </div>
            </div>
          </section>
        </div>

        {/* Footer actions */}
        <div className="pt-6 border-t border-slate-100 flex flex-wrap gap-3 items-center justify-between text-xs sm:text-sm">
          <Link href="/" className="text-blue-600 hover:underline font-medium">
            ← Về trang chủ
          </Link>
          <div className="flex gap-4 text-slate-500">
            <Link href="/listings" className="hover:text-slate-900">
              Tra cứu bất động sản
            </Link>
            <span>·</span>
            <Link href="/chinh-sach-thanh-toan" className="hover:text-slate-900">
              Phương thức thanh toán
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
