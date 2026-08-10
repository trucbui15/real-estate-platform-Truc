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
    { href: "/dashboard/collaborators", label: "Cộng tác viên (CTV)", show: true },
    { href: "/dashboard/projects", label: "Dự án", show: canManageProjectsAndNews(role) },
    { href: "/dashboard/news", label: "Tin tức", show: canManageProjectsAndNews(role) },
    { href: "/dashboard/users", label: "Tài khoản nội bộ", show: canManageUsers(role) },
  ];

  return (
    <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 lg:px-8 grid gap-6 py-8 md:grid-cols-[220px_1fr]">
      <aside className="md:sticky md:top-20 md:h-fit">

        <div className="card p-4">
          <div className="text-xs text-brand-300">Đăng nhập với vai trò</div>
          <div className="font-display text-base font-semibold text-brand-900">{roleLabel}</div>
        </div>
        <nav className="card mt-3 p-2">
          {links
            .filter((l) => l.show)
            .map((l) => (
              <Link key={l.href} href={l.href} className="block rounded-md px-3 py-2 text-sm font-medium text-brand-700 hover:bg-sand-100">
                {l.label}
              </Link>
            ))}
        </nav>
      </aside>
      <div>{children}</div>
    </div>
  );
}
