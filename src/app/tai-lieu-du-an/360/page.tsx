import { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Tour360Client from "./Tour360Client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Link 360° các Dự án | Minh Dũng Land",
  description: "Trải nghiệm thực tế ảo 360 degree căn hộ mẫu, toàn cảnh thành phố Quy Nhơn và sa bàn các dự án bất động sản.",
};

import { canManageProjectResources } from "@/lib/permissions";

export default async function Tour360Page() {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;
  const canEdit = canManageProjectResources(userRole);

  let cityResource: any = null;
  let projects: any[] = [];

  try {
    cityResource = await prisma.projectResource.findFirst({
      where: {
        type: "TOUR_360",
        projectId: null,
        isActive: true,
        isPublic: true,
      },
    });

    projects = await prisma.project.findMany({
      where: {
        isActive: true,
        resources: {
          some: {
            type: "TOUR_360",
            isActive: true,
            isPublic: true,
          },
        },
      },
      include: {
        listings: { select: { id: true, images: true } },
        resources: {
          where: {
            type: "TOUR_360",
            isActive: true,
            isPublic: true,
          },
          orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        },
      },
      orderBy: [{ featured: "desc" }, { name: "asc" }],
    });
  } catch (err) {
    console.error("Database query error in 360 page:", err);
  }

  return (
    <div className="container-page py-10">
      <div className="max-w-3xl">
        <div className="flex items-center gap-2 text-xs font-semibold text-brand-500 mb-2">
          <Link href="/tai-lieu-du-an" className="hover:underline">Tài liệu dự án</Link>
          <span>/</span>
          <span>Link 360°</span>
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-brand-900">
          Link 360° các Dự án
        </h1>
        <p className="mt-2 text-sm text-brand-700 leading-relaxed">
          Xem sa bàn ảo và trải nghiệm thực tế 360° góc nhìn không gian từng căn hộ mẫu và quy hoạch các dự án bất động sản.
        </p>
      </div>

      <Tour360Client cityResource={cityResource} projects={projects} canEdit={canEdit} />
    </div>
  );
}
