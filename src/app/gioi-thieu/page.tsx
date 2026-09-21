import Link from "next/link";
import { CONTACT_CONFIG } from "@/config/contact";

export default function GioiThieuPage() {
  return (
    <div className="container-page py-12">
      <div className="mx-auto max-w-3xl card p-8 space-y-6">
        <h1 className="font-display text-3xl font-bold text-brand-900">Giới thiệu Minh Dũng Land</h1>
        <p className="text-brand-700 leading-relaxed">
          <strong>{CONTACT_CONFIG.companyName}</strong> là đơn vị tư vấn, phân phối bất động sản hàng đầu tại thị trường Quy Nhơn và các khu vực lân cận.
        </p>

        <div className="space-y-3 text-sm text-brand-800">
          <h2 className="font-display text-xl font-semibold text-brand-900">Lĩnh vực hoạt động chính</h2>
          <ul className="list-disc pl-5 space-y-1 text-brand-700">
            <li>Tư vấn chuyển nhượng, mua bán căn hộ chung cư cao cấp tại Quy Nhơn.</li>
            {/* <li>Dịch vụ nhận ký gửi nhà đất, căn hộ chính chủ với giá chuẩn thị trường.</li> */}
            <li>Tư vấn cho thuê căn hộ đầy đủ nội thất hoặc bàn giao thô.</li>
            <li>Phân phối các dự án lớn: Altara Residences, The Sailing Quy Nhơn, Simona Heights, Ecolife Riverside, Phú Tài Residence, TMS Luxury, FLC Sea Tower...</li>
          </ul>
        </div>

        <div className="rounded-lg bg-sand-50 p-4 border border-sand-200 text-sm space-y-1">
          <div className="font-semibold text-brand-900">Thông tin doanh nghiệp</div>
          <div>Mã số thuế: {CONTACT_CONFIG.taxId}</div>
          <div>Nơi cấp: {CONTACT_CONFIG.taxIssuedBy}</div>
          <div>Địa chỉ: {CONTACT_CONFIG.address}</div>
          <div>
            Zalo OA:{" "}
            <a
              href={CONTACT_CONFIG.zaloOAUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-blue-600 hover:underline"
            >
              {CONTACT_CONFIG.zaloOAName} ↗
            </a>
          </div>
          <div>
            Website:{" "}
            <a href={CONTACT_CONFIG.websiteUrl} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">
              {CONTACT_CONFIG.website}
            </a>
          </div>
        </div>

        <div className="pt-4 flex gap-4">
          <Link href="/listings" className="btn-primary text-sm">Xem danh sách bất động sản</Link>
          {/* <Link href="/ky-gui" className="btn-secondary text-sm">Gửi ký gửi ngay</Link> */}
        </div>
      </div>
    </div>
  );
}
