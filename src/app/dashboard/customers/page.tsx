"use client";
import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { LABELS, validatePhone, sanitizePhoneInput } from "@/lib/utils";
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

export default function CustomersPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [status, setStatus] = useState("");
  const [keyword, setKeyword] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState(false);

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

  const keywordRef = useRef(keyword);
  useEffect(() => {
    keywordRef.current = keyword;
  }, [keyword]);

  async function load(options?: { isBackground?: boolean }) {
    const isBg = options?.isBackground ?? false;
    if (!isBg) {
      setLoading(true);
    }
    const qs = new URLSearchParams();
    if (status) qs.set("status", status);
    const kw = keywordRef.current?.trim();
    if (kw) qs.set("keyword", kw);
    if (assigneeFilter) qs.set("assignee", assigneeFilter);

    try {
      const res = await fetch(`/api/customers?${qs.toString()}`, { cache: "no-store" });
      if (res.status === 401 || res.status === 403) {
        window.location.href = "/login?error=SessionExpired";
        return;
      }
      if (res.ok) {
        const freshItems = await res.json();
        setItems(freshItems);
      }
    } catch (err) {
      console.error("[CRM] Lỗi tải dữ liệu khách hàng:", err);
    } finally {
      if (!isBg) {
        setLoading(false);
      }
    }
  }

  async function loadAssignees() {
    if (!isManagerUp) return;
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
    if (!session) return;

    // Initial load
    load();
    loadAssignees();

    // 1. Smart polling mỗi 3 giây khi tab đang hiển thị (document.visibilityState === "visible")
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        load({ isBackground: true });
      }
    }, 3000);

    // 2. Refetch ngay lập tức khi tab regain focus hoặc visibilityState chuyển sang visible
    const handleFocus = () => {
      load({ isBackground: true });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        load({ isBackground: true });
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
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
        toast.success("Đã cập nhật phân công khách hàng thành công!");
        load();
      } else {
        const data = await res.json();
        toast.error(data.error || "Không thể phân công. Vui lòng thử lại.");
      }
    } catch (err) {
      setUpdatingId(null);
      toast.error("Lỗi kết nối máy chủ khi phân công.");
    }
  }

  async function handleCreateCustomer(e: React.FormEvent) {
    e.preventDefault();
    if (!newForm.fullName.trim()) {
      toast.warning("Vui lòng nhập họ và tên khách hàng!");
      return;
    }
    const phoneError = validatePhone(newForm.phone);
    if (phoneError) {
      toast.warning(phoneError);
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
        toast.success("Đã thêm khách hàng mới thành công!");
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
        toast.error(data.error || "Không thể tạo khách hàng mới.");
      }
    } catch (err) {
      setCreating(false);
      toast.error("Lỗi kết nối khi tạo khách hàng.");
    }
  }

  async function handleConfirmDeleteCustomer() {
    if (!customerToDelete) return;
    setDeletingCustomer(true);
    try {
      const res = await fetch(`/api/customers/${customerToDelete.id}`, { method: "DELETE" });
      setDeletingCustomer(false);
      if (res.ok) {
        toast.success(`Đã xóa vĩnh viễn khách hàng "${customerToDelete.name}" thành công.`);
        setCustomerToDelete(null);
        load();
      } else {
        const data = await res.json();
        toast.error(data.error || "Không thể xóa khách hàng.");
      }
    } catch (e) {
      setDeletingCustomer(false);
      toast.error("Lỗi kết nối máy chủ khi xóa khách hàng.");
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
        {isManagerUp && (
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary text-xs sm:text-sm self-start sm:self-auto flex items-center gap-1.5 cursor-pointer"
          >
            <span>➕</span>
            <span>Thêm khách hàng</span>
          </button>
        )}
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
                  .filter((u) => u.active && ["ADMIN", "MANAGER", "STAFF", "COLLABORATOR_PRO"].includes(u.role))
                  .map((u) => (
                    <option key={`filter-user:${u.id}`} value={`user:${u.id}`}>
                      👤 {u.name} ({u.role === "COLLABORATOR_PRO" ? "CTV Pro" : u.role === "STAFF" ? "Nhân viên" : u.role === "MANAGER" ? "Quản lý" : "Admin"})
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
            onClick={() => load()}
            className="btn-primary w-full sm:w-auto h-9 text-xs py-1.5 px-4 rounded-xl cursor-pointer font-bold flex items-center justify-center gap-1"
          >
            🔍 Lọc
          </button>
        </div>
      </div>

      {/* MOBILE CARD VIEW (Dành riêng cho điện thoại < md) */}
      <div className="mt-4 space-y-3 md:hidden">
        {loading ? (
          <div className="card p-8 text-center text-xs text-slate-400 bg-white">Đang tải danh sách khách hàng...</div>
        ) : items.length === 0 ? (
          <div className="card p-8 text-center text-xs text-slate-400 bg-white">Chưa có khách hàng nào</div>
        ) : (
          items.map((c) => {
            const selectValue = c.assignedToId
              ? `user:${c.assignedToId}`
              : c.assignedCollaboratorId
                ? `collaborator:${c.assignedCollaboratorId}`
                : "UNASSIGNED";

            return (
              <div key={`m-${c.id}`} className="card p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
                {/* Header: Name, Phone & Status */}
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="min-w-0">
                    <Link href={`/dashboard/customers/${c.id}`} className="font-bold text-slate-900 text-sm hover:text-sky-600 block truncate">
                      {c.fullName}
                    </Link>
                    <a href={`tel:${c.phone}`} className="inline-flex items-center gap-1 text-xs text-sky-700 font-mono font-bold mt-0.5 hover:underline">
                      <span>📞</span>
                      <span>{c.phone}</span>
                    </a>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${statusColor[c.status] || "bg-slate-100 text-slate-700 border-slate-200"}`}>
                    {LABELS.leadStatus[c.status as keyof typeof LABELS.leadStatus] || c.status}
                  </span>
                </div>

                {/* Info details */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Nhu cầu</div>
                    <div className="font-semibold text-slate-800 mt-0.5">{LABELS.demandType[c.demandType as keyof typeof LABELS.demandType] || c.demandType}</div>
                    {c.project && <div className="text-[11px] text-slate-500 font-medium truncate mt-0.5">🏢 {c.project.name}</div>}
                  </div>

                  <div className="bg-slate-50 p-2 rounded-xl">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Nguồn</div>
                    <div className="font-semibold text-slate-800 mt-0.5">{LABELS.leadSource[c.source as keyof typeof LABELS.leadSource] || c.source}</div>
                    {c.inquiries?.[0]?.collaborator && (
                      <div className="text-[10px] font-bold text-emerald-800 truncate mt-0.5">
                        🤝 {c.inquiries[0].collaborator.fullName}
                      </div>
                    )}
                  </div>
                </div>

                {/* Assignee / Quick Assign on mobile */}
                <div className="pt-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">Người phụ trách:</div>
                  {isManagerUp ? (
                    <select
                      value={selectValue}
                      disabled={updatingId === c.id}
                      onChange={(e) => handleQuickAssign(c.id, e.target.value)}
                      className={`w-full rounded-xl border px-3 py-2 text-xs font-bold transition outline-none cursor-pointer min-h-[38px] ${
                        selectValue === "UNASSIGNED"
                          ? "bg-amber-50 border-amber-300 text-amber-900"
                          : selectValue.startsWith("collaborator:")
                            ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                            : "bg-white border-slate-300 text-slate-900"
                      }`}
                    >
                      <option value="UNASSIGNED">⚠️ Chưa phân công</option>
                      <optgroup label="NHÂN SỰ NỘI BỘ">
                        {users
                          .filter((u) => u.active && ["ADMIN", "MANAGER", "STAFF", "COLLABORATOR_PRO"].includes(u.role))
                          .map((u) => (
                            <option key={`m-user:${u.id}`} value={`user:${u.id}`}>
                              👤 {u.name} ({u.role === "COLLABORATOR_PRO" ? "CTV Pro" : u.role === "STAFF" ? "Nhân viên" : u.role === "MANAGER" ? "Quản lý" : "Admin"})
                            </option>
                          ))}
                      </optgroup>
                      <optgroup label="CỘNG TÁC VIÊN (CTV)">
                        {collaborators
                          .filter((col) => col.status === "ACTIVE")
                          .map((col) => (
                            <option key={`m-col:${col.id}`} value={`collaborator:${col.id}`}>
                              🤝 CTV {col.fullName} ({col.publicReferralToken})
                            </option>
                          ))}
                      </optgroup>
                    </select>
                  ) : (
                    <div className="text-xs font-semibold text-slate-800">
                      {c.assignedTo?.name ? `👤 ${c.assignedTo.name}` : c.assignedCollaborator?.fullName ? `🤝 CTV ${c.assignedCollaborator.fullName}` : "⚠️ Chưa phân công"}
                    </div>
                  )}
                </div>

                {/* Action buttons on mobile */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <div className="text-[11px] text-slate-400 font-mono">
                    {new Date(c.updatedAt).toLocaleDateString("vi-VN")}
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/customers/${c.id}`}
                      className="px-3 py-1.5 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 text-xs font-bold border border-sky-200 transition min-h-[36px] flex items-center"
                    >
                      👁️ Chi tiết
                    </Link>
                    {isManagerUp && (
                      <button
                        onClick={() => setCustomerToDelete({ id: c.id, name: c.fullName })}
                        disabled={updatingId === c.id}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold border border-rose-200 transition min-h-[36px] flex items-center cursor-pointer"
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* UNIFIED DATA TABLE FOR DESKTOP (Hidden on mobile) */}
      <div className="mt-4 hidden md:block w-full max-w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-2xs custom-scrollbar">
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
                              .filter((u) => u.active && ["ADMIN", "MANAGER", "STAFF", "COLLABORATOR_PRO"].includes(u.role))
                              .map((u) => (
                                <option key={`user:${u.id}`} value={`user:${u.id}`}>
                                  👤 {u.name} ({u.role === "COLLABORATOR_PRO" ? "CTV Pro" : u.role === "STAFF" ? "Nhân viên" : u.role === "MANAGER" ? "Quản lý" : "Admin"})
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
                          onClick={() => setCustomerToDelete({ id: c.id, name: c.fullName })}
                          disabled={updatingId === c.id}
                          className="px-2.5 py-1 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 text-xs font-bold transition border border-red-200 cursor-pointer"
                          title="Xóa vĩnh viễn khách hàng này"
                        >
                          Xóa
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

      {/* MODAL THÊM KHÁCH HÀNG MỚI (CHỈ ADMIN & MANAGER) */}
      {showAddModal && isManagerUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg p-5 sm:p-6 space-y-4 my-auto max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 sticky top-0 bg-white z-10">
              <h3 className="font-display text-base sm:text-lg font-bold text-slate-900">➕ Thêm khách hàng mới</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100"
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
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    required
                    placeholder="VD: 0912345678"
                    className={`input w-full text-xs ${newForm.phone && validatePhone(newForm.phone) ? "!border-rose-500 !ring-rose-200 bg-rose-50/20" : ""}`}
                    value={newForm.phone}
                    onChange={(e) => setNewForm({ ...newForm, phone: sanitizePhoneInput(e.target.value) })}
                  />
                  {newForm.phone && validatePhone(newForm.phone) && (
                    <p className="mt-1 text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                      <span>⚠️</span>
                      <span>{validatePhone(newForm.phone)}</span>
                    </p>
                  )}
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
                      .filter((u) => u.active && ["ADMIN", "MANAGER", "STAFF", "COLLABORATOR_PRO"].includes(u.role))
                      .map((u) => (
                        <option key={`modal-user:${u.id}`} value={`user:${u.id}`}>
                          👤 {u.name} ({u.role === "COLLABORATOR_PRO" ? "CTV Pro" : u.role === "STAFF" ? "Nhân viên" : u.role === "MANAGER" ? "Quản lý" : "Admin"})
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
      {/* MODAL XÁC NHẬN XÓA KHÁCH HÀNG THAY THẾ WINDOW.CONFIRM */}
      <ConfirmModal
        isOpen={Boolean(customerToDelete)}
        title="Xác nhận xóa vĩnh viễn khách hàng"
        message={
          <div className="space-y-2.5">
            <p className="text-slate-700">
              Bạn có chắc chắn muốn <span className="font-bold text-rose-600">XÓA vĩnh viễn</span> khách hàng{" "}
              <strong className="text-slate-900 font-bold">"{customerToDelete?.name}"</strong> khỏi hệ thống?
            </p>
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-800 space-y-1">
              <div className="font-bold flex items-center gap-1">
                <span>⚠️</span>
                <span>Hành động này không thể hoàn tác!</span>
              </div>
              <div>Toàn bộ thông tin liên hệ, yêu cầu tư vấn và lịch sử chăm sóc của khách hàng sẽ bị xóa hoàn toàn.</div>
            </div>
          </div>
        }
        confirmText="Xác nhận xóa"
        cancelText="Hủy bỏ"
        variant="danger"
        isLoading={deletingCustomer}
        onConfirm={handleConfirmDeleteCustomer}
        onClose={() => setCustomerToDelete(null)}
      />
    </div>
  );
}

