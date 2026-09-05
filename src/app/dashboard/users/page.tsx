"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { validatePhone, sanitizePhoneInput } from "@/lib/utils";
import { ROLE_LABELS } from "@/lib/permissions";

const roleLabel: Record<string, string> = {
  ADMIN: "Quản trị",
  MANAGER: "Quản lý",
  STAFF: "Nhân viên",
  COLLABORATOR_PRO: "CTV Pro",
  CUSTOMER: "Khách hàng",
};

export default function UsersPage() {
  const { data: session } = useSession();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", role: "STAFF", referralCode: "" });

  // Reset Password Modal State
  const [resetModalUser, setResetModalUser] = useState<any | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  // Delete Modal State
  const [deleteModalUser, setDeleteModalUser] = useState<any | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const currentUserId = (session?.user as any)?.id;
  const isAdmin = (session?.user as any)?.role === "ADMIN";

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/users?all=true", { cache: "no-store" });
      if (res.ok) setItems(await res.json());
    } catch (e) {
      console.error("Lỗi khi tải danh sách người dùng", e);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (session) load();
  }, [session]);

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.phone && form.phone.trim()) {
      const phoneError = validatePhone(form.phone);
      if (phoneError) {
        setError(phoneError);
        return;
      }
    }

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      let data: any = {};
      try {
        data = await res.json();
      } catch (err) {}

      if (!res.ok) {
        setError(data.error || `Tạo tài khoản thất bại (Mã lỗi: ${res.status})`);
        return;
      }
      setSuccess("Tạo tài khoản mới thành công!");
      setShowCreateModal(false);
      setForm({ name: "", email: "", phone: "", password: "", role: "STAFF", referralCode: "" });
      load();
    } catch (err: any) {
      setError(err.message || "Lỗi kết nối máy chủ khi tạo tài khoản.");
    }
  }

  async function toggleActive(id: string, active: boolean) {
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !active }),
      });
      if (res.ok) {
        setSuccess(`Đã ${!active ? "mở khóa" : "khóa"} tài khoản.`);
        load();
      }
    } catch (e: any) {
      setError(e.message || "Lỗi khi cập nhật trạng thái");
    }
  }

  async function updateRole(id: string, newRole: string) {
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Không thể cập nhật vai trò");
        return;
      }
      const label = roleLabel[newRole] || newRole;
      setSuccess(`Đã cập nhật vai trò tài khoản thành công sang "${label}"!`);
      load();
    } catch (err: any) {
      setError(err.message || "Lỗi khi cập nhật vai trò");
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!resetModalUser || !newPassword || newPassword.length < 6) return;
    setResetLoading(true);
    const res = await fetch(`/api/users/${resetModalUser.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: newPassword }),
    });
    setResetLoading(false);
    if (res.ok) {
      setSuccess(`Đã đặt lại mật khẩu cho tài khoản ${resetModalUser.email}`);
      setResetModalUser(null);
      setNewPassword("");
    }
  }

  async function handleDeleteUser() {
    if (!deleteModalUser) return;
    setDeleteLoading(true);
    const res = await fetch(`/api/users/${deleteModalUser.id}`, {
      method: "DELETE",
    });
    setDeleteLoading(false);
    if (res.ok) {
      const data = await res.json();
      setSuccess(data.message || `Đã xóa tài khoản ${deleteModalUser.email}`);
      setDeleteModalUser(null);
      load();
    }
  }

  // Counts for quick stats
  const totalCount = items.length;
  const internalCount = items.filter((u) => ["ADMIN", "MANAGER", "STAFF", "COLLABORATOR_PRO"].includes(u.role)).length;
  const customerCount = items.filter((u) => u.role === "CUSTOMER").length;

  const filteredItems = items.filter((u) => {
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      (u.phone && u.phone.includes(q)) ||
      (u.referralCode && u.referralCode.toLowerCase().includes(q));

    let matchesRole = true;
    if (roleFilter === "INTERNAL") {
      matchesRole = ["ADMIN", "MANAGER", "STAFF", "COLLABORATOR_PRO"].includes(u.role);
    } else if (roleFilter && roleFilter !== "ALL") {
      matchesRole = u.role === roleFilter;
    }
    return matchesSearch && matchesRole;
  });

  if (!isAdmin) {
    return <div className="card p-6 text-[#64748B]">Chỉ Quản trị hệ thống (Admin) mới có quyền truy cập trang này.</div>;
  }

  return (
    <div className="space-y-6">
      {/* HEADER ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
        <div>
          <h1 className="text-[22px] font-bold text-[#0F172A]">Quản lý Tài khoản Hệ thống</h1>
          <p className="mt-1 text-[14px] text-[#64748B]">
            Quản lý danh sách, tạo mới, phân quyền vai trò và bảo mật tài khoản cho toàn bộ người dùng & nhân sự.
          </p>
        </div>

        <button
          onClick={() => {
            setError("");
            setShowCreateModal(true);
          }}
          className="btn-primary text-[14px] shrink-0 gap-2"
        >
          <span>+ Tạo tài khoản mới</span>
        </button>
      </div>

      {/* NOTIFICATION NOTICES */}
      {error && (
        <div className="rounded-xl bg-[#FEF2F2] border border-[#FCA5A5] p-4 text-[14px] font-medium text-[#991B1B] flex justify-between items-center shadow-sm">
          <span>⚠️ {error}</span>
          <button onClick={() => setError("")} className="text-[#991B1B] hover:underline font-bold">✕</button>
        </div>
      )}
      {success && (
        <div className="rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] p-4 text-[14px] font-medium text-[#065F46] flex justify-between items-center shadow-sm">
          <span>✓ {success}</span>
          <button onClick={() => setSuccess("")} className="text-[#065F46] hover:underline font-bold">✕</button>
        </div>
      )}

      {/* STATS & QUICK FILTER TABS */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setRoleFilter("")}
          className={`px-3.5 py-1.5 rounded-xl text-[13px] font-semibold transition border ${
            roleFilter === "" || roleFilter === "ALL"
              ? "bg-[#0F172A] text-white border-[#0F172A] shadow-sm"
              : "bg-white text-[#64748B] border-[#E2E8F0] hover:bg-[#F8FAFC]"
          }`}
        >
          Tất cả tài khoản ({totalCount})
        </button>
        <button
          type="button"
          onClick={() => setRoleFilter("INTERNAL")}
          className={`px-3.5 py-1.5 rounded-xl text-[13px] font-semibold transition border ${
            roleFilter === "INTERNAL"
              ? "bg-[#2563EB] text-white border-[#2563EB] shadow-sm"
              : "bg-white text-[#64748B] border-[#E2E8F0] hover:bg-[#F8FAFC]"
          }`}
        >
          Tài khoản nội bộ ({internalCount})
        </button>
        <button
          type="button"
          onClick={() => setRoleFilter("CUSTOMER")}
          className={`px-3.5 py-1.5 rounded-xl text-[13px] font-semibold transition border ${
            roleFilter === "CUSTOMER"
              ? "bg-[#D97706] text-white border-[#D97706] shadow-sm"
              : "bg-white text-[#64748B] border-[#E2E8F0] hover:bg-[#F8FAFC]"
          }`}
        >
          Khách hàng ({customerCount})
        </button>
      </div>

      {/* SEARCH AND FILTER CONTROL ROW */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#E2E8F0] shadow-sm">
        <div className="relative flex-1 w-full max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên, email, SĐT hoặc Ref..."
            className="input !h-[42px] pl-9"
          />
          <svg className="w-4 h-4 text-[#94A3B8] absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-[42px] px-3.5 rounded-xl border border-[#E2E8F0] bg-white text-[14px] font-medium text-[#0F172A] outline-none"
          >
            <option value="">Tất cả vai trò</option>
            <option value="INTERNAL">Tài khoản nội bộ (Admin, QL, NV, CTV)</option>
            <option value="ADMIN">Quản trị (ADMIN)</option>
            <option value="MANAGER">Quản lý (MANAGER)</option>
            <option value="STAFF">Nhân viên (STAFF)</option>
            <option value="COLLABORATOR_PRO">CTV Pro (COLLABORATOR_PRO)</option>
            <option value="CUSTOMER">Khách hàng (CUSTOMER)</option>
          </select>

          <span className="text-[13px] font-semibold text-[#64748B] whitespace-nowrap bg-[#F8FAFC] px-3 py-2 rounded-xl border border-[#E2E8F0]">
            Hiển thị: {filteredItems.length} tài khoản
          </span>
        </div>
      </div>

      {/* FULL WIDTH SPACIOUS USERS TABLE */}
      <div className="overflow-x-auto custom-scrollbar rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
        <table className="w-full min-w-[850px] text-left text-[14px]">
          <thead className="bg-[#F8FAFC] text-[13px] font-semibold text-[#64748B] border-b border-[#E2E8F0]">
            <tr>
              <th className="px-5 py-4 whitespace-nowrap">Họ tên</th>
              <th className="px-5 py-4 whitespace-nowrap">Email & SĐT</th>
              <th className="px-5 py-4 whitespace-nowrap">Mã giới thiệu (Ref)</th>
              <th className="px-5 py-4 whitespace-nowrap">Vai trò hệ thống</th>
              <th className="px-5 py-4 whitespace-nowrap">Trạng thái</th>
              <th className="px-5 py-4 whitespace-nowrap">Ngày tạo</th>
              <th className="px-5 py-4 text-right whitespace-nowrap">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F5F9]">
            {loading ? (
              <tr><td colSpan={7} className="px-5 py-10 text-center text-[#94A3B8]">Đang tải danh sách tài khoản...</td></tr>
            ) : filteredItems.length === 0 ? (
              <tr><td colSpan={7} className="px-5 py-10 text-center text-[#94A3B8]">Không tìm thấy tài khoản phù hợp.</td></tr>
            ) : (
              filteredItems.map((u) => (
                <tr key={u.id} className="hover:bg-[#F8FAFC] transition">
                  <td className="px-5 py-4 font-bold text-[#0F172A] whitespace-nowrap">
                    <div>{u.name}</div>
                    {u.role === "CUSTOMER" && (
                      <span className="inline-block mt-0.5 text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded">
                        Khách hàng
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-[#64748B] whitespace-nowrap">
                    <div className="font-medium text-[#1E293B]">{u.email}</div>
                    <div className="text-xs text-slate-400">{u.phone || "—"}</div>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    {u.referralCode ? (
                      <code className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded font-mono">
                        {u.referralCode}
                      </code>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <select
                      value={u.role}
                      onChange={(e) => updateRole(u.id, e.target.value)}
                      className={`rounded-xl border px-3 py-1.5 text-[13px] font-semibold outline-none focus:border-[#4F46E5] cursor-pointer shadow-sm ${
                        u.role === "CUSTOMER"
                          ? "border-amber-300 bg-amber-50/70 text-amber-900"
                          : u.role === "ADMIN"
                          ? "border-purple-200 bg-purple-50 text-purple-900"
                          : u.role === "MANAGER"
                          ? "border-indigo-200 bg-indigo-50 text-indigo-900"
                          : u.role === "COLLABORATOR_PRO"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                          : "border-[#E2E8F0] bg-white text-[#0F172A]"
                      }`}
                    >
                      <option value="ADMIN">Quản trị (ADMIN)</option>
                      <option value="MANAGER">Quản lý (MANAGER)</option>
                      <option value="STAFF">Nhân viên (STAFF)</option>
                      <option value="COLLABORATOR_PRO">CTV Pro (COLLABORATOR_PRO)</option>
                      <option value="CUSTOMER">Khách hàng (CUSTOMER)</option>
                    </select>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[12px] font-semibold ${
                      u.active ? "bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]" : "bg-[#FEF2F2] text-[#991B1B] border border-[#FCA5A5]"
                    }`}>
                      {u.active ? "● Hoạt động" : "🔒 Đã khóa"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-[13px] text-[#64748B] whitespace-nowrap">
                    {new Date(u.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-5 py-4 text-right whitespace-nowrap space-x-3">
                    <button
                      onClick={() => setResetModalUser(u)}
                      className="text-[13px] font-semibold text-[#4F46E5] hover:underline"
                    >
                      Đổi mật khẩu
                    </button>
                    <button
                      onClick={() => toggleActive(u.id, u.active)}
                      className={`text-[13px] font-semibold ${u.active ? "text-[#D97706] hover:underline" : "text-[#10B981] hover:underline"}`}
                    >
                      {u.active ? "Khóa" : "Mở khóa"}
                    </button>
                    {currentUserId !== u.id && (
                      <button
                        onClick={() => setDeleteModalUser(u)}
                        className="text-[13px] font-semibold text-[#EF4444] hover:underline"
                      >
                        Xóa
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* CREATE USER MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-3">
              <h3 className="text-[18px] font-bold text-[#0F172A]">+ Tạo tài khoản mới</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-[#64748B] hover:text-[#0F172A] text-lg">✕</button>
            </div>

            {error && <div className="rounded-xl bg-[#FEF2F2] border border-[#FCA5A5] p-3.5 text-[13px] text-[#991B1B] font-medium">{error}</div>}

            <form onSubmit={createUser} className="space-y-3.5">
              <div>
                <label className="label">Họ và tên *</label>
                <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="VD: Nguyễn Văn A" />
              </div>
              <div>
                <label className="label">Email đăng nhập *</label>
                <input className="input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="VD: email@minhdungland.com" />
              </div>
              <div>
                <label className="label">Số điện thoại</label>
                <input
                  className={`input ${form.phone && validatePhone(form.phone) ? "!border-rose-500 !ring-rose-200 bg-rose-50/20" : ""}`}
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: sanitizePhoneInput(e.target.value) })}
                  placeholder="VD: 0912345678"
                />
                {form.phone && validatePhone(form.phone) && (
                  <p className="mt-1 text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                    <span>⚠️</span>
                    <span>{validatePhone(form.phone)}</span>
                  </p>
                )}
              </div>
              <div>
                <label className="label">Mật khẩu khởi tạo *</label>
                <input className="input" type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Tối thiểu 6 ký tự" />
              </div>
              <div>
                <label className="label">Mã giới thiệu (Ref) — Tùy chỉnh (Tự tạo nếu để trống)</label>
                <input className="input uppercase" value={form.referralCode} onChange={(e) => setForm({ ...form, referralCode: e.target.value })} placeholder="VD: MD_TRUC, MD_DUNG, MD_01..." />
              </div>
              <div>
                <label className="label">Vai trò hệ thống *</label>
                <select className="input font-medium cursor-pointer" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option value="STAFF">Nhân viên (STAFF)</option>
                  <option value="COLLABORATOR_PRO">CTV Pro (COLLABORATOR_PRO)</option>
                  <option value="MANAGER">Quản lý (MANAGER)</option>
                  <option value="ADMIN">Quản trị (ADMIN)</option>
                  <option value="CUSTOMER">Khách hàng (CUSTOMER)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-outline flex-1 text-[14px]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1 text-[14px]"
                >
                  Tạo tài khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {resetModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-3">
              <h3 className="text-[16px] font-bold text-[#0F172A]">Đặt lại mật khẩu</h3>
              <button onClick={() => setResetModalUser(null)} className="text-[#64748B] hover:text-[#0F172A]">✕</button>
            </div>

            <p className="text-[14px] text-[#64748B]">
              Đặt mật khẩu mới cho tài khoản <strong className="text-[#0F172A]">{resetModalUser.email}</strong> ({resetModalUser.name}).
            </p>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="label">Mật khẩu mới</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input"
                  placeholder="Tối thiểu 6 ký tự"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setResetModalUser(null)}
                  className="btn-outline flex-1 text-[14px]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="btn-primary flex-1 text-[14px]"
                >
                  {resetLoading ? "Đang xử lý..." : "Cập nhật mật khẩu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-3">
              <h3 className="text-[16px] font-bold text-[#EF4444]">Xác nhận xóa tài khoản</h3>
              <button onClick={() => setDeleteModalUser(null)} className="text-[#64748B] hover:text-[#0F172A]">✕</button>
            </div>

            <p className="text-[14px] text-[#64748B] leading-relaxed">
              Bạn có chắc chắn muốn xóa tài khoản <strong className="text-[#0F172A]">{deleteModalUser.name}</strong> ({deleteModalUser.email}) khỏi hệ thống?
            </p>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalUser(null)}
                className="btn-outline flex-1 text-[14px]"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                disabled={deleteLoading}
                className="bg-[#EF4444] hover:bg-[#DC2626] text-white font-semibold rounded-xl px-5 py-2.5 text-[14px] flex-1 transition"
              >
                {deleteLoading ? "Đang xóa..." : "Xóa vĩnh viễn"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
