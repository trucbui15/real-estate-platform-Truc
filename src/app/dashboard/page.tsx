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
    { label: isManagerUp ? "Tổng số tin đăng" : "Tin đăng của tôi", value: totalListings },
    { label: "Tin chờ duyệt", value: pendingListings },
    { label: isManagerUp ? "Tổng khách hàng" : "Khách được giao", value: totalCustomers },
    { label: "Khách hàng mới", value: newCustomers },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="font-display text-2xl font-extrabold text-dark">Tổng quan hệ thống</h1>
        <p className="text-xs text-muted font-medium mt-1">Báo cáo hoạt động bất động sản & khách hàng</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="card-glass p-6 rounded-3xl border border-gray-100 shadow-glass">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-400">{c.label}</div>
            <div className="mt-2 font-display text-3xl font-extrabold text-primary-600">{c.value}</div>
          </div>
        ))}
      </div>

      {role === "STAFF" && pendingListings > 0 && (
        <div className="rounded-2xl bg-amber-50 p-4 text-xs font-bold text-amber-800 border border-amber-200">
          ⚠️ Bạn có {pendingListings} tin đang chờ Quản lý / Admin duyệt trước khi hiển thị công khai.
        </div>
      )}
    </div>
  );
}
