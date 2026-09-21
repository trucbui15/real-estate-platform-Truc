import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Chính sách bảo mật thông tin — Minh Dũng Land",
  description:
    "Chính sách bảo vệ và bảo mật dữ liệu cá nhân theo Nghị định 13/2023/NĐ-CP tại Công ty TNHH Thương mại Dịch vụ Minh Dũng Land.",
};

export default function ChinhSachBaoMatPage() {
  return (
    <div className="container-page py-12">
      <div className="mx-auto max-w-4xl card p-8 sm:p-10 space-y-8 text-slate-700 bg-white shadow-sm border border-slate-200/80 rounded-2xl">
        {/* Header */}
        <div className="border-b border-slate-100 pb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2">
            Bảo mật &amp; Quyền riêng tư
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
            Chính Sách Bảo Mật Thông Tin
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 font-medium">
            CÔNG TY TNHH THƯƠNG MẠI DỊCH VỤ MINH DŨNG LAND
          </p>
        </div>

        {/* Lời mở đầu */}
        <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-4 sm:p-5 text-sm sm:text-base text-slate-700 leading-relaxed space-y-2">
          <p>
            Chào mừng Quý khách hàng đến với website chính thức của <strong>Công ty TNHH Thương mại Dịch vụ Minh Dũng Land</strong>.
          </p>
          <p>
            Chúng tôi hiểu rằng sự riêng tư và an toàn dữ liệu cá nhân của Quý khách là vô cùng quan trọng. Minh Dũng Land cam kết bảo vệ tuyệt đối các thông tin riêng tư do Quý khách cung cấp, tuân thủ nghiêm ngặt các quy định của pháp luật Việt Nam hiện hành về bảo vệ dữ liệu cá nhân (bao gồm <strong>Nghị định 13/2023/NĐ-CP</strong> của Chính phủ).
          </p>
          <p className="text-xs sm:text-sm text-slate-500">
            Quý khách vui lòng đọc kỹ các điều khoản trong &ldquo;Chính sách bảo mật thông tin cá nhân&rdquo; dưới đây để hiểu rõ các cam kết và quyền lợi của mình khi tương tác, đăng ký tư vấn hoặc sử dụng các dịch vụ bất động sản của chúng tôi.
          </p>
        </div>

        <div className="space-y-8 text-sm sm:text-base leading-relaxed">
          {/* MỤC 1 */}
          <section className="space-y-4">
            <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-bold shrink-0">
                1
              </span>
              Mục đích &amp; Phạm vi thu thập thông tin cá nhân
            </h2>

            {/* 1.1 */}
            <div className="pl-9 space-y-2">
              <h3 className="font-bold text-slate-800 text-base">1.1. Mục đích thu thập thông tin</h3>
              <p className="text-slate-600">Việc thu thập dữ liệu cá nhân giúp Minh Dũng Land:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                <li>
                  <strong>Cung cấp dịch vụ BĐS:</strong> Tiếp nhận nhu cầu, triển khai các dịch vụ tư vấn mua bán, cho thuê căn hộ, nhà đất, dự án bất động sản và hỗ trợ tìm kiếm sản phẩm phù hợp.
                </li>
                <li>
                  <strong>Tư vấn &amp; Báo giá:</strong> Gửi bảng hàng, bảng giá chi tiết, tài liệu dự án, pháp lý, chính sách bán hàng và giải đáp các thắc mắc của Quý khách.
                </li>
                <li>
                  <strong>Hỗ trợ &amp; Chăm sóc khách hàng:</strong> Lưu trữ lịch sử tương tác để phục vụ công tác làm thủ tục chuyển nhượng, hợp đồng đặt cọc/cho thuê, hỗ trợ pháp lý và chăm sóc sau giao dịch.
                </li>
                <li>
                  <strong>Nâng cao chất lượng dịch vụ:</strong> Tối ưu hóa giao diện website, nâng cấp trải nghiệm tìm kiếm bất động sản và cải tiến dịch vụ.
                </li>
                <li>
                  <strong>Truyền thông &amp; Ưu đãi:</strong> Gửi thông tin về các dự án mới, biến động thị trường hoặc các chương trình ưu đãi đặc biệt (nếu Quý khách đăng ký nhận thông tin).
                </li>
                <li>
                  <strong>An toàn &amp; An ninh:</strong> Ngăn chặn các hành vi giả mạo, gian lận thương mại hoặc xâm nhập trái phép hệ thống.
                </li>
              </ul>
            </div>

            {/* 1.2 */}
            <div className="pl-9 space-y-2 pt-3">
              <h3 className="font-bold text-slate-800 text-base">1.2. Phạm vi thu thập thông tin</h3>
              <p className="text-slate-600">Chúng tôi thu thập các nhóm thông tin sau khi Quý khách tương tác trên website:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                <li>
                  <strong>Thông tin do Quý khách chủ động cung cấp:</strong> Họ và tên, số điện thoại, địa chỉ email, nhu cầu bất động sản (mua/bán/cho thuê), khoảng tài chính, tiêu chí căn hộ/nhà đất và các yêu cầu tư vấn cụ thể.
                </li>
                <li>
                  <strong>Thông tin tự động thu thập từ hệ thống:</strong> Địa chỉ IP, loại trình duyệt (Browser), ngôn ngữ sử dụng, thiết bị truy cập, thời gian truy cập, các trang dự án/bất động sản Quý khách xem và các liên kết nhấp vào trên website.
                </li>
              </ul>
              <p className="text-xs text-slate-500 italic">
                (Quý khách có trách nhiệm đảm bảo tính chính xác và hợp pháp của các thông tin khai báo. Minh Dũng Land không chịu trách nhiệm liên quan đến pháp luật nếu thông tin do Quý khách cung cấp không chính xác).
              </p>
            </div>
          </section>

          {/* MỤC 2 */}
          <section className="space-y-3 pt-6 border-t border-slate-100">
            <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-bold shrink-0">
                2
              </span>
              Phạm vi sử dụng thông tin
            </h2>
            <div className="pl-9 space-y-2 text-slate-600">
              <p>
                Minh Dũng Land cam kết chỉ sử dụng thông tin cá nhân của Quý khách cho các mục đích hợp pháp và hoàn toàn tuân thủ nội dung của Chính sách bảo mật này:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <strong>Xử lý giao dịch:</strong> Xác nhận nhu cầu, hỗ trợ kết nối chủ nhà/chủ đầu tư với khách mua/khách thuê, hỗ trợ soạn thảo hợp đồng cọc, hợp đồng mua bán/cho thuê.
                </li>
                <li>
                  <strong>Hỗ trợ tư vấn:</strong> Bộ phận chuyên viên tư vấn bất động sản liên hệ khảo sát nhu cầu, dẫn đi xem thực tế căn hộ/nhà đất hoặc tư vấn thủ tục pháp lý.
                </li>
                <li>
                  <strong>Chăm sóc tài khoản &amp; Bảo hành dịch vụ:</strong> Theo dõi tiến độ giao dịch, hỗ trợ bàn giao nhà và cập nhật các dự án mới phù hợp với nhu cầu.
                </li>
                <li>
                  <strong>Tuân thủ quy định pháp luật:</strong> Cung cấp thông tin theo yêu cầu của các cơ quan quản lý Nhà nước có thẩm quyền khi có văn bản yêu cầu chính thức.
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
              Thời gian lưu trữ thông tin
            </h2>
            <div className="pl-9 space-y-2 text-slate-600">
              <p>
                <strong>Thời gian lưu trữ:</strong> Toàn bộ thông tin cá nhân của Quý khách sẽ được lưu trữ bảo mật trên hệ thống máy chủ của Minh Dũng Land trong suốt thời gian cần thiết để duy trì dịch vụ, phục vụ công tác tư vấn/hỗ trợ giao dịch hoặc cho đến khi mục đích thu thập đã hoàn thành.
              </p>
              <p>
                <strong>Xóa dữ liệu:</strong> Quý khách có quyền yêu cầu chúng tôi hủy bỏ hoặc xóa toàn bộ dữ liệu cá nhân của mình khỏi cơ sở dữ liệu hệ thống bất kỳ lúc nào.
              </p>
            </div>
          </section>

          {/* MỤC 4 */}
          <section className="space-y-3 pt-6 border-t border-slate-100">
            <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-bold shrink-0">
                4
              </span>
              Những bên có thể tiếp cận thông tin cá nhân
            </h2>
            <div className="pl-9 space-y-2 text-slate-600">
              <p>
                Minh Dũng Land cam kết tuyệt đối không bán, trao đổi hoặc chia sẻ thông tin cá nhân của khách hàng cho bất kỳ bên thứ ba nào vì mục đích thương mại.
              </p>
              <p>Thông tin của Quý khách chỉ có thể được chia sẻ trong các trường hợp giới hạn sau:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <strong>Nội bộ doanh nghiệp:</strong> Bộ phận kinh doanh, tư vấn viên, pháp lý và chăm sóc khách hàng thuộc Công ty TNHH Thương mại Dịch vụ Minh Dũng Land.
                </li>
                <li>
                  <strong>Đối tác cung ứng dịch vụ hỗ trợ:</strong> Các đơn vị tư vấn thủ tục công chứng, ngân hàng hỗ trợ vay vốn (chỉ khi có sự đồng ý của Quý khách) hoặc đơn vị hạ tầng lưu trữ theo phạm vi tối thiểu cần thiết.
                </li>
                <li>
                  <strong>Cơ quan chức năng:</strong> Khi có yêu cầu bằng văn bản từ các cơ quan công an, tòa án hoặc cơ quan quản lý nhà nước theo đúng quy định của pháp luật Việt Nam.
                </li>
              </ul>
            </div>
          </section>

          {/* MỤC 5 */}
          <section className="space-y-3 pt-6 border-t border-slate-100">
            <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-bold shrink-0">
                5
              </span>
              Cơ chế tiếp nhận và giải quyết khiếu nại về thông tin cá nhân
            </h2>
            <div className="pl-9 space-y-3 text-slate-600">
              <p>
                Trong trường hợp Quý khách phát hiện thông tin cá nhân của mình bị sử dụng sai mục đích, sai phạm vi đã thông báo hoặc nghi ngờ bị rò rỉ, Quý khách vui lòng gửi khiếu nại trực tiếp về cho chúng tôi theo các kênh sau:
              </p>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs sm:text-sm">
                <div className="font-bold text-slate-900 uppercase">
                  CÔNG TY TNHH THƯƠNG MẠI DỊCH VỤ MINH DŨNG LAND
                </div>
                <div><strong>Địa chỉ:</strong> 125 Trần Cao Vân, Phường Quy Nhơn, Tỉnh Gia Lai</div>
                <div>
                  <strong>Zalo OA:</strong>{" "}
                  <a
                    href="https://zalo.me/2926236115682535802"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline font-semibold"
                  >
                    https://zalo.me/2926236115682535802
                  </a>
                </div>
                <div><strong>Website:</strong> www.minhdungland.com.vn</div>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-800 text-sm">Quy trình xử lý khiếu nại:</h4>
                <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
                  <li>
                    Trong vòng <strong>24 – 48 giờ làm việc</strong> kể từ khi nhận được thông báo khiếu nại, bộ phận xử lý thông tin của Minh Dũng Land sẽ chủ động liên hệ lại với Quý khách để xác minh vụ việc.
                  </li>
                  <li>
                    Chúng tôi sẽ phối hợp với các bên liên quan (kỹ thuật hệ thống, chuyên gia an ninh mạng...) để kiểm tra, khắc phục sự cố và đưa ra biện pháp xử lý thỏa đáng.
                  </li>
                  <li>
                    Trong trường hợp xảy ra sự cố tấn công mạng bất khả kháng làm mất mát dữ liệu, Minh Dũng Land có trách nhiệm thông báo vụ việc cho cơ quan chức năng điều tra xử lý kịp thời, đồng thời gửi thông báo chính thức đến Quý khách.
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* MỤC 6 */}
          <section className="space-y-3 pt-6 border-t border-slate-100">
            <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-bold shrink-0">
                6
              </span>
              Cam kết bảo mật thông tin
            </h2>
            <div className="pl-9 space-y-2 text-slate-600">
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <strong>Mã hóa &amp; Công nghệ an ninh:</strong> Website và các nền tảng của Minh Dũng Land sử dụng chứng chỉ bảo mật SSL (HTTPS) tiêu chuẩn để mã hóa toàn bộ dữ liệu truyền tải giữa trình duyệt của Quý khách và máy chủ.
                </li>
                <li>
                  <strong>Quản lý truy cập nghiêm ngặt:</strong> Chỉ những nhân viên được phân công nhiệm vụ tư vấn/xử lý giao dịch mới được cấp quyền truy cập vào dữ liệu khách hàng.
                </li>
                <li>
                  <strong>Hệ thống phòng vệ:</strong> Máy chủ lưu trữ được bảo vệ bởi hệ thống tường lửa (Firewall) đa lớp, các giải pháp phòng chống mã độc tiên tiến nhằm ngăn chặn mọi hành vi tấn công, đánh cắp dữ liệu.
                </li>
              </ul>
            </div>
          </section>

          {/* MỤC 7 */}
          <section className="space-y-3 pt-6 border-t border-slate-100">
            <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-bold shrink-0">
                7
              </span>
              Quyền của khách hàng đối với dữ liệu cá nhân
            </h2>
            <div className="pl-9 space-y-2 text-slate-600">
              <p>Quý khách có toàn quyền đối với dữ liệu cá nhân của mình, bao gồm:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <strong>Quyền kiểm tra &amp; Cập nhật:</strong> Quý khách có thể yêu cầu chúng tôi kiểm tra, cập nhật hoặc sửa đổi thông tin cá nhân bất kỳ lúc nào bằng cách liên hệ qua Zalo OA hoặc Hotline của công ty.
                </li>
                <li>
                  <strong>Quyền từ chối nhận tin:</strong> Quý khách có quyền yêu cầu ngưng nhận các thông tin tư vấn, bản tin thị trường bất động sản bất kỳ lúc nào bằng cách thông báo trực tiếp cho tư vấn viên hoặc qua kênh Zalo OA.
                </li>
                <li>
                  <strong>Quyền yêu cầu xóa dữ liệu:</strong> Quý khách có quyền gửi yêu cầu bắt buộc xóa hoàn toàn dữ liệu cá nhân khỏi hệ thống của Minh Dũng Land (trừ các dữ liệu nghĩa vụ pháp lý/kế toán bắt buộc phải lưu trữ theo quy định pháp luật).
                </li>
              </ul>
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
            <Link href="/chinh-sach-thanh-toan" className="hover:text-slate-900">
              Chính sách thanh toán
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
