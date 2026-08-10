import { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Driver thông tin các Dự án | Minh Dũng Land",
  description: "Tổng hợp kho thư mục Driver thông tin, pháp lý, bảng hàng và bộ tài liệu kinh doanh các dự án.",
};

export default async function DriverTTPage() {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;
  const isInternalUser = userRole === "STAFF" || userRole === "MANAGER" || userRole === "ADMIN";

  const projects = await prisma.project.findMany({
    where: { isActive: true },
    include: {
      resources: {
        where: isInternalUser
          ? { isActive: true }
          : { isActive: true, isPublic: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
    },
    orderBy: [{ featured: "desc" }, { name: "asc" }],
  });

  return (
    <div className="container-page py-10 space-y-8">
      <div className="max-w-3xl space-y-2 border-b border-gray-100 pb-6">
        <div className="flex items-center gap-2 text-xs font-bold text-primary-600">
          <Link href="/tai-lieu-du-an" className="hover:underline">
            Tài liệu dự án
          </Link>
          <span>/</span>
          <span>Driver TT Các Dự Án</span>
        </div>
        <h1 className="font-display text-3xl font-extrabold text-dark tracking-tight">
          Driver Thông Tin Các Dự Án
        </h1>
        <p className="text-xs text-muted leading-relaxed">
          Kho lưu trữ thư mục tài liệu bán hàng (Sales Kit), bảng hàng, sơ đồ mặt bằng và tài liệu pháp lý cho từng dự án.
        </p>
      </div>

      <div className="space-y-6">
        {projects.map((project) => {
          const validResources = project.resources.filter(
            (res) => res.url && res.url.trim() !== ""
          );

          return (
            <div
              key={project.id}
              className="card-glass p-6 md:p-8 rounded-3xl border border-gray-100 shadow-glass space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-3 gap-2">
                <div>
                  <h2 className="font-display text-xl font-extrabold text-dark">
                    🏢 {project.name}
                  </h2>
                  {project.developer && (
                    <div className="text-xs text-gray-500 font-semibold mt-0.5">
                      Chủ đầu tư: {project.developer}
                    </div>
                  )}
                </div>
                <Link
                  href={`/listings?project=${project.slug}`}
                  className="text-xs font-bold text-primary-600 hover:underline"
                >
                  Xem bất động sản thuộc dự án →
                </Link>
              </div>

              {/* Danh mục tài liệu Driver TT */}
              <div className="pt-2">
                {validResources.length > 0 ? (
                  <div className="flex flex-wrap gap-2.5">
                    {validResources.map((res) => {
                      let icon = "📁";
                      if (res.type === "PRICE_LIST") icon = "📊";
                      else if (res.type === "LEGAL") icon = "⚖️";
                      else if (res.type === "FLOOR_PLAN") icon = "📐";
                      else if (res.type === "SALES_POLICY") icon = "📋";
                      else if (res.type === "BROCHURE") icon = "📘";
                      else if (res.type === "VIDEO") icon = "🎬";
                      else if (res.type === "WEBSITE") icon = "🌐";
                      else if (res.type === "TOUR_360") icon = "🔄";

                      return (
                        <a
                          key={res.id}
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-gray-800 border border-gray-200 shadow-sm hover:bg-primary-600 hover:text-white hover:border-primary-600 transition"
                        >
                          <span>{icon}</span>
                          <span>{res.title}</span>
                          {!res.isPublic && (
                            <span className="text-[10px] opacity-70" title="Nội bộ NVKD">
                              🔒
                            </span>
                          )}
                          <span className="text-[10px] opacity-60">↗</span>
                        </a>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-xs text-gray-400 italic">
                    Chưa có tài liệu Driver TT được gắn link.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
