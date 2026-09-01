"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

const statusMeta: Record<string, { label: string; style: string }> = {
  MOI: { label: "MỚI TẠO", style: "bg-blue-100 text-blue-800 border-blue-200" },
  DANG_LIEN_HE: { label: "ĐANG TƯ VẤN", style: "bg-amber-100 text-amber-800 border-amber-200" },
  DA_HEN_GAP: { label: "ĐÃ HẸN LẠI", style: "bg-purple-100 text-purple-800 border-purple-200" },
  DA_CHOT: { label: "ĐÃ XÁC NHẬN / THÀNH CÔNG", style: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  KHONG_TIEM_NANG: { label: "KHÔNG THÀNH CÔNG", style: "bg-slate-100 text-slate-600 border-slate-200" },
};

export default function DashboardServicesPage() {
  const { data: session } = useSession();
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [tab, setTab] = useState<"ALL" | "BOOKING" | "VISA">("ALL");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (tab !== "ALL") qs.set("type", tab);
      if (keyword) qs.set("keyword", keyword);

      const res = await fetch(`/api/services-requests?${qs.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setInquiries(data);
      }
    } catch (e) {
      console.error("Lỗi tải danh sách Đặt phòng / Visa:", e);
    } finally {
      setLoading(false);
    }
  }

  async function loadAssignees() {
    try {
      const [resUsers, resCols] = await Promise.all([
        fetch("/api/users", { cache: "no-store" }),
        fetch("/api/collaborators?forAssign=true", { cache: "no-store" }),
      ]);
      if (resUsers.ok) setStaffList(await resUsers.json());
      if (resCols.ok) setCollaborators(await resCols.json());
    } catch (e) {
      console.error("Lỗi tải danh sách người phụ trách", e);
    }
  }

  useEffect(() => {
    if (session) {
      loadData();
      loadAssignees();
    }
  }, [session, tab]);

  async function handleStatusChange(customerId: string, newStatus: string) {
    setUpdatingId(customerId);
    try {
      const res = await fetch(`/api/customers/${customerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        loadData();
      } else {
        alert("Không thể cập nhật trạng thái");
      }
    } catch (e) {
      alert("Lỗi kết nối máy chủ");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleAssigneeChange(customerId: string, selectedValue: string) {
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
      if (res.ok) {
        loadData();
      } else {
        alert("Không thể phân công");
      }
    } catch (e) {
      alert("Lỗi kết nối máy chủ");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            {/* <span>🏨</span> */}
            <span>Quản Lý Đặt Phòng & Dịch Vụ Visa</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Theo dõi, xử lý & phân công nhanh các đơn book phòng căn hộ/homestay và đăng ký tư vấn Visa.
          </p>
        </div>
      </div>

      {/* TABS & SEARCH BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          {/* TABS */}
          <div className="flex gap-2">
            <button
              onClick={() => setTab("ALL")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${tab === "ALL"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
            >
              Tất cả ({inquiries.length})
            </button>
            <button
              onClick={() => setTab("BOOKING")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${tab === "BOOKING"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                }`}
            >
              <span>🏨</span>
              <span>Đặt phòng / Book phòng</span>
            </button>
            <button
              onClick={() => setTab("VISA")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${tab === "VISA"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                }`}
            >
              <span>🛂</span>
              <span>Dịch vụ Visa</span>
            </button>
          </div>

          {/* SEARCH FORM */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              loadData();
            }}
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <input
              type="text"
              placeholder="Tìm tên, SĐT khách..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full sm:w-64 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-600 outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Tìm kiếm
            </button>
          </form>
        </div>

        {/* INQUIRIES LIST */}
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500 font-medium">Đang tải dữ liệu Đặt phòng & Visa...</div>
        ) : inquiries.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <div className="text-3xl">📭</div>
            <div className="text-sm font-bold text-slate-700">Chưa có yêu cầu nào phù hợp</div>
            <div className="text-xs text-slate-500">Các yêu cầu từ form Đặt phòng & Visa public sẽ hiển thị tự động tại đây.</div>
          </div>
        ) : (
          <>
            {/* MOBILE CARD VIEW (Dành cho điện thoại < md) */}
            <div className="space-y-3 md:hidden">
              {inquiries.map((item) => {
                const isBooking = item.note?.includes("[ĐẶT PHÒNG");
                const isVisa = item.note?.includes("[DỊCH VỤ VISA");
                const cust = item.customer;
                const currentStatus = cust?.status || "MOI";
                const st = statusMeta[currentStatus] || statusMeta.MOI;

                let currentAssignee = "UNASSIGNED";
                if (cust?.assignedToId) currentAssignee = `user:${cust.assignedToId}`;
                else if (cust?.assignedCollaboratorId) currentAssignee = `collaborator:${cust.assignedCollaboratorId}`;

                return (
                  <div key={`m-svc-${item.id}`} className="card p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div>
                        {isBooking ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold">
                            🏢 Đặt phòng
                          </span>
                        ) : isVisa ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs font-bold">
                            🛂 Visa
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold">
                            📝 Dịch vụ
                          </span>
                        )}
                        <h3 className="font-bold text-slate-900 text-sm mt-1.5">{cust?.fullName || "Khách ẩn danh"}</h3>
                      </div>
                      <select
                        disabled={updatingId === cust?.id}
                        value={currentStatus}
                        onChange={(e) => handleStatusChange(cust.id, e.target.value)}
                        className={`px-2.5 py-1 rounded-xl border text-xs font-bold outline-none cursor-pointer ${st.style}`}
                      >
                        <option value="MOI">MỚI TẠO</option>
                        <option value="DANG_LIEN_HE">ĐANG TƯ VẤN</option>
                        <option value="DA_HEN_GAP">ĐÃ HẸN LẠI</option>
                        <option value="DA_CHOT">ĐÃ XÁC NHẬN</option>
                        <option value="KHONG_TIEM_NANG">KHÔNG THÀNH CÔNG</option>
                      </select>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl text-xs space-y-1">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Chi tiết yêu cầu</div>
                      <div className="text-slate-800 whitespace-pre-wrap leading-relaxed">
                        {item.note || "Khách yêu cầu tư vấn"}
                      </div>
                    </div>

                    {/* Phân công trên mobile */}
                    <div className="space-y-1">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Phân công chăm sóc:</div>
                      <select
                        disabled={updatingId === cust?.id}
                        value={currentAssignee}
                        onChange={(e) => handleAssigneeChange(cust.id, e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-800 outline-none min-h-[38px]"
                      >
                        <option value="UNASSIGNED">-- Chưa phân công --</option>
                        {staffList.length > 0 && (
                          <optgroup label="Nhân viên nội bộ">
                            {staffList.map((u) => (
                              <option key={u.id} value={`user:${u.id}`}>
                                👤 {u.name} ({u.role})
                              </option>
                            ))}
                          </optgroup>
                        )}
                        {collaborators.length > 0 && (
                          <optgroup label="Cộng tác viên (CTV)">
                            {collaborators.map((c) => (
                              <option key={c.id} value={`collaborator:${c.id}`}>
                                🤝 {c.fullName} ({c.phone})
                              </option>
                            ))}
                          </optgroup>
                        )}
                      </select>
                    </div>

                    {/* Footer with actions */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                      <div className="text-[11px] text-slate-400 font-mono">
                        {new Date(item.createdAt).toLocaleDateString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </div>
                      <div className="flex items-center gap-2">
                        {cust?.phone && (
                          <>
                            <a
                              href={`tel:${cust.phone}`}
                              className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition border border-emerald-200 text-xs font-bold flex items-center gap-1 min-h-[36px]"
                            >
                              <span>📞</span>
                              <span>Gọi ngay</span>
                            </a>
                            <a
                              href={`https://zalo.me/${cust.phone}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition border border-blue-200 text-xs font-bold flex items-center gap-1 min-h-[36px]"
                            >
                              <span>💬</span>
                              <span>Zalo</span>
                            </a>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* DESKTOP TABLE VIEW (Hidden on mobile) */}
            <div className="hidden md:block overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <th className="p-3">Loại dịch vụ</th>
                    <th className="p-3">Thông tin Khách hàng</th>
                    <th className="p-3">Chi tiết Yêu cầu / Ghi chú</th>
                    <th className="p-3">Thời gian</th>
                    <th className="p-3">Trạng thái</th>
                    <th className="p-3">Phân công chăm sóc</th>
                    <th className="p-3 text-right">Liên hệ nhanh</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {inquiries.map((item) => {
                    const isBooking = item.note?.includes("[ĐẶT PHÒNG");
                    const isVisa = item.note?.includes("[DỊCH VỤ VISA");
                    const cust = item.customer;
                    const currentStatus = cust?.status || "MOI";
                    const st = statusMeta[currentStatus] || statusMeta.MOI;

                    // Xác định người phụ trách
                    let currentAssignee = "UNASSIGNED";
                    if (cust?.assignedToId) currentAssignee = `user:${cust.assignedToId}`;
                    else if (cust?.assignedCollaboratorId) currentAssignee = `collaborator:${cust.assignedCollaboratorId}`;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition">
                        {/* LOẠI DỊCH VỤ */}
                        <td className="p-3">
                          {isBooking ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 border border-blue-200 font-bold">
                              🏢 Đặt phòng
                            </span>
                          ) : isVisa ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-800 border border-indigo-200 font-bold">
                              🛂 Visa
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 font-bold">
                              📝 Dịch vụ
                            </span>
                          )}
                        </td>

                        {/* KHÁCH HÀNG */}
                        <td className="p-3 space-y-0.5">
                          <div className="font-bold text-slate-900 text-sm">{cust?.fullName || "Khách ẩn danh"}</div>
                          <div className="font-mono text-slate-600 font-semibold">{cust?.phone}</div>
                          {cust?.email && <div className="text-[11px] text-slate-400">{cust.email}</div>}
                        </td>

                        {/* CHI TIẾT GHI CHÚ */}
                        <td className="p-3 max-w-xs">
                          <div className="text-slate-800 font-normal leading-relaxed whitespace-pre-wrap line-clamp-3">
                            {item.note || "Khách yêu cầu tư vấn"}
                          </div>
                        </td>

                        {/* THỜI GIAN */}
                        <td className="p-3 text-slate-500 whitespace-nowrap">
                          {new Date(item.createdAt).toLocaleDateString("vi-VN", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>

                        {/* TRẠNG THÁI */}
                        <td className="p-3">
                          <select
                            disabled={updatingId === cust?.id}
                            value={currentStatus}
                            onChange={(e) => handleStatusChange(cust.id, e.target.value)}
                            className={`px-2 py-1 rounded-lg border text-xs font-bold outline-none cursor-pointer ${st.style}`}
                          >
                            <option value="MOI">MỚI TẠO</option>
                            <option value="DANG_LIEN_HE">ĐANG TƯ VẤN</option>
                            <option value="DA_HEN_GAP">ĐÃ HẸN LẠI</option>
                            <option value="DA_CHOT">ĐÃ XÁC NHẬN / CHỐT</option>
                            <option value="KHONG_TIEM_NANG">KHÔNG THÀNH CÔNG</option>
                          </select>
                        </td>

                        {/* PHÂN CÔNG */}
                        <td className="p-3">
                          <select
                            disabled={updatingId === cust?.id}
                            value={currentAssignee}
                            onChange={(e) => handleAssigneeChange(cust.id, e.target.value)}
                            className="w-full px-2 py-1 text-xs rounded-lg border border-slate-200 bg-white font-medium text-slate-800 outline-none"
                          >
                            <option value="UNASSIGNED">-- Chưa phân công --</option>
                            {staffList.length > 0 && (
                              <optgroup label="Nhân viên nội bộ">
                                {staffList.map((u) => (
                                  <option key={u.id} value={`user:${u.id}`}>
                                    👤 {u.name} ({u.role})
                                  </option>
                                ))}
                              </optgroup>
                            )}
                            {collaborators.length > 0 && (
                              <optgroup label="Cộng tác viên (CTV)">
                                {collaborators.map((c) => (
                                  <option key={c.id} value={`collaborator:${c.id}`}>
                                    🤝 {c.fullName} ({c.phone})
                                  </option>
                                ))}
                              </optgroup>
                            )}
                          </select>
                        </td>

                        {/* NÚT LIÊN HỆ */}
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <a
                              href={`tel:${cust?.phone}`}
                              className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition border border-emerald-200 text-xs font-bold flex items-center gap-1"
                              title="Gọi điện"
                            >
                              <span>📞</span>
                              <span className="hidden xl:inline">Gọi</span>
                            </a>
                            <a
                              href={`https://zalo.me/${cust?.phone}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition border border-blue-200 text-xs font-bold flex items-center gap-1"
                              title="Mở Zalo"
                            >
                              <span>💬</span>
                              <span className="hidden xl:inline">Zalo</span>
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
