import { CONTACT_CONFIG } from "@/config/contact";

export default function LienHePage() {
  return (
    <div className="container-page py-12">
      <div className="mx-auto max-w-2xl card p-8 space-y-6">
        <h1 className="font-display text-3xl font-bold text-brand-900">Liên hệ Minh Dũng Land</h1>
        <p className="text-brand-700">
          Quý khách hàng có nhu cầu tư vấn mua bán, cho thuê bất động sản vui lòng liên hệ thông tin dưới đây:
        </p>

        <div className="space-y-3 rounded-lg bg-brand-50 p-5 border border-brand-200 text-sm text-brand-900">
          <div className="font-bold text-base text-brand-900">{CONTACT_CONFIG.companyName}</div>
          <div><strong>Mã số thuế:</strong> {CONTACT_CONFIG.taxId}</div>
          <div><strong>Địa chỉ:</strong> {CONTACT_CONFIG.address}</div>
          <div>
            <strong>Kênh Zalo doanh nghiệp:</strong>{" "}
            <a
              href={CONTACT_CONFIG.zaloOAUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-blue-600 hover:underline"
            >
              {CONTACT_CONFIG.zaloOAName} ↗
            </a>
          </div>
          <div>
            <strong>Website:</strong>{" "}
            <a href={CONTACT_CONFIG.websiteUrl} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">
              {CONTACT_CONFIG.website}
            </a>
          </div>
        </div>

        <div className="border-t border-sand-200 pt-6">
          <h2 className="font-display text-lg font-semibold text-brand-900 mb-2">Giờ làm việc</h2>
          <p className="text-sm text-brand-700">Từ Thứ 2 đến Chủ Nhật: 08:00 - 20:00 (Hỗ trợ qua Zalo OA 24/7)</p>
        </div>
      </div>
    </div>
  );
}
