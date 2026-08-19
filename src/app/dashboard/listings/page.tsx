"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { formatVND, LABELS } from "@/lib/utils";

export default function DashboardListingsPage() {
  const { data: session } = useSession();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const role = (session?.user as any)?.role;
  const canApprove = role === "ADMIN" || role === "MANAGER";

  async function load() {
    setLoading(true);
    const res = await fetch("/api/listings?all=1&page=1");
    const data = await res.json();
    setItems(data.items || []);
    setLoading(false);
  }

  useEffect(() => {
    if (session) load();
  }, [session]);

  async function remove(id: string) {
    if (!confirm("Xoá tin đăng này?")) return;
    await fetch(`/api/listings/${id}`, { method: "DELETE" });
    load();
  }

  async function setStatus(id: string, unitStatus: string) {
    await fetch(`/api/listings/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ unitStatus }),
    });
    load();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900">Tin đăng bất động sản</h1>
        <Link href="/dashboard/listings/new" className="btn-primary text-xs sm:text-sm self-start sm:self-auto">+ Đăng tin mới</Link>
      </div>

      <div className="overflow-x-auto custom-scrollbar rounded-2xl border border-slate-200 bg-white shadow-2xs">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-600 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3.5 min-w-[130px]">Mã SP / Mã căn</th>
              <th className="px-4 py-3.5 min-w-[180px]">Tiêu đề BĐS</th>
              <th className="px-4 py-3.5 min-w-[140px]">Người đăng tin</th>
              <th className="px-4 py-3.5 min-w-[110px]">Giá</th>
              <th className="px-4 py-3.5 min-w-[110px]">Trạng thái</th>
              <th className="px-4 py-3.5 min-w-[100px]">Cập nhật</th>
              <th className="px-4 py-3.5 text-right min-w-[130px]">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">Đang tải danh sách tin...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">Chưa có tin đăng nào</td></tr>
            ) : (
              items.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-4 py-3 text-xs min-w-[130px]">
                    <div className="font-bold text-blue-700 font-mono">Mã SP: {l.productCode || "—"}</div>
                    <div className="font-semibold text-amber-700 font-mono text-[11px]">Mã căn: {l.unitCode}</div>
                  </td>
                  <td className="px-4 py-3 min-w-[180px]">
                    <div className="font-bold text-slate-900">{l.title}</div>
                    {l.project && (
                      <div className="text-[11px] text-slate-500 font-medium">🏢 {l.project.name}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs min-w-[140px]">
                    <div className="font-bold text-slate-900">
                      👤 {l.author?.name || "Hệ thống"}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {l.author?.role} {l.author?.referralCode ? `· ${l.author.referralCode}` : ""}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-blue-700 min-w-[110px]">
                    {formatVND(l.transactionType === "RENT" ? l.rentPrice : l.salePrice)}
                  </td>
                  <td className="px-4 py-3 min-w-[110px]">
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 border border-slate-200">
                      {LABELS.unitStatus[l.unitStatus as keyof typeof LABELS.unitStatus] || l.unitStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500 min-w-[100px]">{new Date(l.updatedAt).toLocaleDateString("vi-VN")}</td>
                  <td className="px-4 py-3 text-right min-w-[130px]">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/dashboard/listings/${l.id}/edit`}
                        className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-1 rounded-lg hover:bg-blue-100 transition"
                      >
                        Sửa
                      </Link>
                      {canApprove && l.unitStatus === "CHO_DUYET" && (
                        <button
                          onClick={() => setStatus(l.id, l.transactionType === "RENT" ? "DANG_CHO_THUE" : "DANG_BAN")}
                          className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg hover:bg-emerald-100 transition cursor-pointer"
                        >
                          ✓ Duyệt
                        </button>
                      )}
                      <button
                        onClick={() => remove(l.id)}
                        className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-1 rounded-lg hover:bg-rose-100 transition cursor-pointer"
                        title="Xóa vĩnh viễn tin đăng"
                      >
                        🗑️ Xóa
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
