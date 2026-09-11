"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { LABELS } from "@/lib/utils";
import { useToast } from "@/components/ToastProvider";
import ConfirmModal from "@/components/ConfirmModal";

const statusColor: Record<string, string> = {
  MOI: "bg-blue-100 text-blue-700",
  DANG_LIEN_HE: "bg-amber-100 text-amber-700",
  DA_HEN_GAP: "bg-purple-100 text-purple-700",
  DA_CHOT: "bg-green-100 text-green-700",
  KHONG_TIEM_NANG: "bg-gray-100 text-gray-500",
  DONG: "bg-gray-100 text-gray-500",
};

export default function CollaboratorsDashboardPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [actionId, setActionId] = useState<string | null>(null);

  // Modal xác nhận thao tác
  const [collabToDelete, setCollabToDelete] = useState<{ id: string; name: string } | null>(null);
  const [collabToToggle, setCollabToToggle] = useState<{ id: string; name: string; currentStatus: string } | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Modal xem chi tiết CTV & Khách đang chăm sóc
  const [selectedCollabId, setSelectedCollabId] = useState<string | null>(null);
  const [collabDetail, setCollabDetail] = useState<any | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const role = (session?.user as any)?.role;
  const isManagerUp = ["ADMIN", "MANAGER"].includes(role);

  // Debounce search 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  async function load(query = debouncedSearch) {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (query.trim()) qs.set("keyword", query.trim());
      const res = await fetch(`/api/collaborators?${qs.toString()}`);
      if (res.ok) {
        setCollaborators(await res.json());
      } else {
        setCollaborators([]);
      }
    } catch (err) {
      console.error("Lỗi tải danh sách CTV:", err);
      setCollaborators([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (session) {
      load(debouncedSearch);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, debouncedSearch]);

  async function openDetail(id: string) {
    setSelectedCollabId(id);
    setLoadingDetail(true);
    setCollabDetail(null);
    try {
      const res = await fetch(`/api/collaborators/${id}`);
      if (res.ok) {
        setCollabDetail(await res.json());
      } else {
        const data = await res.json();
        toast.error(data.error || "Không thể tải thông tin CTV.");
        setSelectedCollabId(null);
      }
    } catch (err) {
      console.error("Lỗi khi tải chi tiết CTV:", err);
      toast.error("Lỗi kết nối máy chủ khi xem chi tiết CTV.");
      setSelectedCollabId(null);
    } finally {
      setLoadingDetail(false);
    }
  }

  async function handleConfirmToggleStatus() {
    if (!collabToToggle) return;
    const { id, name, currentStatus } = collabToToggle;
    const nextStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const actionName = nextStatus === "INACTIVE" ? "Khóa" : "Mở khóa";

    setModalLoading(true);
    try {
      const res = await fetch(`/api/collaborators/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      setModalLoading(false);
      if (res.ok) {
        toast.success(`Đã ${actionName.toLowerCase()} tài khoản CTV "${name}" thành công!`);
        setCollabToToggle(null);
        load();
      } else {
        const data = await res.json();
        toast.error(data.error || "Thao tác thất bại.");
      }
    } catch (err) {
      setModalLoading(false);
      toast.error("Lỗi kết nối máy chủ.");
    }
  }

  async function handleConfirmDeleteCollab() {
    if (!collabToDelete) return;
    const { id, name } = collabToDelete;

    setModalLoading(true);
    try {
      const res = await fetch(`/api/collaborators/${id}`, {
        method: "DELETE",
      });
      setModalLoading(false);
      if (res.ok) {
        toast.success(`Đã xóa vĩnh viễn CTV "${name}" khỏi hệ thống!`);
        setCollabToDelete(null);
        load();
      } else {
        const data = await res.json();
        toast.error(data.error || "Không thể xóa CTV này.");
      }
    } catch (err) {
      setModalLoading(false);
      toast.error("Lỗi kết nối máy chủ.");
    }
  }

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Quản lý Cộng tác viên (CTV)</h1>
          <p className="mt-1 text-sm text-slate-600">
            {isManagerUp
              ? "Danh sách toàn bộ Cộng tác viên kinh doanh trên hệ thống."
              : "Danh sách Cộng tác viên do bạn trực tiếp giới thiệu và quản lý."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const refCode = (session?.user as any)?.referralCode || "";
              const regUrl = `${window.location.origin}/cong-tac-vien/dang-ky${refCode ? `?ref=${refCode}` : ""}`;
              navigator.clipboard.writeText(regUrl);
              toast.success(`Đã sao chép link đăng ký CTV mới${refCode ? ` (Mã: ${refCode})` : ""} vào bộ nhớ tạm!`, "Đã sao chép");
            }}
            className="btn-primary text-xs font-bold px-3.5 py-2 self-start sm:self-auto flex items-center gap-1.5 cursor-pointer bg-emerald-600 hover:bg-emerald-700 border-none shadow-xs"
          >
            <span>🔗 Sao chép Link Tuyển dụng CTV</span>
          </button>

          <Link
            href={`/cong-tac-vien/dang-ky${(session?.user as any)?.referralCode ? `?ref=${(session?.user as any)?.referralCode}` : ""}`}
            target="_blank"
            className="btn-outline text-xs font-bold px-3 py-2 self-start sm:self-auto"
          >
            Mẫu Đăng ký CTV ↗
          </Link>
        </div>
      </div>

      {/* REALTIME SEARCH BAR (DEBOUNCED 300ms) */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            className="input w-full h-10 text-xs sm:text-sm pl-9 pr-8 rounded-xl border border-slate-300 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            placeholder="🔍 Tìm CTV theo tên, số điện thoại, mã token..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center bg-slate-100"
              title="Xóa tìm kiếm"
            >
              ✕
            </button>
          )}
        </div>

        <div className="text-xs text-slate-500 font-medium self-end sm:self-auto flex items-center gap-2">
          {loading ? (
            <span className="text-sky-600 font-semibold animate-pulse">Đang tìm kiếm...</span>
          ) : (
            <span className="bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-lg border border-slate-200">
              {collaborators.length} CTV
            </span>
          )}
        </div>
      </div>

      {/* DATA TABLE FOR DESKTOP & MOBILE WITH RESPONSIVE SCROLL */}
      <div className="w-full max-w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-2xs">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-600 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3.5 min-w-[170px]">Họ tên & Liên hệ</th>
              <th className="px-4 py-3.5 min-w-[140px]">Mã Token CTV</th>
              {isManagerUp && <th className="px-4 py-3.5 min-w-[140px]">Người giới thiệu</th>}
              <th className="px-4 py-3.5 text-center min-w-[110px]">Khách phụ trách</th>
              <th className="px-4 py-3.5 text-center min-w-[90px]">Lượt Lead</th>
              <th className="px-4 py-3.5 min-w-[110px]">Trạng thái</th>
              <th className="px-4 py-3.5 min-w-[110px]">Ngày tham gia</th>
              <th className="px-4 py-3.5 min-w-[110px]">Cập nhật</th>
              <th className="px-4 py-3.5 text-right min-w-[140px]">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={isManagerUp ? 9 : 8} className="px-4 py-12 text-center text-slate-400">
                  <div className="flex items-center justify-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-sky-600 border-t-transparent rounded-full animate-spin"></span>
                    <span>Đang tải danh sách CTV...</span>
                  </div>
                </td>
              </tr>
            ) : collaborators.length === 0 ? (
              <tr>
                <td colSpan={isManagerUp ? 9 : 8} className="px-4 py-12 text-center text-slate-500 font-medium">
                  {debouncedSearch.trim() ? (
                    <div>
                      <p className="text-slate-600">Không tìm thấy Cộng tác viên nào khớp với từ khóa &quot;{debouncedSearch}&quot;.</p>
                      <button
                        onClick={() => setSearchTerm("")}
                        className="mt-2 text-xs font-bold text-sky-600 hover:underline cursor-pointer"
                      >
                        Xóa bộ lọc tìm kiếm
                      </button>
                    </div>
                  ) : role === "STAFF" ? (
                    "Bạn chưa có cộng tác viên nào."
                  ) : (
                    "Chưa có Cộng tác viên nào trên hệ thống."
                  )}
                </td>
              </tr>
            ) : (
              collaborators.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-4 py-3.5 min-w-[170px]">
                    <div
                      onClick={() => openDetail(c.id)}
                      className="font-bold text-slate-900 hover:text-sky-600 cursor-pointer transition flex items-center gap-1.5"
                    >
                      <span>{c.fullName}</span>
                      <span className="text-[11px] text-sky-600 font-normal">🔍</span>
                    </div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">
                      <a href={`tel:${c.phone}`} className="hover:text-sky-700 font-semibold">{c.phone}</a>
                      {c.email ? ` · ${c.email}` : ""}
                    </div>
                  </td>

                  <td className="px-4 py-3.5 min-w-[140px]">
                    <div className="flex items-center gap-1.5">
                      <code className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded font-mono">
                        {c.publicReferralToken}
                      </code>
                      <button
                        type="button"
                        title="Sao chép Token CTV"
                        onClick={() => {
                          navigator.clipboard.writeText(c.publicReferralToken);
                          toast.success(`Đã sao chép Mã Token CTV: ${c.publicReferralToken}`, "Đã sao chép");
                        }}
                        className="text-[11px] font-semibold text-slate-600 hover:text-blue-700 px-1.5 py-0.5 bg-slate-100 hover:bg-blue-50 border border-slate-200 rounded transition cursor-pointer"
                      >
                        Copy
                      </button>
                    </div>
                  </td>

                  {isManagerUp && (
                    <td className="px-4 py-3.5 text-xs min-w-[140px]">
                      <span className="font-semibold text-slate-800">
                        {c.referredByUser?.name || "Hệ thống"}
                      </span>
                      <span className="text-[11px] text-slate-400 block font-mono">
                        ({c.referredByUser?.role || "SYSTEM"})
                      </span>
                    </td>
                  )}

                  <td className="px-4 py-3.5 text-center font-bold text-emerald-700 min-w-[110px]">
                    <span className="bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                      {c._count?.assignedCustomers || 0}
                    </span>
                  </td>

                  <td className="px-4 py-3.5 text-center font-bold text-slate-800 min-w-[90px]">
                    {c._count?.inquiries || 0}
                  </td>

                  <td className="px-4 py-3.5 min-w-[110px]">
                    {c.status === "ACTIVE" ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        ● Hoạt động
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        Đã khóa
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3.5 text-xs text-slate-500 font-mono min-w-[110px]">
                    {new Date(c.createdAt).toLocaleDateString("vi-VN")}
                  </td>

                  <td className="px-4 py-3.5 text-xs text-slate-500 font-mono min-w-[110px]">
                    {new Date(c.updatedAt).toLocaleDateString("vi-VN")}
                  </td>

                  <td className="px-4 py-3.5 text-right min-w-[140px]">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openDetail(c.id)}
                        className="text-xs font-bold px-2.5 py-1 rounded-lg border border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 transition cursor-pointer"
                      >
                        Chi tiết
                      </button>

                      {/* Các nút Khóa/Mở khóa & Xóa CHỈ hiển thị cho ADMIN & MANAGER */}
                      {isManagerUp && (
                        <>
                          <button
                            disabled={actionId === c.id}
                            onClick={() => setCollabToToggle({ id: c.id, name: c.fullName, currentStatus: c.status })}
                            className={`text-xs font-bold px-2 py-1 rounded-lg border transition cursor-pointer ${
                              c.status === "ACTIVE"
                                ? "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100"
                                : "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                            }`}
                          >
                            {c.status === "ACTIVE" ? "Khóa" : "Mở"}
                          </button>

                          <button
                            disabled={actionId === c.id}
                            onClick={() => setCollabToDelete({ id: c.id, name: c.fullName })}
                            className="text-xs font-bold px-2 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition cursor-pointer"
                          >
                            Xóa
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* DETAIL MODAL (XEM CHI TIẾT CTV VÀ KHÁCH ĐANG CHĂM SÓC) */}
      {selectedCollabId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl p-5 sm:p-6 space-y-5 my-auto max-h-[90vh] overflow-y-auto custom-scrollbar">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-3.5 border-slate-100 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🤝</span>
                <div>
                  <h3 className="font-display text-base sm:text-lg font-bold text-slate-900">
                    {loadingDetail ? "Đang tải thông tin..." : collabDetail?.fullName}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Token: {collabDetail?.publicReferralToken || "..."}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedCollabId(null);
                  setCollabDetail(null);
                }}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {loadingDetail ? (
              <div className="py-12 text-center text-slate-400">
                <div className="inline-block w-6 h-6 border-2 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-2 text-xs font-semibold">Đang tải chi tiết Cộng tác viên...</p>
              </div>
            ) : collabDetail ? (
              <div className="space-y-5">
                {/* Basic info card */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs">
                  <div>
                    <span className="text-slate-500 block font-medium">Số điện thoại:</span>
                    <a href={`tel:${collabDetail.phone}`} className="font-bold text-sky-700 hover:underline font-mono text-sm">
                      {collabDetail.phone}
                    </a>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-medium">Email:</span>
                    <span className="font-bold text-slate-800">
                      {collabDetail.email || "Chưa cập nhật"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-medium">Trạng thái:</span>
                    <span className={`inline-block font-bold text-[11px] px-2 py-0.5 rounded-full border mt-0.5 ${
                      collabDetail.status === "ACTIVE"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-rose-50 text-rose-700 border-rose-200"
                    }`}>
                      {collabDetail.status === "ACTIVE" ? "● Đang hoạt động" : "Đã khóa"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-medium">Người giới thiệu / Phụ trách:</span>
                    <span className="font-bold text-slate-800">
                      {collabDetail.referredByUser?.name || "Hệ thống"} ({collabDetail.referredByUser?.role || "SYSTEM"})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-medium">Ngày tham gia:</span>
                    <span className="font-semibold text-slate-700 font-mono">
                      {new Date(collabDetail.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-medium">Cập nhật gần nhất:</span>
                    <span className="font-semibold text-slate-700 font-mono">
                      {new Date(collabDetail.updatedAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                </div>

                {/* Section: Khách đang chăm sóc */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <span>👥 Khách đang chăm sóc</span>
                      <span className="text-xs bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded-full">
                        {collabDetail.assignedCustomers?.length || 0}
                      </span>
                    </h4>
                  </div>

                  {!collabDetail.assignedCustomers || collabDetail.assignedCustomers.length === 0 ? (
                    <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6 text-center text-xs text-slate-500">
                      Cộng tác viên này chưa được phân công khách hàng nào.
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100/70 font-bold text-slate-600 uppercase border-b border-slate-200">
                          <tr>
                            <th className="p-2.5">Khách hàng</th>
                            <th className="p-2.5">Số điện thoại</th>
                            <th className="p-2.5">Nhu cầu</th>
                            <th className="p-2.5">Trạng thái</th>
                            <th className="p-2.5 text-right">Ngày nhận</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {collabDetail.assignedCustomers.map((cust: any) => (
                            <tr key={cust.id} className="hover:bg-slate-50">
                              <td className="p-2.5 font-bold text-slate-900">{cust.fullName}</td>
                              <td className="p-2.5 font-mono text-slate-600">{cust.phone}</td>
                              <td className="p-2.5 font-semibold text-slate-700">
                                {LABELS.demandType[cust.demandType as keyof typeof LABELS.demandType] || cust.demandType}
                              </td>
                              <td className="p-2.5">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColor[cust.status] || "bg-slate-100 text-slate-700 border-slate-200"}`}>
                                  {LABELS.leadStatus[cust.status as keyof typeof LABELS.leadStatus] || cust.status}
                                </span>
                              </td>
                              <td className="p-2.5 text-right font-mono text-slate-500">
                                {new Date(cust.createdAt).toLocaleDateString("vi-VN")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Footer close button */}
                <div className="flex justify-end pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCollabId(null);
                      setCollabDetail(null);
                    }}
                    className="btn-secondary text-xs px-4 py-2 font-bold cursor-pointer"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* CONFIRM MODAL: KHÓA / MỞ KHÓA CTV */}
      <ConfirmModal
        isOpen={Boolean(collabToToggle)}
        title={collabToToggle?.currentStatus === "ACTIVE" ? "Xác nhận khóa tài khoản CTV" : "Xác nhận mở khóa CTV"}
        message={
          <div className="space-y-2">
            <p>
              Bạn có chắc chắn muốn{" "}
              <strong>{collabToToggle?.currentStatus === "ACTIVE" ? "KHÓA" : "MỞ KHÓA"}</strong> tài khoản CTV{" "}
              <strong className="text-slate-900 font-bold">"{collabToToggle?.name}"</strong>?
            </p>
            {collabToToggle?.currentStatus === "ACTIVE" && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                💡 Khi bị khóa, tài khoản CTV sẽ không thể sử dụng mã giới thiệu để tiếp nhận khách hàng mới.
              </p>
            )}
          </div>
        }
        variant={collabToToggle?.currentStatus === "ACTIVE" ? "warning" : "primary"}
        confirmText={collabToToggle?.currentStatus === "ACTIVE" ? "Khóa tài khoản" : "Mở khóa"}
        cancelText="Hủy bỏ"
        isLoading={modalLoading}
        onConfirm={handleConfirmToggleStatus}
        onClose={() => setCollabToToggle(null)}
      />

      {/* CONFIRM MODAL: XÓA VĨNH VIỄN CTV */}
      <ConfirmModal
        isOpen={Boolean(collabToDelete)}
        title="Xác nhận xóa vĩnh viễn CTV"
        message={
          <div className="space-y-2">
            <p>
              Bạn có chắc chắn muốn <strong className="text-rose-600">XÓA VĨNH VIỄN</strong> CTV{" "}
              <strong className="text-slate-900 font-bold">"{collabToDelete?.name}"</strong> khỏi hệ thống?
            </p>
            <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2.5">
              ⚠️ Hành động này không thể hoàn tác. Mọi liên kết mã CTV và dữ liệu giới thiệu sẽ bị xóa.
            </p>
          </div>
        }
        variant="danger"
        confirmText="Xác nhận xóa"
        cancelText="Hủy bỏ"
        isLoading={modalLoading}
        onConfirm={handleConfirmDeleteCollab}
        onClose={() => setCollabToDelete(null)}
      />
    </div>
  );
}
