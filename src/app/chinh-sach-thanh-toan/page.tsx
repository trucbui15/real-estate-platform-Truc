import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Thông tin về các phương thức thanh toán — Minh Dũng Land",
  description:
    "Quy định chi tiết về phương thức thanh toán, đơn vị tiền tệ, quy trình thanh toán, lưu ý đối soát và bảo mật giao dịch tại Minh Dũng Land.",
};

export default function ChinhSachThanhToanPage() {
  return (
    <div className="container-page py-12">
      <div className="mx-auto max-w-4xl card p-8 sm:p-10 space-y-8 text-slate-700 bg-white shadow-sm border border-slate-200/80 rounded-2xl">
        {/* Header */}
        <div className="border-b border-slate-100 pb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2">
            Chính sách giao dịch &amp; thanh toán
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
            Thông Tin Về Các Phương Thức Thanh Toán
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 font-medium">
            CÔNG TY TNHH THƯƠNG MẠI DỊCH VỤ MINH DŨNG LAND
          </p>
        </div>

        {/* Lời mở đầu */}
        <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-4 sm:p-5 text-sm sm:text-base text-slate-700 leading-relaxed space-y-2">
          <p>
            <strong>Công ty TNHH Thương mại Dịch vụ Minh Dũng Land</strong> cung cấp các phương thức thanh toán thuận tiện, an toàn và phù hợp với nhu cầu của Quý khách hàng. Mọi giao dịch thanh toán được thực hiện trên cơ sở thông tin do khách hàng cung cấp và được công ty kiểm tra, đối soát nghiêm ngặt nhằm đảm bảo tối đa quyền lợi của các bên.
          </p>
          <p className="text-xs sm:text-sm text-slate-500">
            Trong một số trường hợp, quá trình xác nhận thanh toán có thể cần thêm thời gian để hệ thống kiểm tra hoặc xác minh thông tin giao dịch.
          </p>
        </div>

        <div className="space-y-8 text-sm sm:text-base leading-relaxed">
          {/* MỤC I */}
          <section className="space-y-3">
            <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-bold shrink-0">
                I
              </span>
              Phương thức thanh toán
            </h2>
            <div className="pl-9 space-y-2 text-slate-600">
              <p>
                Hiện tại, <strong>Công ty TNHH Thương mại Dịch vụ Minh Dũng Land</strong> hỗ trợ khách hàng thanh toán chủ yếu bằng hình thức <strong>chuyển khoản ngân hàng</strong>.
              </p>
              <p>
                Thông tin tài khoản nhận thanh toán sẽ được cung cấp trực tiếp trên hợp đồng, phiếu đặt cọc, báo giá hoặc hiển thị trong quá trình đặt hàng và xác nhận giao dịch. Khách hàng vui lòng thực hiện thanh toán đúng số tiền và nội dung chuyển khoản theo hướng dẫn để quá trình xác nhận giao dịch được diễn ra nhanh chóng, chính xác.
              </p>
              <p>
                Tùy theo từng thời điểm, công ty có thể cập nhật hoặc bổ sung thêm các phương thức thanh toán mới nhằm nâng cao sự thuận tiện cho khách hàng.
              </p>
            </div>
          </section>

          {/* MỤC II */}
          <section className="space-y-3 pt-6 border-t border-slate-100">
            <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-bold shrink-0">
                II
              </span>
              Đơn vị tiền tệ và giá thanh toán
            </h2>
            <div className="pl-9 space-y-2 text-slate-600">
              <p>
                Tất cả mức giá bất động sản, căn hộ, nhà đất và dịch vụ do Minh Dũng Land cung cấp được niêm yết bằng <strong>Đồng Việt Nam (VNĐ)</strong>.
              </p>
              <p>
                Giá thanh toán được áp dụng theo thông tin hiển thị trên hệ thống hoặc được xác nhận chính thức với khách hàng tại thời điểm đặt cọc/ký kết hợp đồng.
              </p>
              <p>
                Các khoản thuế GTGT (VAT) và chi phí liên quan (phí chuyển nhượng, phí công chứng, phí dịch vụ...) nếu có, sẽ được thông báo rõ ràng theo quy định của pháp luật và tính chất từng loại giao dịch bất động sản.
              </p>
              <p>
                Công ty TNHH Thương mại Dịch vụ Minh Dũng Land cam kết cung cấp thông tin minh bạch, rõ ràng về giá bán, giá thuê và các khoản chi phí phát sinh trước khi khách hàng hoàn tất giao dịch.
              </p>
            </div>
          </section>

          {/* MỤC III */}
          <section className="space-y-4 pt-6 border-t border-slate-100">
            <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-bold shrink-0">
                III
              </span>
              Quy trình thanh toán tiêu chuẩn
            </h2>
            <p className="text-slate-600 pl-9">
              Quy trình thanh toán tại Công ty TNHH Thương mại Dịch vụ Minh Dũng Land được thực hiện theo 5 bước chuẩn hóa sau:
            </p>

            <div className="pl-9 grid gap-3 sm:gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-xs font-bold">Bước 1</span>
                  Lựa chọn bất động sản hoặc dịch vụ
                </div>
                <p className="text-xs sm:text-sm text-slate-600 pl-0 sm:pl-12 leading-relaxed">
                  Khách hàng lựa chọn bất động sản, căn hộ (như Altara Residences, Phú Tài Residence, Simona Heights...) hoặc dịch vụ phù hợp với nhu cầu và tiến hành đăng ký/yêu cầu tư vấn qua website hoặc các kênh liên hệ chính thức của công ty.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-xs font-bold">Bước 2</span>
                  Cung cấp thông tin đặt hàng
                </div>
                <p className="text-xs sm:text-sm text-slate-600 pl-0 sm:pl-12 leading-relaxed">
                  Khách hàng cung cấp các thông tin cần thiết như họ tên/tên đơn vị, số điện thoại, email, mã số thuế và các thông tin liên quan khác để Minh Dũng Land tiếp nhận và xử lý giao dịch. Khách hàng có trách nhiệm đảm bảo mọi thông tin cung cấp là chính xác và hợp lệ.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-xs font-bold">Bước 3</span>
                  Xác nhận đơn hàng &amp; Hướng dẫn thanh toán
                </div>
                <p className="text-xs sm:text-sm text-slate-600 pl-0 sm:pl-12 leading-relaxed">
                  Sau khi tiếp nhận thông tin, Minh Dũng Land sẽ xác nhận giao dịch/hợp đồng và gửi thông tin thanh toán cho khách hàng. Đơn hàng/hợp đồng sẽ được gán mã giao dịch hoặc nội dung chuyển khoản riêng để phục vụ quá trình đối soát.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-xs font-bold">Bước 4</span>
                  Thực hiện thanh toán
                </div>
                <p className="text-xs sm:text-sm text-slate-600 pl-0 sm:pl-12 leading-relaxed">
                  Khách hàng thực hiện chuyển khoản theo đúng thông tin tài khoản và hướng dẫn thanh toán do Minh Dũng Land cung cấp. Quý khách vui lòng kiểm tra kỹ số tài khoản, tên chủ tài khoản, số tiền và nội dung chuyển khoản trước khi xác nhận giao dịch.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-xs font-bold">Bước 5</span>
                  Xác nhận thanh toán &amp; Bàn giao
                </div>
                <p className="text-xs sm:text-sm text-slate-600 pl-0 sm:pl-12 leading-relaxed">
                  Sau khi nhận được khoản thanh toán, Minh Dũng Land sẽ tiến hành kiểm tra và đối soát giao dịch. Khi thanh toán được xác nhận thành công, công ty sẽ làm thủ tục bàn giao hợp đồng/bất động sản và thông báo đến khách hàng qua điện thoại, Zalo OA hoặc phương thức liên hệ đã thỏa thuận.
                </p>
              </div>
            </div>
          </section>

          {/* MỤC IV */}
          <section className="space-y-3 pt-6 border-t border-slate-100">
            <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-bold shrink-0">
                IV
              </span>
              Lưu ý quan trọng khi thực hiện chuyển khoản
            </h2>
            <div className="pl-9 space-y-2.5 text-slate-600">
              <p>Để giao dịch được xử lý nhanh chóng và thuận lợi, Quý khách hàng vui lòng lưu ý:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                <li>Thực hiện chuyển khoản đúng theo thông tin tài khoản do Công ty TNHH Thương mại Dịch vụ Minh Dũng Land cung cấp.</li>
                <li>Thanh toán đúng số tiền đã được thông báo hoặc xác nhận trong đơn hàng/hợp đồng.</li>
                <li>Ghi đúng nội dung chuyển khoản theo hướng dẫn (ví dụ: <em>[Mã sản phẩm/Mã hợp đồng] - [Số điện thoại/Tên khách hàng]</em>).</li>
                <li className="text-rose-600 font-semibold">Tuyệt đối không cung cấp thông tin tài khoản ngân hàng, mã PIN, mã xác thực OTP hoặc thông tin bảo mật cá nhân cho bất kỳ cá nhân, tổ chức nào không thuộc kênh liên hệ chính thức của Minh Dũng Land.</li>
                <li>Trong trường hợp chuyển sai số tiền, sai nội dung hoặc giao dịch chưa được ghi nhận trên hệ thống, khách hàng vui lòng lưu lại biên lai thanh toán (ảnh chụp màn hình giao dịch thành công) và liên hệ ngay với Minh Dũng Land để được hỗ trợ kiểm tra.</li>
                <li>Các giao dịch chuyển nhầm, chuyển trùng hoặc phát sinh sai lệch thông tin sẽ được xem xét và giải quyết dựa trên kết quả đối soát thực tế của từng trường hợp.</li>
              </ul>
            </div>
          </section>

          {/* MỤC V */}
          <section className="space-y-3 pt-6 border-t border-slate-100">
            <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-bold shrink-0">
                V
              </span>
              Thông tin tài khoản nhận thanh toán
            </h2>
            <div className="pl-9 space-y-2 text-slate-600">
              <p>
                Thông tin tài khoản ngân hàng nhận thanh toán sẽ được Công ty TNHH Thương mại Dịch vụ Minh Dũng Land cung cấp trực tiếp trong hợp đồng, phiếu đặt cọc, báo giá hoặc xác nhận đơn hàng chính thức.
              </p>
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm leading-relaxed">
                <strong>Khuyến cáo bảo mật:</strong> Khách hàng chỉ thực hiện thanh toán vào tài khoản chính thức do Minh Dũng Land chỉ định để tránh các trường hợp giả mạo hoặc rủi ro tài chính. Minh Dũng Land không bao giờ yêu cầu khách hàng cung cấp số thẻ ngân hàng, mã PIN, mã OTP hay mật khẩu giao dịch. Nếu nhận được yêu cầu bất thường, Quý khách vui lòng liên hệ ngay với công ty qua kênh chính thức để xác minh.
              </div>
            </div>
          </section>

          {/* MỤC VI */}
          <section className="space-y-3 pt-6 border-t border-slate-100">
            <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-bold shrink-0">
                VI
              </span>
              Xác nhận giao dịch và Hóa đơn (VAT)
            </h2>
            <div className="pl-9 space-y-2 text-slate-600">
              <p>
                Sau khi thanh toán thành công và giao dịch được xác nhận, khách hàng sẽ nhận được thông báo xác nhận giao dịch qua Zalo OA, email, điện thoại hoặc chứng từ kèm theo.
              </p>
              <p>
                Trường hợp khách hàng có nhu cầu xuất hóa đơn GTGT (VAT) hoặc các chứng từ kế toán liên quan đến phí dịch vụ, vui lòng thông báo cho Minh Dũng Land và cung cấp đầy đủ, chính xác thông tin xuất hóa đơn (<em>Tên công ty, Mã số thuế, Địa chỉ, Email nhận hóa đơn</em>) ngay tại thời điểm đặt hàng hoặc trong thời gian quy định sau khi hoàn tất thanh toán.
              </p>
              <p className="text-xs text-slate-500 italic">
                * Công ty có quyền từ chối điều chỉnh thông tin hoặc bổ sung chứng từ nếu khách hàng gửi thông tin quá muộn hoặc không đầy đủ theo quy định của pháp luật về thuế.
              </p>
            </div>
          </section>

          {/* MỤC VII */}
          <section className="space-y-3 pt-6 border-t border-slate-100">
            <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-bold shrink-0">
                VII
              </span>
              Bảo mật giao dịch
            </h2>
            <div className="pl-9 space-y-2 text-slate-600">
              <p>
                Công ty TNHH Thương mại Dịch vụ Minh Dũng Land luôn chú trọng bảo vệ thông tin giao dịch của khách hàng và áp dụng các biện pháp an ninh phù hợp nhằm hạn chế tối đa rủi ro trong quá trình thanh toán.
              </p>
              <p>
                Khách hàng có trách nhiệm tự bảo mật thông tin cá nhân, thông tin tài khoản ngân hàng và các mã xác thực giao dịch của mình. Minh Dũng Land không chịu trách nhiệm đối với những thiệt hại phát sinh do khách hàng tự nguyện hoặc vô tình cung cấp thông tin bảo mật cho bên thứ ba không được ủy quyền.
              </p>
            </div>
          </section>

          {/* MỤC VIII */}
          <section className="space-y-4 pt-6 border-t border-slate-100">
            <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-bold shrink-0">
                VIII
              </span>
              Liên hệ hỗ trợ thanh toán
            </h2>
            <p className="text-slate-600 pl-9">
              Nếu Quý khách gặp bất kỳ vấn đề nào liên quan đến thanh toán (giao dịch chưa được ghi nhận, chuyển sai số tiền, sai nội dung chuyển khoản, yêu cầu xuất hóa đơn GTGT...), vui lòng liên hệ trực tiếp với Minh Dũng Land để được hỗ trợ giải quyết nhanh chóng:
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
            <Link href="/chinh-sach-gia" className="hover:text-slate-900">
              Chính sách giá bán
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
