import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Chính sách vận chuyển và giao nhận — Minh Dũng Land",
  description:
    "Quy định về thời gian xử lý, chứng từ bàn giao, phương thức giao nhận hồ sơ bất động sản và chính sách đổi trả, hoàn tiền tại Minh Dũng Land.",
};

export default function ChinhSachGiaoNhanPage() {
  return (
    <div className="container-page py-12">
      <div className="mx-auto max-w-4xl card p-8 sm:p-10 space-y-8 text-slate-700 bg-white shadow-sm border border-slate-200/80 rounded-2xl">
        {/* Header */}
        <div className="border-b border-slate-100 pb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2">
            Vận hành &amp; Bàn giao
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
            Chính Sách Vận Chuyển Và Giao Nhận Hàng Hóa
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 font-medium">
            CÔNG TY TNHH THƯƠNG MẠI DỊCH VỤ MINH DŨNG LAND
          </p>
        </div>

        <div className="space-y-8 text-sm sm:text-base leading-relaxed">
          {/* PHẦN I */}
          <div className="space-y-6">
            <div className="inline-block px-3.5 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs uppercase tracking-wider">
              Phần I: Chính sách bàn giao &amp; Tiếp nhận dịch vụ
            </div>

            {/* Mục 1 */}
            <section className="space-y-3 pl-2">
              <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-800 text-xs font-bold shrink-0">
                  1
                </span>
                Thời gian tiếp nhận &amp; Xử lý yêu cầu
              </h2>
              <div className="pl-9 space-y-2 text-slate-600">
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>
                    <strong>Tiếp nhận yêu cầu qua Website/Zalo OA:</strong> Hoạt động <strong>24/7</strong> (Tất cả các ngày trong tuần).
                  </li>
                  <li>
                    <strong>Thời gian xử lý &amp; Hỗ trợ giao dịch:</strong> Từ <strong>08h00 đến 17h30</strong> (Từ Thứ 2 đến Thứ 6; Thứ 7 làm việc buổi sáng).
                  </li>
                  <li>
                    <strong>Đơn hàng / Yêu cầu phát sinh sau 17h30:</strong> Sẽ được ưu tiên xử lý và liên hệ lại vào đầu giờ làm việc tiếp theo.
                  </li>
                </ul>
              </div>
            </section>

            {/* Mục 2 */}
            <section className="space-y-3 pl-2 pt-4 border-t border-slate-100">
              <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-800 text-xs font-bold shrink-0">
                  2
                </span>
                Quy định về chứng từ đi kèm &amp; Kiểm tra bất động sản / Hồ sơ
              </h2>
              <div className="pl-9 space-y-3 text-slate-600">
                <p>
                  Tất cả các giao dịch mua bán, cho thuê bất động sản hoặc tư vấn dịch vụ do Minh Dũng Land hỗ trợ đều đi kèm đầy đủ bộ chứng từ hợp lệ bao gồm:
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/60 text-xs sm:text-sm">
                    ✓ Biên bản giao nhận cọc / Phiếu thu đặt cọc
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/60 text-xs sm:text-sm">
                    ✓ Hợp đồng đặt cọc / Hợp đồng mua bán / Hợp đồng thuê
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/60 text-xs sm:text-sm">
                    ✓ Biên bản bàn giao thực tế căn hộ / nhà đất
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/60 text-xs sm:text-sm">
                    ✓ Hóa đơn giá trị gia tăng (VAT) phí dịch vụ (nếu có)
                  </div>
                </div>

                <div className="pt-2 space-y-2">
                  <h3 className="font-bold text-slate-800">Quy định đồng kiểm &amp; Nghiệm thu bất động sản:</h3>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li>
                      <strong>Kiểm tra trực tiếp:</strong> Khách hàng bắt buộc kiểm tra thực tế hiện trạng căn hộ/nhà đất, đối chiếu danh mục nội thất, trang thiết bị đi kèm và thông số diện tích với Biên bản bàn giao trước khi ký nhận.
                    </li>
                    <li>
                      <strong>Đối với hợp đồng / giấy tờ:</strong> Kiểm tra chính xác thông tin chủ sở hữu, pháp lý tài sản, giá trị giao dịch và các điều khoản thanh toán theo đúng thỏa thuận.
                    </li>
                    <li>
                      <strong>Ủy quyền nhận bàn giao:</strong> Trường hợp nhờ người khác kiểm tra hoặc nhận bàn giao hộ, người được ủy quyền cần thực hiện kiểm tra cẩn thận tương tự.
                    </li>
                    <li className="text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200/60">
                      <strong>Trách nhiệm xử lý:</strong> Minh Dũng Land chỉ chịu trách nhiệm hỗ trợ giải quyết các sai lệch hiện trạng, thiếu hụt nội thất hoặc sự cố pháp lý khi có Biên bản xác nhận sự cố tại thời điểm đồng kiểm/bàn giao thực tế.
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Mục 3 */}
            <section className="space-y-3 pl-2 pt-4 border-t border-slate-100">
              <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-800 text-xs font-bold shrink-0">
                  3
                </span>
                Phương thức bàn giao &amp; Gửi hồ sơ
              </h2>
              <div className="pl-9 space-y-3 text-slate-600">
                <div className="space-y-2">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <div className="font-bold text-slate-900">🏢 Bàn giao trực tiếp tại Văn phòng Minh Dũng Land:</div>
                    <p className="text-xs sm:text-sm">
                      Quý khách có thể đến trực tiếp văn phòng để ký kết hợp đồng, nhận giấy tờ pháp lý và phiếu thu trong khung giờ làm việc:
                    </p>
                    <p className="text-xs sm:text-sm font-semibold text-blue-800">
                      Địa chỉ: 125 Trần Cao Vân, Phường Quy Nhơn, Tỉnh Gia Lai.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <div className="font-bold text-slate-900">🚗 Bàn giao &amp; Hỗ trợ tận nơi:</div>
                    <p className="text-xs sm:text-sm">
                      Đội ngũ chuyên viên của Minh Dũng Land hỗ trợ giao nhận hợp đồng, tài liệu pháp lý và dẫn đi nghiệm thu thực tế tận nơi tại các căn hộ/dự án (Altara Residences, Phú Tài Residence, Simona Heights, The Sailing Quy Nhơn...).
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <div className="font-bold text-slate-900">🌐 Bàn giao trực tuyến:</div>
                    <p className="text-xs sm:text-sm">
                      Khởi tạo và gửi tài liệu dự án, hợp đồng mẫu, chứng từ đặt cọc qua Email chính thức hoặc Zalo OA của khách hàng.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Mục 4 */}
            <section className="space-y-3 pl-2 pt-4 border-t border-slate-100">
              <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-800 text-xs font-bold shrink-0">
                  4
                </span>
                Các trường hợp trì hoãn thời gian bàn giao
              </h2>
              <div className="pl-9 space-y-2 text-slate-600">
                <p>
                  Trong một số tình huống khách quan, thời gian bàn giao nhà/hồ sơ có thể bị chậm trễ so với dự kiến. Minh Dũng Land rất mong Quý khách thông cảm đối với các trường hợp:
                </p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>Thông tin địa chỉ, email hoặc số điện thoại người đại diện nhận giao dịch không chính xác.</li>
                  <li>Khách hàng hoặc phía chủ nhà/chủ đầu tư không nghe máy hoặc hẹn lùi lịch bàn giao nhiều lần.</li>
                  <li>Sự cố kỹ thuật trong quá trình xử lý thủ tục công chứng, cấp sổ hoặc xác minh pháp lý tài sản từ cơ quan chức năng.</li>
                  <li>Lý do bất khả kháng: Thiên tai, dịch bệnh, sự cố giao thông nghiêm trọng hoặc thay đổi quy định pháp lý bất động sản.</li>
                </ul>
                <p className="text-xs text-slate-500 italic pt-1">
                  (Bộ phận Chăm sóc khách hàng của Minh Dũng Land sẽ chủ động liên hệ trước để thông báo và thỏa thuận lại thời gian thuận tiện nhất cho Quý khách).
                </p>
              </div>
            </section>
          </div>

          {/* PHẦN II */}
          <div className="space-y-6 pt-6 border-t-2 border-slate-200">
            <div className="inline-block px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider">
              Phần II: Chính sách đổi trả &amp; Hoàn tiền dịch vụ
            </div>

            <p className="text-slate-600 pl-2">
              <strong>Công ty TNHH Thương mại Dịch vụ Minh Dũng Land</strong> cam kết cung cấp thông tin bất động sản xác thực, minh bạch và bảo vệ tối đa quyền lợi tài chính của khách hàng.
            </p>

            {/* Mục 1 */}
            <section className="space-y-3 pl-2">
              <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold shrink-0">
                  1
                </span>
                Thời gian &amp; Điều kiện áp dụng hoàn tiền / Đổi sản phẩm
              </h2>
              <div className="pl-9 space-y-2 text-slate-600">
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-semibold">
                  ⏱️ Thời gian tiếp nhận khiếu nại: Trong vòng 03 ngày (72 giờ) kể từ thời điểm phát sinh giao dịch đặt cọc hoặc ký kết hợp đồng dịch vụ.
                </div>

                <div className="space-y-1.5 pt-2">
                  <h3 className="font-bold text-slate-800">Điều kiện áp dụng:</h3>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li>
                      <strong>Thông tin bất động sản không đúng thực tế:</strong> Căn hộ/nhà đất có sai lệch nghiêm trọng về diện tích, vị trí, pháp lý hoặc cam kết nội thất so với thông tin Minh Dũng Land cung cấp.
                    </li>
                    <li>
                      <strong>Hủy giao dịch do lỗi pháp lý:</strong> Bất động sản phát sinh tranh chấp hoặc không đủ điều kiện mua bán/cho thuê theo quy định pháp luật mà không được thông báo trước.
                    </li>
                    <li>
                      <strong>Giao dịch không thành công do lỗi từ bên bán/chủ nhà:</strong> Chủ nhà từ chối bán/cho thuê sau khi đã nhận cọc theo đúng điều khoản cam kết.
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Mục 2 */}
            <section className="space-y-3 pl-2 pt-4 border-t border-slate-100">
              <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold shrink-0">
                  2
                </span>
                Quy trình xử lý &amp; Hoàn tiền
              </h2>
              <div className="pl-9 grid gap-3">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-xs font-bold shrink-0">Bước 1</span>
                  <div>
                    <strong className="text-slate-900">Tiếp nhận thông tin:</strong>{" "}
                    <span className="text-slate-600">
                      Quý khách liên hệ qua Zalo OA:{" "}
                      <a href="https://zalo.me/2926236115682535802" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-semibold">
                        https://zalo.me/2926236115682535802
                      </a>
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-xs font-bold shrink-0">Bước 2</span>
                  <div>
                    <strong className="text-slate-900">Cung cấp chứng từ:</strong>{" "}
                    <span className="text-slate-600">Gửi hợp đồng/phiếu cọc, hình ảnh, video hoặc chứng từ minh chứng sai lệch thông tin bất động sản.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-xs font-bold shrink-0">Bước 3</span>
                  <div>
                    <strong className="text-slate-900">Kiểm định thông tin:</strong>{" "}
                    <span className="text-slate-600">Chuyên viên pháp lý của Minh Dũng Land sẽ xác minh lại với các bên liên quan (chủ nhà, chủ đầu tư, phòng công chứng).</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-xs font-bold shrink-0">Bước 4</span>
                  <div>
                    <strong className="text-slate-900">Xử lý hoàn tiền:</strong>{" "}
                    <span className="text-slate-600">
                      Trong vòng <strong>03 - 05 ngày làm việc</strong>, Minh Dũng Land sẽ hỗ trợ đổi sang sản phẩm bất động sản khác phù hợp hoặc hoàn trả tiền cọc/phí dịch vụ theo đúng cam kết hợp đồng.
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Mục 3 */}
            <section className="space-y-3 pl-2 pt-4 border-t border-slate-100">
              <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold shrink-0">
                  3
                </span>
                Chi phí &amp; Phương thức hoàn tiền
              </h2>
              <div className="pl-9 space-y-2 text-slate-600">
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong>Lỗi từ Minh Dũng Land hoặc Chủ tài sản:</strong> Khách hàng được nhận lại <strong>100% tiền đặt cọc/chi phí dịch vụ</strong> mà không phát sinh thêm bất kỳ khoản phí nào.
                  </li>
                  <li>
                    <strong>Đổi/Hủy theo nhu cầu cá nhân của Khách hàng:</strong> Xử lý theo đúng các điều khoản phạt cọc hoặc phí dịch vụ đã thỏa thuận cụ thể trên Hợp đồng/Phiếu đặt cọc.
                  </li>
                  <li>
                    <strong>Phương thức hoàn tiền:</strong> Chuyển khoản trực tiếp vào tài khoản ngân hàng của Khách hàng/Doanh nghiệp trong vòng <strong>24h – 48h làm việc</strong> sau khi xác nhận xong thủ tục.
                  </li>
                </ul>
              </div>
            </section>
          </div>

          {/* LIÊN HỆ */}
          <section className="space-y-4 pt-6 border-t border-slate-100">
            <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-bold shrink-0">
                ★
              </span>
              Thông tin liên hệ &amp; Hỗ trợ dịch vụ
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
            <Link href="/chinh-sach-mua-hang" className="hover:text-slate-900">
              Quy trình mua hàng
            </Link>
            <span>·</span>
            <Link href="/tiep-nhan-khieu-nai" className="hover:text-slate-900">
              Tiếp nhận khiếu nại
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
