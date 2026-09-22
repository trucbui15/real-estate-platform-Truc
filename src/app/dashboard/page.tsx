import { redirect } from "next/navigation";
import { getCurrentAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageAllListings } from "@/lib/permissions";

export default async function DashboardHome() {
  const currentUser = await getCurrentAuthUser();
  if (!currentUser) {
    redirect("/login?callbackUrl=/dashboard");
  }
  const role = currentUser.role;
  const isManagerUp = canManageAllListings(role);

  const listingWhere = isManagerUp ? {} : { authorId: currentUser.id };
  const customerWhere = isManagerUp ? {} : { assignedToId: currentUser.id };
  const collabWhere = isManagerUp ? {} : { referredByUserId: currentUser.id };

  const [totalListings, pendingListings, totalCustomers, totalCollabs, totalUnits] = await Promise.all([
    prisma.listing.count({ where: listingWhere }),
    prisma.listing.count({ where: { ...listingWhere, unitStatus: "CHO_DUYET" } }),
    prisma.customer.count({ where: customerWhere }),
    prisma.collaborator.count({ where: collabWhere }),
    prisma.projectInventory.count(),
  ]);

  // Cloudinary Usage Monitor Logic (2 Đồng Hồ Đo: Storage & Total Credits)
  let cloudinaryStorageMB = 0;
  let totalCredits = 0;
  let isLiveCloudinary = false;
  let transformationsCount = 0;
  let bandwidthGB = "0.00";

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (cloudName && apiKey && apiSecret) {
    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/usage`, {
        headers: {
          Authorization: `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")}`,
        },
        next: { revalidate: 900 }, // Cache 15 phút (không spam Admin API)
      });
      if (res.ok) {
        const u = await res.json();
        if (u.storage?.usage) {
          cloudinaryStorageMB = Math.round((u.storage.usage / (1024 * 1024)) * 10) / 10;
        }
        if (u.transformations?.usage !== undefined) {
          transformationsCount = u.transformations.usage;
        }
        if (u.bandwidth?.usage !== undefined) {
          bandwidthGB = (u.bandwidth.usage / (1024 * 1024 * 1024)).toFixed(2);
        }

        // PRIMARY: Cloudinary Admin API credits report
        if (u.credits?.usage !== undefined) {
          totalCredits = Math.round(u.credits.usage * 100) / 100;
          isLiveCloudinary = true;
        } else if (u.storage?.usage || u.bandwidth?.usage || u.transformations?.usage) {
          // SECONDARY: Công thức tính credit = Storage GB + Bandwidth GB + (Transformations / 1000)
          const sCredits = (u.storage?.usage || 0) / (1024 * 1024 * 1024);
          const bCredits = (u.bandwidth?.usage || 0) / (1024 * 1024 * 1024);
          const tCredits = (u.transformations?.usage || 0) / 1000;
          totalCredits = Math.round((sCredits + bCredits + tCredits) * 100) / 100;
          isLiveCloudinary = true;
        }
      }
    } catch {}
  }

  const storageGB = (cloudinaryStorageMB / 1024).toFixed(2);
  const warningThresholdGB = 8.0;
  const percentOfWarning = Math.min(100, Math.round((parseFloat(storageGB) / warningThresholdGB) * 100));

  const totalQuotaCredits = 25.0;
  const percentOfCredits = Math.min(100, Math.round((totalCredits / totalQuotaCredits) * 100));

  const cards = [
    { label: isManagerUp ? "Tổng số tin đăng" : "Tin đăng của tôi", value: totalListings, icon: "🏢" },
    { label: "Tin chờ duyệt", value: pendingListings, icon: "⏳" },
    { label: isManagerUp ? "Tổng khách hàng" : "Khách được giao", value: totalCustomers, icon: "👥" },
    { label: isManagerUp ? "Căn trong bảng hàng" : "CTV của tôi", value: isManagerUp ? totalUnits : totalCollabs, icon: isManagerUp ? "📐" : "🤝" },
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

      {/* CLOUDINARY USAGE MONITOR: DUAL GAUGES (STORAGE & TOTAL CREDITS) */}
      {isManagerUp && (
        <div className="card p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">☁️</span>
              <span className="text-sm font-bold text-slate-900">Cloudinary Resource Monitor</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                🟢 Hoạt động an toàn
              </span>
              {isLiveCloudinary && (
                <span className="text-[10px] text-slate-400 font-semibold">(Đồng bộ Admin API)</span>
              )}
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              Dữ liệu định kỳ từ Cloudinary Admin API (Cache 15 phút)
            </span>
          </div>

          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {/* ĐỒNG HỒ 1: STORAGE */}
            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-100 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700">☁️ DUNG LƯỢNG LƯU TRỮ (STORAGE)</span>
                <span className="font-extrabold text-blue-600">{percentOfWarning}% ngưỡng cảnh báo</span>
              </div>
              <div className="text-lg font-extrabold text-slate-900">
                {storageGB} <span className="text-xs font-semibold text-slate-400">/ {warningThresholdGB} GB (Ngưỡng cảnh báo)</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    percentOfWarning > 80 ? "bg-rose-500" : percentOfWarning > 60 ? "bg-amber-500" : "bg-blue-600"
                  }`}
                  style={{ width: `${Math.max(4, percentOfWarning)}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-400">
                Mốc cảnh báo: Vàng (8 GB) → Cam (10 GB) → Đỏ (12 GB)
              </div>
            </div>

            {/* ĐỒNG HỒ 2: TOTAL CREDITS */}
            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-100 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700">⚡ TỔNG CREDITS (TRANSFORM + BW + STORAGE)</span>
                <span className="font-extrabold text-emerald-600">{percentOfCredits}% quota</span>
              </div>
              <div className="text-lg font-extrabold text-slate-900">
                {totalCredits} <span className="text-xs font-semibold text-slate-400">/ {totalQuotaCredits} Credits (Gói Free)</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    percentOfCredits > 80 ? "bg-rose-500" : percentOfCredits > 60 ? "bg-amber-500" : "bg-emerald-600"
                  }`}
                  style={{ width: `${Math.max(4, percentOfCredits)}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-400">
                Còn lại: {(totalQuotaCredits - totalCredits).toFixed(2)} Credits (~{(100 - percentOfCredits).toFixed(1)}% tài nguyên)
              </div>
            </div>
          </div>

          {/* CHI TIẾT TÀI NGUYÊN CLOUDINARY THỰC TẾ TỪ ADMIN API */}
          {isLiveCloudinary && (
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-semibold text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
              <span className="text-slate-800 font-bold">⚡ Chi tiết tài nguyên:</span>
              <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 shadow-xs">
                📦 Storage: <strong className="text-slate-900">{storageGB} GB</strong>
              </span>
              <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 shadow-xs">
                🌐 Bandwidth: <strong className="text-slate-900">{bandwidthGB} GB</strong>
              </span>
              <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 shadow-xs">
                ⚙️ Transformations: <strong className="text-slate-900">{transformationsCount.toLocaleString()}</strong>
              </span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1">
            <span>🎯 Bảng hàng đang quản lý: {totalUnits} căn hộ | Khóa cứng: 700 KB/ảnh | Tối đa 3 ảnh/căn</span>
            <span>Mục tiêu vận hành: 5.000 căn (~15.000 ảnh sơ đồ)</span>
          </div>
        </div>
      )}

      {role === "STAFF" && pendingListings > 0 && (
        <div className="rounded-2xl bg-amber-50 p-4 text-xs sm:text-sm font-bold text-amber-800 border border-amber-200">
          ⚠️ Bạn có {pendingListings} tin đang chờ Quản lý / Admin duyệt trước khi hiển thị công khai.
        </div>
      )}
    </div>
  );
}
