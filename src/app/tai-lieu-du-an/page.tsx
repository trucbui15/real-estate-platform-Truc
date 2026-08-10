import { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tài liệu dự án | Minh Dũng Land",
  description: "Tổng hợp website các dự án, tổng thông tin quy hoạch và liên kết thực tế ảo 360° các dự án bất động sản.",
};

export default async function TaiLieuDuAnPage() {
  const [websiteCount, infoCount, tour360Count] = await Promise.all([
    prisma.projectResource.count({ where: { type: "WEBSITE", isActive: true, isPublic: true } }),
    prisma.project.count({ where: { isActive: true } }),
    prisma.projectResource.count({ where: { type: "TOUR_360", isActive: true, isPublic: true } }),
  ]);

  const sections = [
    {
      title: "Website các Dự án",
      slug: "website",
      href: "/tai-lieu-du-an/website",
      icon: "🌐",
      description: "Danh sách website và trang thông tin chính thức của các dự án bất động sản.",
      badge: `${websiteCount} trang website`,
      color: "bg-blue-50 text-blue-800 border-blue-200",
    },
    {
      title: "Tổng thông tin Dự án",
      slug: "tong-thong-tin",
      href: "/tai-lieu-du-an/tong-thong-tin",
      icon: "📑",
      description: "Tổng hợp thông tin cơ bản, vị trí, tình trạng, bảng giá và nội dung tổng quan từng dự án.",
      badge: `${infoCount} dự án`,
      color: "bg-amber-50 text-amber-800 border-amber-200",
    },
    {
      title: "Link 360° các Dự án",
      slug: "360",
      href: "/tai-lieu-du-an/360",
      icon: "🔄",
      description: "Trải nghiệm không gian thực tế ảo 360° toàn cảnh thành phố và thiết kế căn hộ mẫu các dự án.",
      badge: `${tour360Count} tour 360°`,
      color: "bg-emerald-50 text-emerald-800 border-emerald-200",
    },
  ];

  return (
    <div className="container-page py-12 space-y-8">
      <div className="max-w-3xl space-y-2 border-b pb-6">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-3.5 py-1 text-xs font-bold text-primary-700">
          📁 KHO TÀI LIỆU DỰ ÁN
        </span>
        <h1 className="font-display text-3xl font-extrabold text-dark">
          Tài liệu & Truyền thông Dự án
        </h1>
        <p className="text-xs text-muted leading-relaxed">
          Tra cứu nhanh website chính thức, tổng thông tin quy hoạch và không gian thực tế ảo 360° các dự án bất động sản tại Quy Nhơn và khu vực phụ cận.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {sections.map((sec) => (
          <Link
            key={sec.slug}
            href={sec.href}
            className="group flex flex-col justify-between rounded-3xl border border-gray-100 bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-4xl p-3 bg-surface rounded-2xl border border-gray-100">{sec.icon}</span>
                <span className={`rounded-full px-3 py-1 text-xs font-bold border ${sec.color}`}>
                  {sec.badge}
                </span>
              </div>
              <h2 className="font-display text-xl font-extrabold text-dark group-hover:text-primary-600 transition">
                {sec.title}
              </h2>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">
                {sec.description}
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-primary-600">
              <span>Khám phá ngay</span>
              <span className="group-hover:translate-x-1 transition-transform">➔</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
