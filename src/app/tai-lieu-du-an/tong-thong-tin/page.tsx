import { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isBackofficeRole } from "@/lib/permissions";
import ProjectOverviewListClient from "./ProjectOverviewListClient";

export const metadata: Metadata = {
  title: "Tổng thông tin Dự án | Minh Dũng Land",
  description: "Tổng hợp danh mục các dự án bất động sản, tài liệu bán hàng, pháp lý, bảng hàng và thông tin quy hoạch.",
};

export default async function TongThongTinDuAnIndexPage() {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;
  const isInternalUser = isBackofficeRole(userRole);

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
        select: { id: true, images: true },
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
      <ProjectOverviewListClient projects={projects} canEdit={isInternalUser} />
    </div>
  );
}
