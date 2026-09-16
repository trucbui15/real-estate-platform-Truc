import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentAuthUser } from "@/lib/auth";
import {
  isBackofficeRole,
  canManageUsers,
  canManageProjectsAndNews,
  canAccessCollaborators,
  canAccessCRM,
  ROLE_LABELS,
} from "@/lib/permissions";

import DashboardNav from "./DashboardNav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const currentUser = await getCurrentAuthUser();
  if (!currentUser) {
    redirect("/login?callbackUrl=/dashboard");
  }

  if (!isBackofficeRole(currentUser.role)) {
    redirect("/");
  }

  const role = currentUser.role;
  const roleLabel = ROLE_LABELS[role] || "Thành viên";

  const links = [
    { href: "/dashboard", label: "Tổng quan", show: true },
    { href: "/dashboard/listings", label: "Tin đăng BĐS", show: true },
    { href: "/dashboard/customers", label: "Khách hàng (CRM)", show: canAccessCRM(role) },
    { href: "/dashboard/collaborators", label: "Cộng tác viên (CTV)", show: canAccessCollaborators(role) },
    { href: "/dashboard/services", label: "Đặt phòng & Visa", show: true },
    { href: "/dashboard/projects", label: "Dự án", show: canManageProjectsAndNews(role) },
    { href: "/dashboard/news", label: "Tin tức", show: canManageProjectsAndNews(role) },
    { href: "/dashboard/users", label: "Tài khoản nội bộ", show: canManageUsers(role) },
  ];

  return (
    <div
      className="notranslate mx-auto w-full max-w-[1500px] px-3 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8 grid gap-4 sm:gap-6 md:grid-cols-[230px_1fr]"
      translate="no"
    >
      <aside className="w-full min-w-0 max-w-full md:sticky md:top-20 md:h-fit space-y-2.5">
        <div className="card p-3 sm:p-3.5 flex items-center justify-between md:block bg-white shadow-xs">
          <div>
            <div className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">Vai trò của bạn:</div>
            <div className="font-bold text-xs sm:text-sm md:text-base text-sky-700 mt-0.5">{roleLabel}</div>
          </div>
          <Link
            href="/profile"
            className="text-xs font-bold text-slate-600 hover:text-sky-700 inline-flex items-center mt-1 md:mt-2 bg-slate-50 md:bg-transparent px-2.5 py-1 md:p-0 rounded-lg border md:border-0 border-slate-200"
            title="Đến trang thông tin cá nhân, mã CTV & đổi mật khẩu"
          >
            Hồ sơ cá nhân
          </Link>
        </div>

        <DashboardNav links={links} />
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
