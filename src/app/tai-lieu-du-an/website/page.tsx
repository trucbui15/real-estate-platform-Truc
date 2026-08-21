import { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import WebsiteListClient from "./WebsiteListClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Website các Dự án | Minh Dũng Land",
  description: "Danh sách website và trang thông tin chính thức của toàn bộ các dự án bất động sản.",
};

export default async function WebsiteDuAnPage() {
  let projects: any[] = [];
  try {
    projects = await prisma.project.findMany({
      where: {
        isActive: true,
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
        province: true,
        district: true,
      },
      orderBy: [{ featured: "desc" }, { name: "asc" }],
    });
  } catch (err) {
    console.error("Database query error in website page:", err);
  }

  return (
    <div className="container-page py-10 space-y-8">
      {/* HEADER & BREADCRUMB */}
      <div className="max-w-3xl space-y-2 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-600">
          <Link href="/tai-lieu-du-an" className="hover:underline">
            Tài liệu dự án
          </Link>
          <span>/</span>
          <span className="text-slate-500">Website</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Website & Microsite các Dự án ({projects.length})
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
          Danh sách website thông tin chính thức của toàn bộ các dự án bất động sản tại Quy Nhơn.
        </p>
      </div>

      {/* INTERACTIVE CLIENT LIST WITH SEARCH & PRIMARY INTERNAL CTAS */}
      <WebsiteListClient projects={projects} />
    </div>
  );
}
