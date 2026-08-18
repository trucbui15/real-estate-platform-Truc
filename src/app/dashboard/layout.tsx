import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { isBackofficeRole, canManageUsers, canManageProjectsAndNews } from "@/lib/permissions";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login?callbackUrl=/dashboard");
  }

  if (!isBackofficeRole(session.user.role)) {
    redirect("/");
  }

  const role = session.user.role;
  const roleLabel = { ADMIN: "Quản trị viên", MANAGER: "Quản lý", STAFF: "Nhân viên" }[role];

  const links = [
    { href: "/dashboard", label: "Tổng quan", show: true },
    { href: "/dashboard/listings", label: "Tin đăng BĐS", show: true },
    { href: "/dashboard/customers", label: "Khách hàng (CRM)", show: true },
    { href: "/dashboard/services", label: "Đặt phòng & Visa", show: true },
    { href: "/dashboard/collaborators", label: "Cộng tác viên (CTV)", show: true },
    { href: "/dashboard/projects", label: "Dự án", show: canManageProjectsAndNews(role) },
    { href: "/dashboard/news", label: "Tin tức", show: canManageProjectsAndNews(role) },
    { href: "/dashboard/users", label: "Tài khoản nội bộ", show: canManageUsers(role) },
  ];

  return (
    <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 lg:px-8 py-6 md:py-8 grid gap-6 md:grid-cols-[220px_1fr]">
      <aside className="md:sticky md:top-20 md:h-fit space-y-3">
        <div className="card p-3.5 flex items-center justify-between md:block">
          <div className="text-xs font-medium text-slate-500">Vai trò của bạn:</div>
          <div className="font-bold text-sm md:text-base text-slate-900">{roleLabel}</div>
        </div>

        <nav className="card p-2 flex md:flex-col overflow-x-auto custom-scrollbar gap-1 shrink-0">
          {links
            .filter((l) => l.show)
            .map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="shrink-0 rounded-xl px-3.5 py-2 text-xs md:text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-[#0284C7] transition whitespace-nowrap"
              >
                {l.label}
              </Link>
            ))}
        </nav>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
