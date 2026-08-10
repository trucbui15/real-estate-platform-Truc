"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { LABELS } from "@/lib/utils";

const statusColor: Record<string, string> = {
  MOI: "bg-blue-100 text-blue-700",
  DANG_LIEN_HE: "bg-amber-100 text-amber-700",
  DA_HEN_GAP: "bg-purple-100 text-purple-700",
  DA_CHOT: "bg-green-100 text-green-700",
  KHONG_TIEM_NANG: "bg-gray-100 text-gray-500",
  DONG: "bg-gray-100 text-gray-500",
};

export default function CustomersPage() {
  const { data: session } = useSession();
  const [items, setItems] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [status, setStatus] = useState("");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const role = (session?.user as any)?.role;
  const isManagerUp = ["ADMIN", "MANAGER"].includes(role);

  async function load() {
    setLoading(true);
    const qs = new URLSearchParams();
    if (status) qs.set("status", status);
    if (keyword) qs.set("keyword", keyword);
    const res = await fetch(`/api/customers?${qs.toString()}`);
    setItems(res.ok ? await res.json() : []);
    setLoading(false);
  }

  async function loadUsers() {
    const res = await fetch("/api/users");
    if (res.ok) setUsers(await res.json());
  }

  useEffect(() => {
    if (session) {
      load();
      if (isManagerUp) loadUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status]);

  async function handleQuickAssign(customerId: string, newAssignedToId: string) {
    setUpdatingId(customerId);
    try {
      const res = await fetch(`/api/customers/${customerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignedToId: newAssignedToId === "" || newAssignedToId === "UNASSIGNED" ? null : newAssignedToId,
        }),
      });
      setUpdatingId(null);
      if (res.ok) {
        load();
      } else {
        alert("Không thể phân công. Vui lòng thử lại.");
      }
    } catch (err) {
      setUpdatingId(null);
      alert("Lỗi kết nối máy chủ.");
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-brand-900">Quản lý khách hàng (CRM)</h1>
      <p className="mt-1 text-sm text-brand-700">
        {role === "STAFF"
          ? "Danh sách khách hàng được giao cho bạn chăm sóc."
          : "Toàn bộ khách hàng trên hệ thống. Bạn có thể chọn phân công trực tiếp tại cột Phụ trách."}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <input
          className="input max-w-xs"
          placeholder="Tìm theo tên hoặc SĐT..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
        />
        <select className="input max-w-[200px]" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Tất cả trạng thái</option>
          {Object.entries(LABELS.leadStatus).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <button onClick={load} className="btn-secondary">Lọc</button>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-600 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3.5">Khách hàng</th>
              <th className="px-4 py-3.5">Nhu cầu</th>
              <th className="px-4 py-3.5">Nguồn</th>
              <th className="px-4 py-3.5">Trạng thái</th>
              <th className="px-4 py-3.5">Phụ trách (Phân công)</th>
              <th className="px-4 py-3.5">Cập nhật</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Đang tải danh sách...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Chưa có khách hàng nào</td></tr>
            ) : (
              items.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-4 py-3.5">
                    <Link href={`/dashboard/customers/${c.id}`} className="font-bold text-slate-900 hover:text-blue-600 hover:underline">
                      {c.fullName}
                    </Link>
                    <div className="text-xs text-slate-500 font-mono">📞 {c.phone}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-slate-800">{LABELS.demandType[c.demandType as keyof typeof LABELS.demandType] || c.demandType}</div>
                    {c.project && (
                      <div className="text-xs font-medium text-slate-500">🏢 {c.project.name}</div>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="inline-block text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {LABELS.leadSource[c.source as keyof typeof LABELS.leadSource] || c.source}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColor[c.status] || "bg-slate-100 text-slate-700"}`}>
                      {LABELS.leadStatus[c.status as keyof typeof LABELS.leadStatus] || c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs">
                    {isManagerUp ? (
                      <select
                        value={c.assignedToId || ""}
                        disabled={updatingId === c.id}
                        onChange={(e) => handleQuickAssign(c.id, e.target.value)}
                        className={`rounded-lg border px-2.5 py-1 text-xs font-bold transition outline-none cursor-pointer ${
                          !c.assignedToId
                            ? "bg-amber-50 border-amber-300 text-amber-800 font-bold"
                            : "bg-white border-slate-300 text-slate-900 focus:border-blue-500"
                        }`}
                      >
                        <option value="">-- ⚠️ Chưa phân công --</option>
                        {users
                          .filter((u) => ["ADMIN", "MANAGER", "STAFF"].includes(u.role))
                          .map((u) => (
                            <option key={u.id} value={u.id}>
                              👤 {u.name} ({u.role === "STAFF" ? "Nhân viên" : u.role === "MANAGER" ? "Quản lý" : "Admin"})
                            </option>
                          ))}
                      </select>
                    ) : (
                      c.assignedTo?.name ? (
                        <span className="font-semibold text-slate-800">👤 {c.assignedTo.name}</span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold">
                          ⚠️ Chưa phân công
                        </span>
                      )
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-400 font-mono">
                    {new Date(c.updatedAt).toLocaleDateString("vi-VN")}
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
