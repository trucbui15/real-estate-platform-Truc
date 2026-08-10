import { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseImages } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Tổng thông tin Dự án | Minh Dũng Land",
  description: "Tổng hợp danh mục các dự án bất động sản, tài liệu bán hàng, pháp lý, bảng hàng và thông tin quy hoạch.",
};

export default async function TongThongTinDuAnIndexPage() {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;
  const isInternalUser = userRole === "STAFF" || userRole === "MANAGER" || userRole === "ADMIN";

  // Lấy toàn bộ danh sách dự án
  const projects = await prisma.project.findMany({
    where: { isActive: true },
    include: {
      province: true,
      district: true,
      resources: {
        where: isInternalUser
          ? { isActive: true }
          : { isActive: true, isPublic: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
      listings: {
        where: { unitStatus: "DANG_BAN" },
        select: { id: true },
      },
    },
    orderBy: [{ featured: "desc" }, { name: "asc" }],
  });

  return (
    <div className="container-page py-10 space-y-8">
      {/* Header trang */}
      <div className="max-w-3xl space-y-2 border-b border-gray-100 pb-6">
        <div className="flex items-center gap-2 text-xs font-bold text-primary-600">
          <Link href="/tai-lieu-du-an" className="hover:underline">
            Tài liệu dự án
          </Link>
          <span>/</span>
          <span>Danh mục Tổng thông tin</span>
        </div>
        <h1 className="font-display text-3xl font-extrabold text-dark tracking-tight">
          Tổng thông tin Các Dự án
        </h1>
        <p className="text-xs text-muted leading-relaxed">
          Tra cứu trang thông tin chi tiết, quy mô phát triển, bộ tài liệu bán hàng (Sales Kit) và liên kết tài liệu trực tiếp theo từng dự án.
        </p>
        {isInternalUser && (
          <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700 border border-purple-200 mt-1">
            <span>🔒 CHẾ ĐỘ NỘI BỘ ({userRole}): Cho phép truy cập tài liệu Sales Kit khóa nội bộ</span>
          </div>
        )}
      </div>

      {/* Danh sách thẻ Card dự án dẫn sang trang Native Detail */}
      <div className="space-y-6">
        {projects.length === 0 ? (
          <div className="card-glass p-12 text-center text-sm text-gray-400">
            Chưa có dự án nào trong hệ thống.
          </div>
        ) : (
          projects.map((project) => {
            const images = parseImages(project.images);
            const imageCover = project.thumbnail || images[0] || null;
            const validResources = project.resources.filter(
              (res) => res.url && res.url.trim() !== ""
            );
            const nativeRoute = `/tai-lieu-du-an/tong-thong-tin/${project.slug}`;

            return (
              <div
                key={project.id}
                className="card-glass p-6 md:p-8 rounded-3xl border border-gray-100 shadow-glass space-y-5 transition-all hover:shadow-lg"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Ảnh đại diện dự án */}
                  <Link
                    href={nativeRoute}
                    className="relative aspect-[16/10] w-full md:w-72 shrink-0 overflow-hidden rounded-2xl bg-slate-900 border border-gray-100 group"
                  >
                    {imageCover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imageCover}
                        alt={project.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-slate-900 text-white text-xs font-bold p-4 text-center">
                        🏢 {project.name}
                      </div>
                    )}
                    {project.featured && (
                      <span className="absolute left-3 top-3 rounded-full bg-amber-400 px-3 py-0.5 text-[10px] font-extrabold text-slate-950 uppercase shadow">
                        ★ NỔI BẬT
                      </span>
                    )}
                  </Link>

                  {/* Nội dung thông tin dự án */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <Link
                          href={nativeRoute}
                          className="font-display text-xl font-extrabold text-dark hover:text-primary-600 transition"
                        >
                          {project.name}
                        </Link>
                        {project.listings.length > 0 && (
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                            {project.listings.length} căn đang rao
                          </span>
                        )}
                      </div>

                      {project.address && (
                        <div className="mt-1 text-xs text-gray-500 font-semibold flex items-center gap-1">
                          <span>📍</span>
                          <span>{project.address}</span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50/80 p-4 rounded-2xl border border-gray-100">
                      <div>
                        <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                          Chủ đầu tư:
                        </span>
                        <div className="font-bold text-dark mt-0.5">
                          {project.developer || "Minh Dũng Land"}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                          Khu vực:
                        </span>
                        <div className="font-bold text-dark mt-0.5">
                          {[project.district?.name, project.province?.name]
                            .filter(Boolean)
                            .join(", ") || "Quy Nhơn"}
                        </div>
                      </div>
                    </div>

                    {project.description && (
                      <p className="text-xs text-gray-600 leading-relaxed font-medium line-clamp-2">
                        {project.description}
                      </p>
                    )}

                    {/* NÚT TRUY CẬP TRANG NATIVE DETAIL VÀ RESOURCE SUMMARY */}
                    <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {validResources.slice(0, 4).map((res) => (
                          <a
                            key={res.id}
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-2.5 py-1 text-[11px] font-bold text-gray-700 hover:bg-primary-600 hover:text-white transition"
                          >
                            <span>🔗 {res.title}</span>
                            <span className="text-[9px]">↗</span>
                          </a>
                        ))}
                        {validResources.length > 4 && (
                          <span className="text-[11px] font-bold text-gray-400">
                            +{validResources.length - 4} tài liệu
                          </span>
                        )}
                      </div>

                      <Link
                        href={nativeRoute}
                        className="btn-primary !px-5 !py-2 text-xs shadow-md shadow-primary-500/20 shrink-0"
                      >
                        Xem chi tiết trang Native ➔
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
