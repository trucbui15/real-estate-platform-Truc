import { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Website các Dự án | Minh Dũng Land",
  description: "Tổng hợp các trang website chính thức thông tin các dự án bất động sản.",
};

export default async function WebsiteDuAnPage() {
  const projects = await prisma.project.findMany({
    where: {
      isActive: true,
      resources: {
        some: {
          type: "WEBSITE",
          isActive: true,
          isPublic: true,
        },
      },
    },
    include: {
      resources: {
        where: {
          type: "WEBSITE",
          isActive: true,
          isPublic: true,
        },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      },
    },
    orderBy: [{ featured: "desc" }, { name: "asc" }],
  });

  return (
    <div className="container-page py-12 space-y-8">
      <div className="max-w-3xl space-y-2 border-b pb-6">
        <div className="flex items-center gap-2 text-xs font-bold text-primary-600">
          <Link href="/tai-lieu-du-an" className="hover:underline">Tài liệu dự án</Link>
          <span>/</span>
          <span>Website</span>
        </div>
        <h1 className="font-display text-3xl font-extrabold text-dark">
          Website các Dự án
        </h1>
        <p className="text-xs text-muted leading-relaxed">
          Danh sách đường dẫn website thông tin chính thức của từng dự án bất động sản tại Quy Nhơn.
        </p>
      </div>

      <div className="space-y-6">
        {projects.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-200 p-12 text-center text-muted text-sm bg-white">
            Chưa có trang website dự án nào được cập nhật.
          </div>
        ) : (
          projects.map((project) => (
            <div key={project.id} className="card-glass p-8 rounded-3xl border border-gray-100 space-y-6 shadow-glass">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-2">
                <div>
                  <h2 className="font-display text-xl font-extrabold text-dark flex items-center gap-2">
                    🏢 {project.name}
                  </h2>
                  {project.developer && (
                    <div className="text-xs text-gray-500 font-medium mt-1">
                      Chủ đầu tư: <span className="font-semibold text-dark">{project.developer}</span>
                    </div>
                  )}
                </div>
                <Link
                  href={`/listings?project=${project.slug}`}
                  className="text-xs font-bold text-primary-600 hover:underline"
                >
                  Xem sản phẩm dự án →
                </Link>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {project.resources.map((res) => (
                  <div
                    key={res.id}
                    className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-surface p-5 hover:bg-white transition space-y-4"
                  >
                    <div className="space-y-2">
                      <h3 className="font-bold text-sm text-dark">
                        {res.title}
                      </h3>
                      {res.description && (
                        <p className="text-xs text-gray-500 leading-relaxed font-medium">
                          {res.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-[11px] font-mono text-gray-400 truncate max-w-[140px]">
                        {res.url.replace(/^https?:\/\//, "")}
                      </span>
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary !px-4 !py-1.5 text-xs shadow-sm"
                      >
                        Mở website ↗
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
