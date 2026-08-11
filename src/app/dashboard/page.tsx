import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageAllListings } from "@/lib/permissions";

export default async function DashboardHome() {
  const session = await getServerSession(authOptions);
  const role = session!.user.role;
  const isManagerUp = canManageAllListings(role);

  const listingWhere = isManagerUp ? {} : { authorId: session!.user.id };
  const customerWhere = isManagerUp ? {} : { assignedToId: session!.user.id };

  const [totalListings, pendingListings, totalCustomers, newCustomers] = await Promise.all([
    prisma.listing.count({ where: listingWhere }),
    prisma.listing.count({ where: { ...listingWhere, unitStatus: "CHO_DUYET" } }),
    prisma.customer.count({ where: customerWhere }),
    prisma.customer.count({ where: { ...customerWhere, status: "MOI" } }),
  ]);

  const cards = [
    { label: isManagerUp ? "Tổng số tin đăng" : "Tin đăng của tôi", value: totalListings, icon: "🏢" },
    { label: "Tin chờ duyệt", value: pendingListings, icon: "⏳" },
    { label: isManagerUp ? "Tổng khách hàng" : "Khách được giao", value: totalCustomers, icon: "👥" },
    { label: "Khách hàng mới", value: newCustomers, icon: "✨" },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900">Tổng quan hệ thống</h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">Báo cáo hoạt động bất động sản & khách hàng</p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="card p-5 rounded-2xl border border-slate-200 bg-white shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">{c.label}</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#2563EB]">{c.value}</div>
            </div>
            <span className="text-2xl p-2.5 bg-slate-50 rounded-xl border border-slate-100">{c.icon}</span>
          </div>
        ))}
      </div>

      {role === "STAFF" && pendingListings > 0 && (
        <div className="rounded-2xl bg-amber-50 p-4 text-xs sm:text-sm font-bold text-amber-800 border border-amber-200">
          ⚠️ Bạn có {pendingListings} tin đang chờ Quản lý / Admin duyệt trước khi hiển thị công khai.
        </div>
      )}
    </div>
  );
}
