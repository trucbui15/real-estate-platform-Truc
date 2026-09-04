"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function CollaboratorsDashboardPage() {
  const { data: session } = useSession();
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const role = (session?.user as any)?.role;
  const isManagerUp = ["ADMIN", "MANAGER"].includes(role);

  const [actionId, setActionId] = useState<string | null>(null);

  const tableContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollBy({ left: -260, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollBy({ left: 260, behavior: "smooth" });
    }
  };

  async function load() {
    setLoading(true);
    const res = await fetch("/api/collaborators");
    if (res.ok) setCollaborators(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    if (session) load();
  }, [session]);

  async function toggleStatus(id: string, currentStatus: string) {
    const nextStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const actionName = nextStatus === "INACTIVE" ? "KHÓA" : "MỞ KHÓA";
    if (!confirm(`Bạn có chắc chắn muốn ${actionName} tài khoản CTV này không?`)) return;

    setActionId(id);
    try {
      const res = await fetch(`/api/collaborators/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      setActionId(null);
      if (res.ok) {
        load();
      } else {
        const data = await res.json();
        alert(data.error || "Thao tác thất bại.");
      }
    } catch (err) {
      setActionId(null);
      alert("Lỗi kết nối máy chủ.");
    }
  }

  async function deleteCollaborator(id: string, name: string) {
    if (!confirm(`⚠️ Bạn có chắc chắn muốn XÓA vĩnh viễn CTV "${name}" khỏi hệ thống không?`)) return;

    setActionId(id);
    try {
      const res = await fetch(`/api/collaborators/${id}`, {
        method: "DELETE",
      });
      setActionId(null);
      if (res.ok) {
        load();
      } else {
        const data = await res.json();
        alert(data.error || "Không thể xóa CTV này.");
      }
    } catch (err) {
      setActionId(null);
      alert("Lỗi kết nối máy chủ.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Quản lý Cộng tác viên (CTV)</h1>
          <p className="mt-1 text-sm text-slate-600">
            {isManagerUp
              ? "Danh sách toàn bộ Cộng tác viên kinh doanh trên hệ thống."
              : "Danh sách CTV do bạn trực tiếp tuyển dụng và quản lý."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const refCode = (session?.user as any)?.referralCode || "";
              const regUrl = `${window.location.origin}/cong-tac-vien/dang-ky${refCode ? `?ref=${refCode}` : ""}`;
              navigator.clipboard.writeText(regUrl);
              alert(`✓ Đã sao chép Link Đăng ký CTV mới${refCode ? ` (Mã bảo trợ: ${refCode})` : ""}!\n${regUrl}`);
            }}
            className="btn-primary text-xs font-bold px-3.5 py-2 self-start sm:self-auto flex items-center gap-1.5 cursor-pointer bg-emerald-600 hover:bg-emerald-700 border-none shadow-xs"
          >
            <span>Sao chép Link Tuyển dụng CTV</span>
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

      {/* UNIFIED DATA TABLE FOR ALL DEVICES */}
      <div className="w-full max-w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-2xs">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-600 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3.5 min-w-[160px]">Họ tên & Liên hệ</th>
              <th className="px-4 py-3.5 min-w-[150px]">Mã Token Public</th>
              <th className="px-4 py-3.5 min-w-[150px]">Người giới thiệu</th>
              <th className="px-4 py-3.5 text-center min-w-[100px]">Số Lead</th>
              <th className="px-4 py-3.5 min-w-[110px]">Trạng thái</th>
              <th className="px-4 py-3.5 min-w-[110px]">Ngày tham gia</th>
              <th className="px-4 py-3.5 text-right min-w-[130px]">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                  Đang tải danh sách CTV...
                </td>
              </tr>
            ) : collaborators.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                  Chưa có Cộng tác viên nào.
                </td>
              </tr>
            ) : (
              collaborators.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-4 py-3.5 min-w-[160px]">
                    <div className="font-bold text-slate-900">{c.fullName}</div>
                    <div className="text-xs text-slate-500 font-mono">
                      {c.phone} {c.email ? `· ${c.email}` : ""}
                    </div>
                  </td>

                  <td className="px-4 py-3.5 min-w-[150px]">
                    <div className="flex items-center gap-1.5">
                      <code className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded font-mono">
                        {c.publicReferralToken}
                      </code>
                      <button
                        type="button"
                        title="Sao chép Token CTV"
                        onClick={() => {
                          navigator.clipboard.writeText(c.publicReferralToken);
                          alert(`✓ Đã sao chép Mã Token CTV: ${c.publicReferralToken}`);
                        }}
                        className="text-[11px] font-semibold text-slate-600 hover:text-blue-700 px-1.5 py-0.5 bg-slate-100 hover:bg-blue-50 border border-slate-200 rounded transition cursor-pointer"
                      >
                        Copy
                      </button>
                    </div>
                  </td>

                  <td className="px-4 py-3.5 text-xs min-w-[150px]">
                    <span className="font-semibold text-slate-800">
                      {c.referredByUser?.name || "Hệ thống"}
                    </span>
                    <span className="text-[11px] text-slate-400 block font-mono">
                      ({c.referredByUser?.role})
                    </span>
                  </td>

                  <td className="px-4 py-3.5 text-center font-bold text-slate-900 min-w-[100px]">
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

                  <td className="px-4 py-3.5 text-right min-w-[130px]">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        disabled={actionId === c.id}
                        onClick={() => toggleStatus(c.id, c.status)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                          c.status === "ACTIVE"
                            ? "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100"
                            : "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                        }`}
                      >
                        {c.status === "ACTIVE" ? "Khóa" : "Mở khóa"}
                      </button>

                      <button
                        disabled={actionId === c.id}
                        onClick={() => deleteCollaborator(c.id, c.fullName)}
                        className="text-xs font-bold px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition cursor-pointer"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
