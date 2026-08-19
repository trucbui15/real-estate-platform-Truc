"use client";
import { useEffect, useState, useRef } from "react";
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
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [status, setStatus] = useState("");
  const [keyword, setKeyword] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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

  // Modal tạo khách hàng mới
  const [showAddModal, setShowAddModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newForm, setNewForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    demandType: "TU_VAN",
    source: "HOTLINE",
    assigneeValue: "UNASSIGNED",
    note: "",
  });

  const role = (session?.user as any)?.role;
  const isManagerUp = ["ADMIN", "MANAGER"].includes(role);

  async function load() {
    setLoading(true);
    const qs = new URLSearchParams();
    if (status) qs.set("status", status);
    if (keyword) qs.set("keyword", keyword);
    if (assigneeFilter) qs.set("assignee", assigneeFilter);
    const res = await fetch(`/api/customers?${qs.toString()}`);
    setItems(res.ok ? await res.json() : []);
    setLoading(false);
  }

  async function loadAssignees() {
    try {
      const [resUsers, resCols] = await Promise.all([
        fetch("/api/users", { cache: "no-store" }),
        fetch("/api/collaborators?forAssign=true", { cache: "no-store" }),
      ]);
      if (resUsers.ok) setUsers(await resUsers.json());
      if (resCols.ok) setCollaborators(await resCols.json());
    } catch (e) {
      console.error("Lỗi tải danh sách người phụ trách", e);
    }
  }

  useEffect(() => {
    if (session) {
      load();
      loadAssignees();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status, assigneeFilter]);

  async function handleQuickAssign(customerId: string, selectedValue: string) {
    setUpdatingId(customerId);
    let payload: any = { assigneeType: "UNASSIGNED", assigneeId: null };

    if (selectedValue.startsWith("user:")) {
      payload = { assigneeType: "USER", assigneeId: selectedValue.replace("user:", "") };
    } else if (selectedValue.startsWith("collaborator:")) {
      payload = { assigneeType: "COLLABORATOR", assigneeId: selectedValue.replace("collaborator:", "") };
    }

    try {
      const res = await fetch(`/api/customers/${customerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setUpdatingId(null);
      if (res.ok) {
        load();
      } else {
        const data = await res.json();
        alert(data.error || "Không thể phân công. Vui lòng thử lại.");
      }
    } catch (err) {
      setUpdatingId(null);
      alert("Lỗi kết nối máy chủ.");
    }
  }

  async function handleCreateCustomer(e: React.FormEvent) {
    e.preventDefault();
    if (!newForm.fullName.trim() || !newForm.phone.trim()) {
      alert("Vui lòng nhập Họ tên và Số điện thoại khách hàng!");
      return;
    }
    setCreating(true);

    let assigneeType = "UNASSIGNED";
    let assigneeId: string | null = null;
    if (newForm.assigneeValue.startsWith("user:")) {
      assigneeType = "USER";
      assigneeId = newForm.assigneeValue.replace("user:", "");
    } else if (newForm.assigneeValue.startsWith("collaborator:")) {
      assigneeType = "COLLABORATOR";
      assigneeId = newForm.assigneeValue.replace("collaborator:", "");
    }

    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: newForm.fullName.trim(),
          phone: newForm.phone.trim(),
          email: newForm.email.trim() || null,
          demandType: newForm.demandType,
          source: newForm.source,
          assigneeType,
          assigneeId,
          note: newForm.note.trim() || null,
        }),
      });

      setCreating(false);
      if (res.ok) {
        setShowAddModal(false);
        setNewForm({
          fullName: "",
          phone: "",
          email: "",
          demandType: "TU_VAN",
          source: "HOTLINE",
          assigneeValue: "UNASSIGNED",
          note: "",
        });
        load();
      } else {
        const data = await res.json();
        alert(data.error || "Không thể tạo khách hàng mới.");
      }
    } catch (err) {
      setCreating(false);
      alert("Lỗi kết nối khi tạo khách hàng.");
    }
  }

  async function handleDeleteCustomer(id: string, name: string) {
    if (!confirm(`Bạn có chắc chắn muốn XÓA vĩnh viễn khách hàng "${name}" khỏi hệ thống? Hành động này không thể hoàn tác.`)) {
      return;
    }
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/customers/${id}`, { method: "DELETE" });
      setUpdatingId(null);
      if (res.ok) {
        load();
      } else {
        const data = await res.json();
        alert(data.error || "Không thể xóa khách hàng.");
      }
    } catch (e) {
      setUpdatingId(null);
      alert("Lỗi kết nối máy chủ khi xóa.");
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-brand-900">Quản lý khách hàng (CRM)</h1>
          <p className="mt-1 text-sm text-brand-700">
            {role === "STAFF"
              ? "Danh sách khách hàng được giao cho bạn hoặc CTV của bạn chăm sóc."
              : "Toàn bộ khách hàng trên hệ thống. Bạn có thể phân công trực tiếp cho Nhân sự hoặc Cộng tác viên (CTV)."}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary text-xs sm:text-sm self-start sm:self-auto flex items-center gap-1.5 cursor-pointer"
        >
          <span>➕</span>
          <span>Thêm khách hàng</span>
        </button>
      </div>

      {/* FILTER BAR - ULTRA COMPACT & PROPORTIONAL ON MOBILE & DESKTOP */}
      <div className="mt-3 grid grid-cols-2 gap-1.5 sm:flex sm:flex-wrap sm:items-center sm:gap-2 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="col-span-2 sm:col-span-1 sm:w-56">
          <input
            className="input w-full h-9 text-xs py-1.5 px-2.5 rounded-xl border border-slate-300"
            placeholder="🔍 Tìm theo tên hoặc SĐT..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
          />
        </div>

        <div className="col-span-1 sm:w-40">
          <select
            className="input w-full h-9 text-xs py-1.5 px-2 rounded-xl border border-slate-300 font-medium"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            {Object.entries(LABELS.leadStatus).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>

        {isManagerUp && (
          <div className="col-span-1 sm:w-48">
            <select
              className="input w-full h-9 text-xs py-1.5 px-2 rounded-xl border border-slate-300 font-medium truncate"
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
            >
              <option value="">Tất cả phụ trách</option>
              <option value="UNASSIGNED">⚠️ Chưa phân công</option>
              <optgroup label="NHÂN SỰ NỘI BỘ">
                {users
                  .filter((u) => u.active && ["ADMIN", "MANAGER", "STAFF"].includes(u.role))
                  .map((u) => (
                    <option key={`filter-user:${u.id}`} value={`user:${u.id}`}>
                      👤 {u.name} ({u.role === "STAFF" ? "Nhân viên" : u.role === "MANAGER" ? "Quản lý" : "Admin"})
                    </option>
                  ))}
              </optgroup>
              <optgroup label="CỘNG TÁC VIÊN (CTV)">
                {collaborators
                  .filter((col) => col.status === "ACTIVE")
                  .map((col) => (
                    <option key={`filter-col:${col.id}`} value={`collaborator:${col.id}`}>
                      🤝 CTV {col.fullName} ({col.publicReferralToken})
                    </option>
                  ))}
              </optgroup>
            </select>
          </div>
        )}

        <div className="col-span-2 sm:col-span-1 sm:w-auto">
          <button
            onClick={load}
            className="btn-primary w-full sm:w-auto h-9 text-xs py-1.5 px-4 rounded-xl cursor-pointer font-bold flex items-center justify-center gap-1"
          >
            🔍 Lọc
          </button>
        </div>
      </div>

      {/* UNIFIED DATA TABLE FOR ALL DEVICES */}
      <div className="mt-4 w-full max-w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-2xs">
        <table className="w-full min-w-[1050px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-600 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3.5 min-w-[160px]">Khách hàng</th>
              <th className="px-4 py-3.5 min-w-[140px]">Nhu cầu</th>
              <th className="px-4 py-3.5 min-w-[140px]">Nguồn</th>
              <th className="px-4 py-3.5 min-w-[130px]">Trạng thái</th>
              <th className="px-4 py-3.5 min-w-[180px]">Phụ trách (Phân công)</th>
              <th className="px-4 py-3.5 min-w-[120px]">Cập nhật</th>
              {isManagerUp && <th className="px-4 py-3.5 text-right min-w-[100px]">Thao tác</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={isManagerUp ? 7 : 6} className="px-4 py-8 text-center text-slate-400">Đang tải danh sách...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={isManagerUp ? 7 : 6} className="px-4 py-8 text-center text-slate-400">Chưa có khách hàng nào</td></tr>
            ) : (
              items.map((c) => {
                const selectValue = c.assignedToId
                  ? `user:${c.assignedToId}`
                  : c.assignedCollaboratorId
                    ? `collaborator:${c.assignedCollaboratorId}`
                    : "UNASSIGNED";

                return (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3.5 min-w-[160px]">
                      <Link href={`/dashboard/customers/${c.id}`} className="font-bold text-slate-900 hover:text-blue-600 hover:underline block">
                        {c.fullName}
                      </Link>
                      <div className="text-xs text-slate-500 font-mono">📞 {c.phone}</div>
                    </td>
                    <td className="px-4 py-3.5 min-w-[140px]">
                      <div className="font-semibold text-slate-800">{LABELS.demandType[c.demandType as keyof typeof LABELS.demandType] || c.demandType}</div>
                      {c.project && (
                        <div className="text-xs font-medium text-slate-500">🏢 {c.project.name}</div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 min-w-[140px]">
                      <span className="inline-block text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {LABELS.leadSource[c.source as keyof typeof LABELS.leadSource] || c.source}
                      </span>
                      {c.inquiries?.[0]?.collaborator && (
                        <div className="text-[11px] font-bold text-emerald-800 mt-1 flex items-center gap-1">
                          <span>🤝</span>
                          <span>{c.inquiries[0].collaborator.fullName} ({c.inquiries[0].collaborator.publicReferralToken})</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 min-w-[120px]">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColor[c.status] || "bg-slate-100 text-slate-700"}`}>
                        {LABELS.leadStatus[c.status as keyof typeof LABELS.leadStatus] || c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs min-w-[220px]">
                      {isManagerUp ? (
                        <select
                          value={selectValue}
                          disabled={updatingId === c.id}
                          onChange={(e) => handleQuickAssign(c.id, e.target.value)}
                          className={`w-full rounded-lg border px-2.5 py-1 text-xs font-bold transition outline-none cursor-pointer ${selectValue === "UNASSIGNED"
                            ? "bg-amber-50 border-amber-300 text-amber-800 font-bold"
                            : selectValue.startsWith("collaborator:")
                              ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-bold"
                              : "bg-white border-slate-300 text-slate-900 focus:border-blue-500"
                            }`}
                        >
                          <option value="UNASSIGNED">-- Chưa phân công --</option>
                          <optgroup label="NHÂN SỰ NỘI BỘ">
                            {users
                              .filter((u) => u.active && ["ADMIN", "MANAGER", "STAFF"].includes(u.role))
                              .map((u) => (
                                <option key={`user:${u.id}`} value={`user:${u.id}`}>
                                  👤 {u.name} ({u.role === "STAFF" ? "Nhân viên" : u.role === "MANAGER" ? "Quản lý" : "Admin"})
                                </option>
                              ))}
                          </optgroup>
                          <optgroup label="CỘNG TÁC VIÊN (CTV)">
                            {collaborators
                              .filter((col) => col.status === "ACTIVE")
                              .map((col) => (
                                <option key={`collaborator:${col.id}`} value={`collaborator:${col.id}`}>
                                  🤝 CTV {col.fullName} ({col.publicReferralToken})
                                </option>
                              ))}
                          </optgroup>
                        </select>
                      ) : (
                        c.assignedTo?.name ? (
                          <span className="font-semibold text-slate-800">👤 {c.assignedTo.name}</span>
                        ) : c.assignedCollaborator?.fullName ? (
                          <span className="font-semibold text-emerald-800">🤝 CTV {c.assignedCollaborator.fullName} ({c.assignedCollaborator.publicReferralToken})</span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold">
                            ⚠️ Chưa phân công
                          </span>
                        )
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-400 font-mono min-w-[120px]">
                      {new Date(c.updatedAt).toLocaleDateString("vi-VN")}
                    </td>
                    {isManagerUp && (
                      <td className="px-4 py-3.5 text-right min-w-[100px]">
                        <button
                          onClick={() => handleDeleteCustomer(c.id, c.fullName)}
                          disabled={updatingId === c.id}
                          className="px-2.5 py-1 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 text-xs font-bold transition border border-red-200"
                          title="Xóa vĩnh viễn khách hàng này"
                        >
                          🗑️ Xóa
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL THÊM KHÁCH HÀNG MỚI */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <h3 className="font-display text-lg font-bold text-slate-900">➕ Thêm khách hàng mới</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Họ và tên khách hàng *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn A"
                  className="input w-full text-xs"
                  value={newForm.fullName}
                  onChange={(e) => setNewForm({ ...newForm, fullName: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số điện thoại *</label>
                  <input
                    type="text"
                    required
                    placeholder="0912345678"
                    className="input w-full text-xs"
                    value={newForm.phone}
                    onChange={(e) => setNewForm({ ...newForm, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="email@example.com"
                    className="input w-full text-xs"
                    value={newForm.email}
                    onChange={(e) => setNewForm({ ...newForm, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nhu cầu</label>
                  <select
                    className="input w-full text-xs"
                    value={newForm.demandType}
                    onChange={(e) => setNewForm({ ...newForm, demandType: e.target.value })}
                  >
                    {Object.entries(LABELS.demandType).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nguồn khách hàng</label>
                  <select
                    className="input w-full text-xs"
                    value={newForm.source}
                    onChange={(e) => setNewForm({ ...newForm, source: e.target.value })}
                  >
                    <option value="HOTLINE">Hotline</option>
                    <option value="DIRECT">Trực tiếp / Vãng lai</option>
                    <option value="ZALO">Zalo</option>
                    <option value="FACEBOOK">Facebook</option>
                    <option value="GIOI_THIEU">Giới thiệu</option>
                    <option value="CTV">Từ Cộng tác viên (CTV)</option>
                    <option value="WEBSITE">Website</option>
                    <option value="KHAC">Khác</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  👤 Phân công người phụ trách (Nhân sự / CTV)
                </label>
                <select
                  className="input w-full text-xs font-bold text-slate-800"
                  value={newForm.assigneeValue}
                  onChange={(e) => setNewForm({ ...newForm, assigneeValue: e.target.value })}
                >
                  <option value="UNASSIGNED">-- Chưa phân công --</option>
                  <optgroup label="NHÂN SỰ NỘI BỘ">
                    {users
                      .filter((u) => u.active && ["ADMIN", "MANAGER", "STAFF"].includes(u.role))
                      .map((u) => (
                        <option key={`modal-user:${u.id}`} value={`user:${u.id}`}>
                          👤 {u.name} ({u.role === "STAFF" ? "Nhân viên" : u.role === "MANAGER" ? "Quản lý" : "Admin"})
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="CỘNG TÁC VIÊN (CTV)">
                    {collaborators
                      .filter((col) => col.status === "ACTIVE")
                      .map((col) => (
                        <option key={`modal-col:${col.id}`} value={`collaborator:${col.id}`}>
                          🤝 CTV {col.fullName} ({col.publicReferralToken})
                        </option>
                      ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ghi chú ban đầu</label>
                <textarea
                  rows={2}
                  className="input w-full text-xs"
                  placeholder="Nhu cầu cụ thể, tư vấn ban đầu..."
                  value={newForm.note}
                  onChange={(e) => setNewForm({ ...newForm, note: e.target.value })}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary text-xs"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="btn-primary text-xs"
                >
                  {creating ? "Đang lưu..." : "Lưu khách hàng"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

