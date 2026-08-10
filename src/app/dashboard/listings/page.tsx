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
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-brand-900">Tin đăng bất động sản</h1>
        <Link href="/dashboard/listings/new" className="btn-primary text-sm">+ Đăng tin mới</Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-sand-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-sand-100 text-xs uppercase text-brand-700">
            <tr>
              <th className="px-4 py-3">Mã căn</th>
              <th className="px-4 py-3">Tiêu đề BĐS</th>
              <th className="px-4 py-3">Người đăng tin</th>
              <th className="px-4 py-3">Giá</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Cập nhật</th>
              <th className="px-4 py-3">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-6 text-center text-brand-300">Đang tải danh sách tin...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-6 text-center text-brand-300">Chưa có tin đăng nào</td></tr>
            ) : (
              items.map((l) => (
                <tr key={l.id} className="border-t border-sand-100 hover:bg-slate-50 transition">
                  <td className="px-4 py-3 font-bold text-slate-900">{l.unitCode}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">{l.title}</div>
                    {l.project && (
                      <div className="text-[11px] text-slate-500 font-medium">🏢 {l.project.name}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <div className="font-bold text-slate-900">
                      👤 {l.author?.name || "Hệ thống"}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {l.author?.role} {l.author?.referralCode ? `· ${l.author.referralCode}` : ""}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-blue-700">
                    {formatVND(l.transactionType === "RENT" ? l.rentPrice : l.salePrice)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 border border-slate-200">
                      {LABELS.unitStatus[l.unitStatus as keyof typeof LABELS.unitStatus] || l.unitStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{new Date(l.updatedAt).toLocaleDateString("vi-VN")}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/dashboard/listings/${l.id}/edit`} className="text-xs font-bold text-blue-600 hover:underline">
                        Sửa
                      </Link>
                      {canApprove && l.unitStatus === "CHO_DUYET" && (
                        <button
                          onClick={() => setStatus(l.id, l.transactionType === "RENT" ? "DANG_CHO_THUE" : "DANG_BAN")}
                          className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded hover:bg-emerald-100 transition"
                        >
                          ✓ Duyệt
                        </button>
                      )}
                      <button onClick={() => remove(l.id)} className="text-xs font-bold text-rose-600 hover:underline">
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
