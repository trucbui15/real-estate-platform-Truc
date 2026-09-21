import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Quy trình tiếp nhận, xử lý khiếu nại và tranh chấp — Minh Dũng Land",
  description:
    "Quy trình tiêu chuẩn về tiếp nhận, các bước xử lý phản ánh, khiếu nại và hòa giải tranh chấp tại Công ty TNHH Thương mại Dịch vụ Minh Dũng Land.",
};

export default function TiepNhanKhieuNaiPage() {
  return (
    <div className="container-page py-12">
      <div className="mx-auto max-w-4xl card p-8 sm:p-10 space-y-8 text-slate-700 bg-white shadow-sm border border-slate-200/80 rounded-2xl">
        {/* Header */}
        <div className="border-b border-slate-100 pb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2">
            Chăm sóc khách hàng &amp; Pháp lý
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
            Quy Trình Tiếp Nhận, Xử Lý Khiếu Nại Và Giải Quyết Tranh Chấp
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 font-medium">
            CÔNG TY TNHH THƯƠNG MẠI DỊCH VỤ MINH DŨNG LAND
          </p>
        </div>

        {/* Lời mở đầu */}
        <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-4 sm:p-5 text-sm sm:text-base text-slate-700 leading-relaxed space-y-2">
          <p>
            <strong>Công ty TNHH Thương mại Dịch vụ Minh Dũng Land</strong> luôn tôn trọng và bảo vệ quyền, lợi ích hợp pháp của Quý khách hàng trong quá trình tìm hiểu, giao dịch bất động sản và sử dụng các dịch vụ (mua bán, cho thuê căn hộ, nhà đất, tư vấn pháp lý...). Mọi khiếu nại, phản ánh hoặc tranh chấp sẽ được tiếp nhận và xử lý trên tinh thần thiện chí, minh bạch, hợp tác và tuân thủ nghiêm ngặt các quy định của pháp luật hiện hành.
          </p>
          <p className="text-xs sm:text-sm text-slate-500">
            Việc giải quyết khiếu nại được thực hiện dựa trên các thông tin, hồ sơ, biên bản cọc, hợp đồng giao dịch và chứng cứ do các bên cung cấp hoặc được hệ thống ghi nhận trong quá trình tư vấn và triển khai dịch vụ.
          </p>
        </div>

        <div className="space-y-8 text-sm sm:text-base leading-relaxed">
          {/* MỤC I */}
          <section className="space-y-3">
            <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-bold shrink-0">
                I
              </span>
              Phạm vi tiếp nhận khiếu nại
            </h2>
            <div className="pl-9 space-y-2 text-slate-600">
              <p>Minh Dũng Land tiếp nhận và xử lý các khiếu nại, phản ánh liên quan đến:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                <li>
                  <strong>Chất lượng thông tin bất động sản:</strong> Thông tin dự án, diện tích, giá niêm yết, hướng, vị trí tầng, pháp lý hoặc hiện trạng thực tế của căn hộ/nhà đất không đúng với tư vấn.
                </li>
                <li>
                  <strong>Quy trình dịch vụ:</strong> Đặt cọc, tiến độ bàn giao nhà, tiến độ làm hợp đồng mua bán/cho thuê, thanh toán, hóa đơn VAT và chính sách hoàn tiền.
                </li>
                <li>
                  <strong>Quyền lợi giao dịch &amp; Pháp lý:</strong> Việc hỗ trợ sang tên, công chứng, giải quyết các tranh chấp phát sinh từ phía chủ nhà/chủ đầu tư với khách hàng.
                </li>
                <li>
                  <strong>Bảo mật thông tin:</strong> Việc bảo mật, thu thập và sử dụng dữ liệu cá nhân của khách hàng.
                </li>
                <li>
                  <strong>Thái độ &amp; Dịch vụ hỗ trợ:</strong> Thái độ phục vụ, tính trung thực và tiến độ hỗ trợ của đội ngũ chuyên viên tư vấn bất động sản.
                </li>
                <li>
                  <strong>Các vấn đề phát sinh khác:</strong> Các tranh chấp hoặc vướng mắc trong quá trình khách hàng hợp tác và sử dụng dịch vụ của Minh Dũng Land.
                </li>
              </ul>
            </div>
          </section>

          {/* MỤC II */}
          <section className="space-y-3 pt-6 border-t border-slate-100">
            <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-bold shrink-0">
                II
              </span>
              Kênh tiếp nhận khiếu nại
            </h2>
            <div className="pl-9 space-y-3">
              <p className="text-slate-600">
                Khách hàng có thể gửi khiếu nại hoặc phản ánh thông qua các kênh liên hệ chính thức của Minh Dũng Land:
              </p>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs sm:text-sm text-slate-700">
                  <thead className="bg-slate-50 text-slate-900 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3 sm:p-3.5">Kênh tiếp nhận</th>
                      <th className="p-3 sm:p-3.5">Thông tin liên hệ chính thức</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    <tr>
                      <td className="p-3 sm:p-3.5 font-medium text-slate-900">Đơn vị chủ quản</td>
                      <td className="p-3 sm:p-3.5 font-bold text-blue-900">CÔNG TY TNHH THƯƠNG MẠI DỊCH VỤ MINH DŨNG LAND</td>
                    </tr>
                    <tr>
                      <td className="p-3 sm:p-3.5 font-medium text-slate-900">Zalo OA</td>
                      <td className="p-3 sm:p-3.5">
                        <a
                          href="https://zalo.me/2926236115682535802"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline font-semibold"
                        >
                          https://zalo.me/2926236115682535802
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 sm:p-3.5 font-medium text-slate-900">Website chính thức</td>
                      <td className="p-3 sm:p-3.5 text-slate-800 font-semibold">www.minhdungland.com.vn</td>
                    </tr>
                    <tr>
                      <td className="p-3 sm:p-3.5 font-medium text-slate-900">Địa chỉ trụ sở</td>
                      <td className="p-3 sm:p-3.5 text-slate-700">125 Trần Cao Vân, Phường Quy Nhơn, Tỉnh Gia Lai</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="text-xs text-slate-500 italic">
                * Để đảm bảo thông tin được tiếp nhận và xử lý chính xác, Quý khách vui lòng liên hệ qua các kênh chính thức nêu trên. Minh Dũng Land không chịu trách nhiệm đối với các thông tin khiếu nại gửi qua những kênh không chính thức hoặc qua bên thứ ba không có thẩm quyền.
              </p>
            </div>
          </section>

          {/* MỤC III */}
          <section className="space-y-3 pt-6 border-t border-slate-100">
            <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-bold shrink-0">
                III
              </span>
              Thông tin cần cung cấp khi gửi khiếu nại
            </h2>
            <div className="pl-9 space-y-2 text-slate-600">
              <p>Để quá trình xác minh và xử lý diễn ra nhanh chóng, Quý khách hàng vui lòng cung cấp đầy đủ các thông tin sau:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                <li>
                  <strong>Thông tin người khiếu nại:</strong> Họ và tên, số điện thoại, email và địa chỉ liên hệ.
                </li>
                <li>
                  <strong>Thông tin giao dịch:</strong> Mã sản phẩm/căn hộ (VD: ALT01, PTR52...), số hợp đồng/phiếu cọc, tên dự án hoặc dịch vụ liên quan.
                </li>
                <li>
                  <strong>Nội dung khiếu nại:</strong> Trình bày chi tiết, rõ ràng và trung thực về sự cố hoặc vấn đề phát sinh.
                </li>
                <li>
                  <strong>Hồ sơ &amp; Tài liệu chứng cứ:</strong> Hình ảnh, video thực tế bất động sản, bản sao phiếu đặt cọc, hợp đồng, biên lai thanh toán hoặc nội dung tin nhắn/trao đổi giữa các bên.
                </li>
                <li>
                  <strong>Đề xuất xử lý:</strong> Phương án hoặc mong muốn của Quý khách về việc giải quyết vụ việc (đổi căn hộ khác, hoàn tiền cọc, đền bù hợp đồng...).
                </li>
              </ul>
            </div>
          </section>

          {/* MỤC IV */}
          <section className="space-y-4 pt-6 border-t border-slate-100">
            <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-bold shrink-0">
                IV
              </span>
              Quy trình tiếp nhận và xử lý khiếu nại
            </h2>

            <div className="pl-9 grid gap-3 sm:gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-xs font-bold">Bước 1</span>
                  Tiếp nhận &amp; Xác nhận thông tin
                </div>
                <p className="text-xs sm:text-sm text-slate-600 pl-0 sm:pl-12 leading-relaxed">
                  Sau khi nhận được khiếu nại, Bộ phận Chăm sóc Khách hàng của Minh Dũng Land sẽ tiếp nhận và gửi phản hồi xác nhận qua Zalo OA/Điện thoại/Email trong vòng <strong>24h làm việc</strong>. Chúng tôi sẽ cấp Mã tiếp nhận hồ sơ để Quý khách tiện theo dõi.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-xs font-bold">Bước 2</span>
                  Xác minh nội dung &amp; Kiểm tra thực tế
                </div>
                <p className="text-xs sm:text-sm text-slate-600 pl-0 sm:pl-12 leading-relaxed">
                  Minh Dũng Land tiến hành kiểm tra, đối chiếu thông tin với chủ nhà/chủ đầu tư, lịch sử giao dịch và các biên bản bàn giao. Khi cần thiết, tư vấn viên của chúng tôi sẽ liên hệ để thu thập thêm chứng cứ hoặc hẹn lịch làm việc trực tiếp tại văn phòng/bất động sản giao dịch.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-xs font-bold">Bước 3</span>
                  Phản hồi kết quả &amp; Đề xuất phương án xử lý
                </div>
                <div className="text-xs sm:text-sm text-slate-600 pl-0 sm:pl-12 leading-relaxed space-y-1.5">
                  <p>
                    Sau khi hoàn tất xác minh (<strong>không quá 05 ngày làm việc</strong> kể từ ngày tiếp nhận), Minh Dũng Land sẽ gửi văn bản/thông báo chính thức bao gồm:
                  </p>
                  <ul className="list-disc pl-5 space-y-0.5">
                    <li>Kết luận nguyên nhân vụ việc (do lỗi tư vấn, lỗi từ chủ nhà/chủ đầu tư, hay do thay đổi ý định cá nhân từ khách hàng).</li>
                    <li>Phương án khắc phục: Đổi sản phẩm bất động sản khác, hỗ trợ đàm phán lại điều khoản hợp đồng hoặc hoàn trả tiền cọc/chi phí dịch vụ.</li>
                    <li>Lộ trình và thời gian dự kiến hoàn thành xử lý.</li>
                  </ul>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-xs font-bold">Bước 4</span>
                  Thực hiện phương án &amp; Đóng hồ sơ khiếu nại
                </div>
                <p className="text-xs sm:text-sm text-slate-600 pl-0 sm:pl-12 leading-relaxed">
                  Sau khi hai bên thống nhất giải pháp, Minh Dũng Land sẽ triển khai xử lý dứt điểm. Khi hoàn tất, chúng tôi sẽ thông báo và tiến hành đóng hồ sơ. Trường hợp khách hàng không có phản hồi thêm sau <strong>07 ngày làm việc</strong> kể từ khi nhận kết quả xử lý, hồ sơ sẽ được tự động lưu kho.
                </p>
              </div>
            </div>
          </section>

          {/* MỤC V */}
          <section className="space-y-3 pt-6 border-t border-slate-100">
            <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-bold shrink-0">
                V
              </span>
              Hòa giải và giải quyết tranh chấp
            </h2>
            <div className="pl-9 space-y-2 text-slate-600">
              <p>
                Trong trường hợp phát sinh tranh chấp, Minh Dũng Land luôn ưu tiên giải quyết dựa trên tinh thần hợp tác, thiện chí và tôn trọng quyền lợi hợp pháp của cả hai bên.
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <strong>Thương lượng trực tiếp:</strong> Khách hàng và Đại diện Minh Dũng Land ưu tiên trao đổi, thương lượng trực tiếp để tìm ra giải pháp tối ưu nhất.
                </li>
                <li>
                  <strong>Hòa giải thông qua bên thứ ba:</strong> Nếu thương lượng trực tiếp không đạt kết quả, các bên có thể thống nhất lựa chọn một đơn vị/tổ chức hòa giải độc lập theo quy định pháp luật.
                </li>
                <li>
                  <strong>Giải quyết tại Tòa án có thẩm quyền:</strong> Trường hợp tranh chấp không thể giải quyết qua thương lượng/hòa giải, vụ việc sẽ được đưa ra giải quyết tại Tòa án nhân dân có thẩm quyền theo quy định của pháp luật Việt Nam.
                </li>
              </ul>
            </div>
          </section>

          {/* MỤC VI */}
          <section className="space-y-3 pt-6 border-t border-slate-100">
            <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-bold shrink-0">
                VI
              </span>
              Chi phí giải quyết khiếu nại
            </h2>
            <div className="pl-9 space-y-2 text-slate-600">
              <p>
                Quy trình tiếp nhận, kiểm tra và giải quyết khiếu nại thông thường tại Minh Dũng Land là <strong>hoàn toàn miễn phí</strong> đối với khách hàng.
              </p>
              <p>
                Trường hợp phát sinh các chi phí giám định độc lập ngoài phạm vi hỗ trợ thông thường hoặc chi phí tố tụng tại Tòa án, các khoản phí này sẽ được thực hiện theo thỏa thuận của các bên hoặc theo quyết định cuối cùng của cơ quan Nhà nước có thẩm quyền.
              </p>
            </div>
          </section>

          {/* MỤC VII */}
          <section className="space-y-3 pt-6 border-t border-slate-100">
            <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-bold shrink-0">
                VII
              </span>
              Bảo mật thông tin khiếu nại
            </h2>
            <div className="pl-9 space-y-2 text-slate-600">
              <p>
                Mọi thông tin cá nhân, hợp đồng, giao dịch và tài liệu do Quý khách cung cấp trong quá trình khiếu nại sẽ được Minh Dũng Land bảo mật tuyệt đối. Dữ liệu này chỉ được sử dụng nội bộ cho mục đích xác minh, xử lý sự cố và cải thiện chất lượng dịch vụ theo đúng Chính sách bảo mật của công ty và quy định pháp luật.
              </p>
            </div>
          </section>

          {/* MỤC VIII */}
          <section className="space-y-4 pt-6 border-t border-slate-100">
            <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-bold shrink-0">
                VIII
              </span>
              Thông tin liên hệ trực tiếp
            </h2>
            <p className="text-slate-600 pl-9">
              Mọi phản ánh, khiếu nại hoặc đóng góp ý kiến về dịch vụ, Quý khách vui lòng liên hệ:
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
