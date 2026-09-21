import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Quyền và nghĩa vụ các bên — Minh Dũng Land",
  description:
    "Chính sách quy định chi tiết quyền hạn, nghĩa vụ pháp lý của Minh Dũng Land và Khách hàng trong giao dịch bất động sản.",
};

export default function QuyenVaNghiaVuPage() {
  return (
    <div className="container-page py-12">
      <div className="mx-auto max-w-4xl card p-8 sm:p-10 space-y-8 text-slate-700 bg-white shadow-sm border border-slate-200/80 rounded-2xl">
        {/* Header */}
        <div className="border-b border-slate-100 pb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2">
            Chính sách pháp lý &amp; giao dịch
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
            Chính Sách Quyền Và Nghĩa Vụ Của Người Bán Và Người Mua
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 font-medium">
            CÔNG TY TNHH THƯƠNG MẠI DỊCH VỤ MINH DŨNG LAND
          </p>
        </div>

        {/* Lời mở đầu */}
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 sm:p-5 text-sm sm:text-base text-slate-600 leading-relaxed space-y-2">
          <p>
            Chính sách này quy định chi tiết về quyền hạn, trách nhiệm pháp lý giữa Bên cung cấp dịch vụ (<strong>Công ty TNHH Thương mại Dịch vụ Minh Dũng Land</strong>) và Khách hàng (Cá nhân / Doanh nghiệp) khi thực hiện các giao dịch tìm kiếm, đặt cọc, mua bán, cho thuê căn hộ, nhà đất, đăng ký tư vấn giải pháp bất động sản hoặc ký kết hợp đồng dịch vụ qua hệ thống của Minh Dũng Land.
          </p>
          <p>
            Quy định nhằm đảm bảo mọi hoạt động giao dịch thương mại bất động sản được diễn ra công khai, minh bạch, an toàn và tuân thủ tuyệt đối các quy định của pháp luật Việt Nam hiện hành.
          </p>
        </div>

        <div className="space-y-8 text-sm sm:text-base leading-relaxed">
          {/* MỤC 1 */}
          <section className="space-y-4">
            <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-bold shrink-0">
                1
              </span>
              Quyền và Nghĩa vụ của Bên cung cấp dịch vụ (Minh Dũng Land)
            </h2>

            {/* 1.1 Quyền */}
            <div className="pl-9 space-y-3">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                1.1. Quyền của Minh Dũng Land
              </h3>
              <ul className="list-disc pl-5 space-y-2 text-slate-600">
                <li>
                  <strong>Chủ động trong kinh doanh:</strong> Quyết định danh mục bất động sản (căn hộ, nhà đất, dự án), niêm yết giá bán/giá thuê, triển khai các chương trình ưu đãi, chính sách tư vấn và dịch vụ trên hệ thống website chính thức theo đúng quy định pháp luật.
                </li>
                <li>
                  <strong>Cập nhật thông tin:</strong> Tự do điều chỉnh, cập nhật thông tin chi tiết về sản phẩm (diện tích, giá niêm yết, tình trạng pháp lý, hình ảnh thực tế) cũng như chính sách phí dịch vụ nhằm phản ánh chính xác tình hình thị trường bất động sản.
                </li>
                <li>
                  <strong>Xác minh đơn hàng &amp; Thông tin khách hàng:</strong> Yêu cầu Khách hàng cung cấp đầy đủ, chính xác thông tin cá nhân, thông tin doanh nghiệp (Mã số thuế, người đại diện) và nhu cầu thực tế để xác nhận yêu cầu tư vấn, giao dịch cọc hoặc ký kết hợp đồng.
                </li>
                <li>
                  <strong>Quyền từ chối hoặc hủy giao dịch:</strong> Từ chối hoặc hủy bỏ yêu cầu dịch vụ trong các trường hợp thông tin đặt mua/thuê không chính xác, bất động sản đã được giao dịch trước đó, sự cố hệ thống hiển thị sai thông tin giá, hoặc do tác động của các sự kiện bất khả kháng.
                </li>
                <li>
                  <strong>Bảo trì hệ thống:</strong> Tạm ngừng hoặc giới hạn tính năng tiếp nhận đăng ký trực tuyến để tiến hành bảo trì, nâng cấp hạ tầng máy chủ, cập nhật giao diện hoặc khắc phục sự cố an ninh mạng.
                </li>
                <li>
                  <strong>Yêu cầu thanh toán:</strong> Yêu cầu Khách hàng hoàn tất nghĩa vụ thanh toán tiền đặt cọc, tiền mua/thuê bất động sản hoặc phí dịch vụ đầy đủ, đúng hạn theo đúng tiến độ hợp đồng đã thỏa thuận.
                </li>
                <li>
                  <strong>Xử lý phản hồi:</strong> Tiếp nhận, kiểm tra và giải quyết các khiếu nại, phản ánh của Khách hàng dựa trên các quy trình và chính sách được niêm yết công khai.
                </li>
              </ul>
            </div>

            {/* 1.2 Nghĩa vụ */}
            <div className="pl-9 space-y-3 pt-4">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                1.2. Nghĩa vụ của Minh Dũng Land
              </h3>
              <ul className="list-disc pl-5 space-y-2 text-slate-600">
                <li>
                  <strong>Minh bạch thông tin:</strong> Cung cấp chính xác, đầy đủ các thông tin pháp lý về doanh nghiệp, thông số bất động sản (diện tích, vị trí, số phòng ngủ, hướng, tình trạng pháp lý), bảng giá niêm yết và các điều kiện giao dịch liên quan trên website.
                </li>
                <li>
                  <strong>Đảm bảo chất lượng dịch vụ:</strong> Cam kết các thông tin công bố về giỏ hàng bất động sản (Altara Residences, Phú Tài Residence, Simona Heights, The Sailing Quy Nhơn...) là trung thực, xác thực và minh bạch.
                </li>
                <li>
                  <strong>Công khai chi phí:</strong> Niêm yết rõ ràng giá bán, giá thuê, phí dịch vụ tư vấn, các khoản thuế GTGT (VAT) và các khoản phí thủ tục liên quan (nếu có).
                </li>
                <li>
                  <strong>Bàn giao chuẩn xác:</strong> Thực hiện bàn giao đúng căn hộ/nhà đất, đúng hồ sơ pháp lý, đúng nội thất cam kết và đáp ứng đúng tiến độ đã thỏa thuận với Khách hàng.
                </li>
                <li>
                  <strong>Hậu mãi &amp; Hỗ trợ thủ tục:</strong> Thực hiện nghiêm túc các chính sách hỗ trợ pháp lý sang tên, công chứng, giải quyết sự cố phát sinh và hỗ trợ chăm sóc khách hàng sau giao dịch.
                </li>
                <li>
                  <strong>Bảo mật thông tin &amp; Dữ liệu:</strong> Cam kết bảo vệ tuyệt đối thông tin cá nhân và lịch sử giao dịch của Khách hàng, không chia sẻ cho bên thứ ba trừ trường hợp có yêu cầu từ cơ quan Nhà nước có thẩm quyền.
                </li>
                <li>
                  <strong>Thực hiện nghĩa vụ tài chính:</strong> Khai báo và hoàn thành đầy đủ các nghĩa vụ thuế, phí và nghĩa vụ tài chính khác đối với Nhà nước.
                </li>
              </ul>
            </div>
          </section>

          {/* MỤC 2 */}
          <section className="space-y-4 pt-6 border-t border-slate-100">
            <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-bold shrink-0">
                2
              </span>
              Quyền và Nghĩa vụ của Khách hàng (Người mua / Người thuê)
            </h2>

            {/* 2.1 Quyền */}
            <div className="pl-9 space-y-3">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                2.1. Quyền của Khách hàng
              </h3>
              <ul className="list-disc pl-5 space-y-2 text-slate-600">
                <li>
                  <strong>Tiếp cận thông tin đầy đủ:</strong> Được tư vấn và cung cấp minh bạch thông tin chi tiết về bất động sản, vị trí, giá cả, phương thức thanh toán, tiến độ bàn giao và các điều khoản giao dịch trước khi quyết định đặt cọc hoặc ký hợp đồng.
                </li>
                <li>
                  <strong>Nắm rõ tổng chi phí:</strong> Được xác nhận rõ tổng giá trị giao dịch, phí dịch vụ, phí chuyển nhượng, thuế/phí liên quan trước khi tiến hành thanh toán.
                </li>
                <li>
                  <strong>Tự do lựa chọn:</strong> Chủ động lựa chọn bất động sản, dự án, hình thức thanh toán và phương thức tiếp nhận bàn giao phù hợp với nhu cầu.
                </li>
                <li>
                  <strong>Nhận đúng bất động sản:</strong> Được nhận bàn giao căn hộ/nhà đất thực tế đúng vị trí, đúng diện tích, đúng tình trạng nội thất và pháp lý như đã thỏa thuận.
                </li>
                <li>
                  <strong>Yêu cầu hỗ trợ &amp; Giải quyết khiếu nại:</strong> Được quyền yêu cầu hỗ trợ kiểm tra thực tế, khắc phục các sai lệch thông tin, đổi sang sản phẩm khác hoặc hoàn tiền cọc khi đáp ứng đầy đủ các điều kiện thuộc chính sách của Minh Dũng Land.
                </li>
                <li>
                  <strong>An toàn thông tin:</strong> Được bảo đảm an toàn và bảo mật toàn bộ thông tin cá nhân, dữ liệu giao dịch theo Chính sách bảo mật hiện hành.
                </li>
                <li>
                  <strong>Phản ánh và khiếu nại:</strong> Được gửi phản ánh, đóng góp ý kiến hoặc khiếu nại về chất lượng dịch vụ, bàn giao, thanh toán và được Minh Dũng Land tiếp nhận, giải quyết thỏa đáng.
                </li>
              </ul>
            </div>

            {/* 2.2 Nghĩa vụ */}
            <div className="pl-9 space-y-3 pt-4">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                2.2. Nghĩa vụ của Khách hàng
              </h3>
              <ul className="list-disc pl-5 space-y-2 text-slate-600">
                <li>
                  <strong>Cung cấp thông tin chính xác:</strong> Cung cấp đầy đủ, chuẩn xác thông tin cá nhân, thông tin người đại diện, số điện thoại, email và địa chỉ liên hệ để phục vụ công tác xác nhận giao dịch và ký kết hợp đồng.
                </li>
                <li>
                  <strong>Rà soát thông tin:</strong> Kiểm tra kỹ lưỡng các thông tin bất động sản, số tiền đặt cọc, tiến độ thanh toán, chi phí phát sinh và các điều khoản mua bán/cho thuê trước khi xác nhận giao dịch.
                </li>
                <li>
                  <strong>Thanh toán đầy đủ:</strong> Thực hiện thanh toán đúng giá trị hợp đồng/đơn hàng và đúng thời hạn theo phương thức đã chọn.
                </li>
                <li>
                  <strong>Kiểm tra khi nhận bàn giao:</strong> Thực hiện đồng kiểm hiện trạng căn hộ/nhà đất, danh mục nội thất và hồ sơ pháp lý cùng chuyên viên của Minh Dũng Land; lập biên bản xác nhận ngay nếu phát hiện tài sản bị hư hỏng, thiếu hụt nội thất hoặc không đúng cam kết.
                </li>
                <li>
                  <strong>Cung cấp bằng chứng khi có sự cố:</strong> Phối hợp cung cấp hình ảnh, video thực tế, phiếu đặt cọc hoặc chứng từ liên quan khi thực hiện các yêu cầu khiếu nại, bảo hành hay đổi trả dịch vụ.
                </li>
                <li>
                  <strong>Tuân thủ quy định pháp luật:</strong> Chấp hành đúng các quy định pháp luật về nhà ở, đất đai và các quy định chung của ban quản lý tòa nhà/dự án.
                </li>
                <li className="text-rose-600 font-semibold">
                  <strong>Sử dụng dịch vụ văn minh:</strong> Tuyệt đối không gian lận, cố tình cung cấp thông tin giả mạo, can thiệp gây ảnh hưởng đến hạ tầng kỹ thuật website của Minh Dũng Land hoặc xâm phạm quyền lợi hợp pháp của Công ty và các bên liên quan.
                </li>
              </ul>
            </div>
          </section>

          {/* MỤC 3 */}
          <section className="space-y-3 pt-6 border-t border-slate-100">
            <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-bold shrink-0">
                3
              </span>
              Nguyên tắc thực hiện giao dịch &amp; Giải quyết tranh chấp
            </h2>
            <div className="pl-9 space-y-2 text-slate-600">
              <p>
                <strong>Tinh thần hợp tác:</strong> Giao dịch được thực hiện trên nguyên tắc Tự nguyện – Minh bạch – Thiện chí – Hợp tác cùng phát triển.
              </p>
              <p>
                <strong>Trung thực &amp; Tôn trọng:</strong> Cả hai bên cam kết cung cấp và sử dụng thông tin một cách trung thực, tôn trọng tối đa quyền và lợi ích hợp pháp của nhau.
              </p>
              <p>
                <strong>Phương thức giải quyết tranh chấp:</strong> Trường hợp phát sinh bất kỳ bất đồng hay tranh chấp nào trong quá trình mua bán, cho thuê hoặc triển khai dịch vụ, hai bên ưu tiên thương lượng, hòa giải trực tiếp. Nếu không thể đi đến thống nhất chung thông qua hòa giải, tranh chấp sẽ được đưa ra giải quyết tại Tòa án nhân dân có thẩm quyền theo quy định của pháp luật Việt Nam.
              </p>
            </div>
          </section>

          {/* MỤC 4 */}
          <section className="space-y-3 pt-6 border-t border-slate-100">
            <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-bold shrink-0">
                4
              </span>
              Xử lý vi phạm
            </h2>
            <div className="pl-9 space-y-2 text-slate-600">
              <p>
                <strong>Vi phạm từ phía Khách hàng:</strong> Nếu Khách hàng cố tình gian lận, cung cấp thông tin giả mạo, bỏ cọc không theo thỏa thuận, hoặc có hành vi tấn công hạ tầng kỹ thuật website, Minh Dũng Land có quyền hủy bỏ giao dịch, từ chối phục vụ và áp dụng các biện pháp xử lý theo quy định pháp luật.
              </p>
              <p>
                <strong>Vi phạm từ phía Minh Dũng Land:</strong> Nếu Minh Dũng Land không thực hiện đúng các nghĩa vụ cam kết chất lượng dịch vụ/thông tin bất động sản, Khách hàng có quyền yêu cầu Minh Dũng Land khắc phục sự cố, hoàn tiền cọc hoặc bồi thường theo chính sách công bố và quy định của Luật Bảo vệ quyền lợi người tiêu dùng.
              </p>
            </div>
          </section>

          {/* MỤC 5 */}
          <section className="space-y-3 pt-6 border-t border-slate-100">
            <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-bold shrink-0">
                5
              </span>
              Điều chỉnh và Cập nhật chính sách
            </h2>
            <div className="pl-9 space-y-2 text-slate-600">
              <p>
                Công ty TNHH Thương mại Dịch vụ Minh Dũng Land giữ quyền sửa đổi, bổ sung hoặc điều chỉnh nội dung Chính sách Quyền và Nghĩa vụ này bất kỳ lúc nào nhằm đảm bảo phù hợp với thực tế hoạt động kinh doanh cũng như các quy định mới của pháp luật.
              </p>
              <p>
                Mọi sự thay đổi sẽ có hiệu lực ngay khi được đăng tải công khai trên các kênh thông tin chính thức của Minh Dũng Land. Khách hàng có trách nhiệm thường xuyên theo dõi chính sách này để cập nhật thông tin mới nhất.
              </p>
            </div>
          </section>

          {/* MỤC VI */}
          <section className="space-y-4 pt-6 border-t border-slate-100">
            <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-bold shrink-0">
                VI
              </span>
              Thông tin liên hệ và hỗ trợ
            </h2>
            <p className="text-slate-600 pl-9">
              Mọi thắc mắc, đóng góp ý kiến hoặc yêu cầu hỗ trợ liên quan đến Chính sách Quyền và Nghĩa vụ, Quý khách vui lòng liên hệ:
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
            <Link href="/dieu-khoan" className="hover:text-slate-900">
              Điều khoản sử dụng
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
