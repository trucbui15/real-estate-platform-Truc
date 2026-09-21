import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Thông tin giá bán, chi phí phát sinh và thanh toán — Minh Dũng Land",
  description:
    "Chính sách niêm yết giá bán, các khoản chi phí phát sinh, phương thức thanh toán, chính sách hoàn tiền tại Minh Dũng Land.",
};

export default function ChinhSachGiaPage() {
  return (
    <div className="container-page py-12">
      <div className="mx-auto max-w-4xl card p-8 sm:p-10 space-y-8 text-slate-700 bg-white shadow-sm border border-slate-200/80 rounded-2xl">
        {/* Header */}
        <div className="border-b border-slate-100 pb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2">
            Chính sách giá &amp; chi phí
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
            Thông Tin Giá Bán, Chi Phí Phát Sinh Và Phương Thức Thanh Toán
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 font-medium">
            CÔNG TY TNHH THƯƠNG MẠI DỊCH VỤ MINH DŨNG LAND
          </p>
        </div>

        <div className="space-y-8 text-sm sm:text-base leading-relaxed">
          {/* MỤC 1 */}
          <section className="space-y-3">
            <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-bold shrink-0">
                1
              </span>
              Thông tin giá bán bất động sản &amp; Dịch vụ
            </h2>
            <div className="pl-9 space-y-3 text-slate-600">
              <h3 className="font-semibold text-slate-800">Giá bán niêm yết</h3>
              <p>
                Tất cả giá niêm yết bán/cho thuê căn hộ, nhà đất và dịch vụ do <strong>Công ty TNHH Thương mại Dịch vụ Minh Dũng Land</strong> cung cấp trên hệ thống website chính thức đều được thể hiện bằng <strong>Đồng Việt Nam (VNĐ)</strong>.
              </p>
              <p>
                Mức giá công bố áp dụng tại thời điểm khách hàng tham khảo hoặc yêu cầu báo giá, có thể được điều chỉnh tùy thuộc vào từng chương trình ưu đãi, chính sách chiết khấu từ chủ đầu tư/chủ nhà hoặc chiến lược kinh doanh theo từng thời kỳ.
              </p>
              <p>
                Trừ khi có thỏa thuận khác bằng văn bản hoặc thông báo riêng tại trang thông tin sản phẩm, giá áp dụng chính thức cho giao dịch sẽ tính theo thông tin hiển thị hoặc được Minh Dũng Land xác nhận tại thời điểm khách hàng thực hiện đặt cọc/ký hợp đồng.
              </p>
            </div>
          </section>

          {/* MỤC 2 */}
          <section className="space-y-3 pt-6 border-t border-slate-100">
            <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-bold shrink-0">
                2
              </span>
              Chi phí phát sinh
            </h2>
            <div className="pl-9 space-y-3 text-slate-600">
              <p>
                Ngoài giá bán/cho thuê bất động sản hoặc phí dịch vụ tư vấn niêm yết, khách hàng có thể phát sinh thêm một số khoản phí phụ trợ tùy thuộc vào quy mô giao dịch, đặc thù pháp lý và loại hình bất động sản (như phí sang tên sổ đỏ/sổ hồng, phí công chứng, thuế/phí chuyển nhượng, phí quản lý chung cư, chi phí vận chuyển nội thất,...).
              </p>
              <p>
                Mọi chi phí phát sinh (nếu có) sẽ được Minh Dũng Land thông báo minh bạch, rõ ràng cho khách hàng trong quá trình tư vấn, báo giá, lập biên bản cọc hoặc trước khi tiến hành thanh toán.
              </p>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 text-xs sm:text-sm">
                <strong>Cam kết của Minh Dũng Land:</strong> Công ty TNHH Thương mại Dịch vụ Minh Dũng Land cam kết cung cấp đầy đủ thông tin chi phí để khách hàng chủ động đánh giá và đưa ra quyết định phù hợp nhất.
              </div>
            </div>
          </section>

          {/* MỤC 3 */}
          <section className="space-y-3 pt-6 border-t border-slate-100">
            <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-bold shrink-0">
                3
              </span>
              Phương thức thanh toán
            </h2>
            <div className="pl-9 space-y-3 text-slate-600">
              <p>
                Nhằm mang lại sự tiện lợi và an toàn tối đa cho khách hàng, Minh Dũng Land hỗ trợ các phương thức thanh toán linh hoạt sau:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Thanh toán bằng chuyển khoản ngân hàng:</strong> Khách hàng thực hiện chuyển khoản vào thông tin tài khoản ngân hàng chính thức do Minh Dũng Land cung cấp trên phiếu thu đặt cọc, hợp đồng dịch vụ hoặc thông báo thanh toán. Giao dịch/dịch vụ sẽ được xác nhận kích hoạt sau khi công ty đối soát thành công khoản thanh toán.
                </li>
                <li>
                  <strong>Thanh toán trực tuyến &amp; Phương thức khác:</strong> Khách hàng có thể thực hiện thanh toán thông qua các cổng thanh toán trực tuyến hoặc các hình thức được hệ thống website của Minh Dũng Land hỗ trợ tại từng thời điểm. Hướng dẫn chi tiết từng bước sẽ hiển thị trong quá trình thao tác để đảm bảo giao dịch diễn ra nhanh chóng, an toàn.
                </li>
              </ul>
            </div>
          </section>

          {/* MỤC 4 */}
          <section className="space-y-3 pt-6 border-t border-slate-100">
            <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-bold shrink-0">
                4
              </span>
              Xác nhận thanh toán
            </h2>
            <div className="pl-9 space-y-2.5 text-slate-600">
              <p>
                Sau khi khách hàng hoàn tất chuyển khoản hoặc thanh toán trực tuyến, Minh Dũng Land sẽ kiểm tra đối soát dữ liệu và xác nhận tình trạng giao dịch đặt cọc/thanh toán.
              </p>
              <p>
                Thông báo xác nhận giao dịch thành công sẽ được gửi tới khách hàng thông qua Zalo OA, email, điện thoại hoặc các kênh liên lạc đã đăng ký.
              </p>
              <p>
                Trong trường hợp cần bổ sung hoặc xác minh thêm thông tin đối soát giao dịch, bộ phận hỗ trợ của Minh Dũng Land sẽ chủ động liên hệ trực tiếp với khách hàng để xử lý kịp thời.
              </p>
            </div>
          </section>

          {/* MỤC 5 */}
          <section className="space-y-3 pt-6 border-t border-slate-100">
            <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-bold shrink-0">
                5
              </span>
              Chính sách hoàn tiền
            </h2>
            <div className="pl-9 space-y-2.5 text-slate-600">
              <p>
                Trong trường hợp đơn hàng/hợp đồng được hai bên thống nhất hủy bỏ hợp lệ, hoặc phát sinh sự cố pháp lý/lỗi từ phía Công ty TNHH Thương mại Dịch vụ Minh Dũng Land dẫn đến việc không thể cung cấp bất động sản hay dịch vụ theo đúng thỏa thuận, khách hàng sẽ được xem xét hoàn tiền cọc/chi phí dịch vụ theo quy định và điều khoản hợp đồng.
              </p>
              <p>
                Việc hoàn tiền được thực hiện thông qua tài khoản ngân hàng ban đầu của khách hàng hoặc phương thức khác dựa trên sự thống nhất bằng văn bản giữa hai bên.
              </p>
              <p>
                Thời gian hoàn tiền thực tế phụ thuộc vào phương thức giao dịch ban đầu và quy trình xử lý của ngân hàng/đơn vị trung gian thanh toán. Minh Dũng Land sẽ tích cực phối hợp và theo sát để hỗ trợ khách hàng nhận lại khoản tiền hoàn trong thời gian sớm nhất.
              </p>
            </div>
          </section>

          {/* MỤC 6 */}
          <section className="space-y-4 pt-6 border-t border-slate-100">
            <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-bold shrink-0">
                6
              </span>
              Thông tin liên hệ hỗ trợ
            </h2>
            <p className="text-slate-600 pl-9">
              Để được tư vấn pháp lý, báo giá chi tiết hoặc hỗ trợ các vấn đề liên quan đến giá bán, chi phí giao dịch và thanh toán, Quý khách vui lòng liên hệ:
            </p>

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
            <Link href="/chinh-sach-thanh-toan" className="hover:text-slate-900">
              Chính sách thanh toán
            </Link>
            <span>·</span>
            <Link href="/chinh-sach" className="hover:text-slate-900">
              Chính sách bảo mật
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
