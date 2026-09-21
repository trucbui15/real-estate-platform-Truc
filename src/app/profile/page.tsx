import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import UserProfileManager from "@/components/UserProfileManager";
import CollaboratorTokenCard from "@/components/CollaboratorTokenCard";
import { normalizePhone } from "@/lib/utils";




const DEMAND_LABELS: Record<string, { label: string; style: string }> = {
  MUA: { label: "🏷️ Quan tâm Mua BĐS", style: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  THUE: { label: "🔑 Quan tâm Thuê BĐS", style: "bg-blue-50 text-blue-800 border-blue-200" },
  KY_GUI_BAN: { label: "🏠 Ký gửi Bán BĐS", style: "bg-purple-50 text-purple-800 border-purple-200" },
  KY_GUI_CHO_THUE: { label: "🏢 Ký gửi Cho thuê", style: "bg-indigo-50 text-indigo-800 border-indigo-200" },
  TU_VAN: { label: "💬 Nhận tư vấn", style: "bg-amber-50 text-amber-800 border-amber-200" },
  THAM_QUAN_DU_AN: { label: "🚘 Tham quan dự án", style: "bg-sky-50 text-sky-800 border-sky-200" },
  NHAN_BANG_GIA: { label: "📄 Nhận bảng giá", style: "bg-rose-50 text-rose-800 border-rose-200" },
};

const STATUS_LABELS: Record<string, { label: string; style: string }> = {
  MOI: { label: "🟢 Đã tiếp nhận (Đang chờ chuyên viên hỗ trợ)", style: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  DANG_XU_LY: { label: "🔵 Đang xử lý tư vấn", style: "bg-blue-50 text-blue-800 border-blue-200" },
  HOAN_THANH: { label: "🟣 Đã tư vấn xong", style: "bg-purple-50 text-purple-800 border-purple-200" },
  KHONG_NHU_CAU: { label: "⚪ Đã lưu hệ thống", style: "bg-slate-100 text-slate-700 border-slate-200" },
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login?callbackUrl=/profile");

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, phone: true, role: true, referralCode: true },
  });

  const isBackoffice = dbUser && ["ADMIN", "MANAGER", "STAFF", "COLLABORATOR_PRO"].includes(dbUser.role);

  // Clean phone number for precise matching
  const userCleanPhone = dbUser?.phone ? normalizePhone(dbUser.phone) : "";
  const userEmail = dbUser?.email ? dbUser.email.trim().toLowerCase() : "";

  // 1. Query Customer records matching clean phone, raw phone, or email
  const myCustomers = await prisma.customer.findMany({
    where: {
      OR: [
        ...(userCleanPhone ? [{ phone: userCleanPhone }] : []),
        ...(dbUser?.phone ? [{ phone: dbUser.phone.trim() }] : []),
        ...(userEmail ? [{ email: userEmail }] : []),
      ],
    },
    select: { id: true, fullName: true, phone: true, email: true, status: true },
  });

  const customerIds = myCustomers.map((c) => c.id);

  // 2. Query Collaborator record if this user is a CTV
  const collaborator = await prisma.collaborator.findUnique({
    where: { userId: session.user.id },
    select: { id: true, publicReferralToken: true, status: true },
  });

  // 3. Query all CustomerInquiries
  const myInquiries = await prisma.customerInquiry.findMany({
    where: {
      OR: [
        ...(customerIds.length > 0 ? [{ customerId: { in: customerIds } }] : []),
        ...(collaborator ? [{ collaboratorId: collaborator.id }] : []),
      ],
    },
    include: {
      customer: { select: { fullName: true, phone: true, email: true, status: true } },
      project: { select: { name: true, slug: true } },
      listing: { select: { title: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container-page py-8 space-y-8">
      {/* PROFILE HEADER CARD */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
              {dbUser?.role === "CUSTOMER" ? "TÀI KHOẢN KHÁCH HÀNG" : dbUser?.role === "COLLABORATOR_PRO" ? "TÀI KHOẢN CTV PRO" : `${dbUser?.role} ACCOUNT`}
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              Xin chào, {dbUser?.name}
            </h1>
            <p className="text-sm text-slate-600 font-medium">
              {dbUser?.email} {dbUser?.phone ? `· 📞 ${dbUser.phone}` : ""}
            </p>
          </div>
        </div>

        {/* CARD MÃ GIỚI THIỆU DÀNH CHO NHÂN SỰ NỘI BỘ */}
        {isBackoffice && dbUser?.referralCode && (
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 mt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mã giới thiệu tuyển dụng CTV</div>
                <div className="text-xl font-black font-mono text-blue-700 mt-0.5">
                  {dbUser.referralCode}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`/cong-tac-vien/dang-ky?ref=${dbUser.referralCode}`}
                  target="_blank"
                  className="text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3.5 py-2 rounded-xl border border-blue-200 transition"
                >
                  🔗 Mẫu Đăng ký CTV ↗
                </a>
              </div>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Cung cấp mã <code className="font-bold text-slate-700">{dbUser.referralCode}</code> cho Cộng tác viên điền khi đăng ký. Mọi Lead phát sinh từ CTV này sẽ được tự động gán cho bạn phụ trách!
            </p>
          </div>
        )}
      </div>

      {/* CARD DÀNH CHO CỘNG TÁC VIÊN (CTV) DEPLOY LINK & TOKEN */}
      {collaborator && (
        <CollaboratorTokenCard
          publicReferralToken={collaborator.publicReferralToken}
          status={collaborator.status}
        />
      )}

      {/* CHỨC NĂNG QUẢN LÝ THÔNG TIN CÁ NHÂN & ĐỔI MẬT KHẨU */}
      <UserProfileManager
        initialName={dbUser?.name || ""}
        initialPhone={dbUser?.phone || ""}
        initialEmail={dbUser?.email || ""}
      />

      {/* LỊCH SỬ YÊU CẦU ĐÃ GỬI */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>📋</span>
            <span>Yêu cầu đã gửi & Lịch sử tư vấn</span>
          </h2>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
            Tổng cộng: {myInquiries.length} yêu cầu
          </span>
        </div>

        {myInquiries.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 space-y-2 shadow-2xs">
            <div className="text-3xl">📭</div>
            <div className="font-bold text-slate-700 text-sm">
              Bạn chưa gửi yêu cầu tư vấn nào.
            </div>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Khi bạn gửi yêu cầu nhận thông tin dự án, tư vấn căn hộ BĐS trên website, lịch sử yêu cầu và trạng thái xử lý sẽ hiển thị chi tiết tại đây.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {myInquiries.map((inq) => {
              const demandMeta = DEMAND_LABELS[inq.demandType] || {
                label: inq.demandType,
                style: "bg-slate-100 text-slate-800 border-slate-200",
              };
              const statusMeta = STATUS_LABELS[inq.customer?.status || "MOI"] || {
                label: "🟢 Đã tiếp nhận",
                style: "bg-slate-100 text-slate-700 border-slate-200",
              };

              return (
                <div
                  key={inq.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs hover:shadow-xs transition space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${demandMeta.style}`}>
                        {demandMeta.label}
                      </span>

                      {inq.project && (
                        <Link
                          href={`/projects/${inq.project.slug}`}
                          className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <span>🏢 Dự án:</span>
                          <span>{inq.project.name}</span>
                        </Link>
                      )}

                      {inq.listing && (
                        <Link
                          href={`/listings/${inq.listing.slug}`}
                          className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <span>🏠 Tin rao:</span>
                          <span className="truncate max-w-xs">{inq.listing.title}</span>
                        </Link>
                      )}
                    </div>

                    <div className="text-xs font-semibold text-slate-400">
                      {new Date(inq.createdAt).toLocaleString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      {inq.note && (
                        <div className="text-slate-700 font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          💬 <span className="font-bold">Ghi chú:</span> {inq.note}
                        </div>
                      )}
                      <div className="text-slate-500 font-medium">
                        Họ tên người gửi: <strong className="text-slate-800">{inq.customer?.fullName}</strong> · SĐT: <strong className="text-slate-800">{inq.customer?.phone}</strong>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <span className={`px-3 py-1 text-xs font-bold rounded-xl border inline-block ${statusMeta.style}`}>
                        {statusMeta.label}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
