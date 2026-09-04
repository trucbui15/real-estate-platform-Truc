"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { LABELS } from "@/lib/utils";

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();

  const [customer, setCustomer] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [assignFeedback, setAssignFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const isManagerUp = session && ["ADMIN", "MANAGER"].includes((session.user as any).role);

  async function load() {
    const res = await fetch(`/api/customers/${id}`);
    if (res.ok) setCustomer(await res.json());
    setLoading(false);
  }

  async function loadAssignees() {
    try {
      const [resUsers, resCols] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/collaborators"),
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
  }, [id, session]);

  async function handleAssign(selectedValue: string) {
    setAssigning(true);
    setAssignFeedback(null);

    let payload: any = { assigneeType: "UNASSIGNED", assigneeId: null };
    if (selectedValue.startsWith("user:")) {
      payload = { assigneeType: "USER", assigneeId: selectedValue.replace("user:", "") };
    } else if (selectedValue.startsWith("collaborator:")) {
      payload = { assigneeType: "COLLABORATOR", assigneeId: selectedValue.replace("collaborator:", "") };
    }

    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setAssigning(false);

      if (!res.ok) {
        setAssignFeedback({ type: "error", text: data.error || "Không thể phân công" });
        return;
      }

      const assignedName = data.assignedTo?.name
        ? `👤 ${data.assignedTo.name}`
        : data.assignedCollaborator?.fullName
        ? `🤝 CTV ${data.assignedCollaborator.fullName}`
        : null;

      setAssignFeedback({
        type: "success",
        text: assignedName
          ? `✓ Đã phân công cho ${assignedName}`
          : "✓ Đã đưa về trạng thái Chưa phân công",
      });

      load();
      setTimeout(() => setAssignFeedback(null), 4000);
    } catch (err) {
      setAssigning(false);
      setAssignFeedback({ type: "error", text: "Lỗi kết nối khi phân công" });
    }
  }

  async function changeStatus(status: string) {
    await fetch(`/api/customers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  async function addNote() {
    if (!note.trim()) return;
    await fetch(`/api/customers/${id}/activities`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "NOTE", content: note }),
    });
    setNote("");
    load();
  }

  async function handleDeleteCustomer() {
    if (!customer) return;
    if (!confirm(`Bạn có chắc chắn muốn XÓA vĩnh viễn khách hàng "${customer.fullName}" khỏi hệ thống? Hành động này không thể hoàn tác.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/customers/${id}`, { method: "DELETE" });
      if (res.ok) {
        alert("Đã xóa khách hàng thành công!");
        router.push("/dashboard/customers");
      } else {
        const data = await res.json();
        alert(data.error || "Không thể xóa khách hàng.");
      }
    } catch (e) {
      alert("Lỗi kết nối máy chủ khi xóa.");
    }
  }

  if (loading) return <div className="text-brand-300">Đang tải...</div>;
  if (!customer) return <div className="text-brand-300">Không tìm thấy khách hàng, hoặc bạn không có quyền xem.</div>;

  const currentSelectValue = customer.assignedToId
    ? `user:${customer.assignedToId}`
    : customer.assignedCollaboratorId
    ? `collaborator:${customer.assignedCollaboratorId}`
    : "UNASSIGNED";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={() => router.back()} className="text-sm font-semibold text-brand-600 hover:underline">
          ← Quay lại danh sách
        </button>

        {isManagerUp && (
          <button
            onClick={handleDeleteCustomer}
            className="px-3 py-1.5 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 text-xs font-bold transition border border-red-200 flex items-center gap-1"
          >
            <span>🗑️</span> Xóa khách hàng
          </button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="card p-6 space-y-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-brand-900">{customer.fullName}</h1>
            <div className="mt-1 text-sm text-brand-700 font-medium">
              📞 {customer.phone} {customer.email ? `· ✉️ ${customer.email}` : ""}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3 bg-sand-50 p-4 rounded-xl border border-sand-100">
            <div>
              <div className="text-xs font-semibold uppercase text-brand-400">Nhu cầu</div>
              <div className="font-medium text-brand-900 mt-0.5">
                {LABELS.demandType[customer.demandType as keyof typeof LABELS.demandType] || customer.demandType}
              </div>
            </div>

            {customer.project && (
              <div>
                <div className="text-xs font-semibold uppercase text-brand-400">Dự án ký gửi</div>
                <div className="font-semibold text-blue-600 mt-0.5">🏢 {customer.project.name}</div>
              </div>
            )}

            <div>
              <div className="text-xs font-semibold uppercase text-brand-400">Nguồn lead</div>
              <div className="font-medium text-brand-900 mt-0.5">
                {LABELS.leadSource[customer.source as keyof typeof LABELS.leadSource] || customer.source}
              </div>
              {customer.inquiries?.[0]?.collaborator && (
                <div className="text-xs font-bold text-emerald-700 mt-1 flex items-center gap-1">
                  <span>🤝</span>
                  <span>CTV {customer.inquiries[0].collaborator.fullName} ({customer.inquiries[0].collaborator.publicReferralToken})</span>
                </div>
              )}
            </div>

            {/* BẢNG PHÂN CÔNG NGƯỜI PHỤ TRÁCH */}
            <div className="col-span-2 sm:col-span-3 pt-2 border-t border-sand-200/60">
              <div className="text-xs font-semibold uppercase text-brand-400 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  👤 Người phụ trách chăm sóc
                  {assigning && <span className="text-blue-600 font-normal italic text-[11px]">(Đang lưu...)</span>}
                </span>
                {customer.assignedAt && (
                  <span className="text-[11px] text-slate-400 font-mono">
                    ⏰ Phân công lúc: {new Date(customer.assignedAt).toLocaleString("vi-VN")}
                  </span>
                )}
              </div>

              {isManagerUp ? (
                <div className="space-y-1.5 max-w-md">
                  <select
                    value={currentSelectValue}
                    disabled={assigning}
                    onChange={(e) => handleAssign(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 focus:border-blue-500 focus:outline-none cursor-pointer transition shadow-xs"
                  >
                    <option value="UNASSIGNED">-- ⚠️ Chưa phân công --</option>
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

                  {assignFeedback && (
                    <div
                      className={`text-xs font-medium ${
                        assignFeedback.type === "success" ? "text-emerald-700" : "text-rose-600"
                      }`}
                    >
                      {assignFeedback.text}
                    </div>
                  )}
                </div>
              ) : (
                <div className="font-semibold text-brand-900">
                  {customer.assignedTo?.name ? (
                    <span className="inline-flex items-center gap-1 text-slate-800">
                      👤 {customer.assignedTo.name}
                    </span>
                  ) : customer.assignedCollaborator?.fullName ? (
                    <span className="inline-flex items-center gap-1 text-emerald-800 font-bold">
                      🤝 CTV {customer.assignedCollaborator.fullName} ({customer.assignedCollaborator.publicReferralToken})
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold">
                      Chưa phân công
                    </span>
                  )}
                </div>
              )}
            </div>

            {customer.areaInterest && (
              <div>
                <div className="text-xs font-semibold uppercase text-brand-400">Khu vực quan tâm</div>
                <div className="font-medium text-brand-900 mt-0.5">{customer.areaInterest}</div>
              </div>
            )}

            {(customer.budgetFrom || customer.budgetTo) && (
              <div>
                <div className="text-xs font-semibold uppercase text-brand-400">Ngân sách</div>
                <div className="font-medium text-brand-900 mt-0.5">
                  {customer.budgetFrom || 0} - {customer.budgetTo || "?"} VNĐ
                </div>
              </div>
            )}
          </div>

          {customer.note && (
            <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200/80">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ghi chú ban đầu</div>
              <div className="text-sm text-slate-800 mt-1 whitespace-pre-line leading-relaxed">{customer.note}</div>
            </div>
          )}

          {/* LỊCH SỬ TẤT CẢ LẦN PHÁT SINH NHU CẦU (INQUIRY HISTORY) */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-bold text-slate-900">
                Lịch sử phát sinh nhu cầu ({customer.inquiries?.length || 0})
              </h2>
              <span className="text-xs font-semibold text-slate-500">
                Nguồn ban đầu: <strong className="text-blue-700">{customer.source}</strong>
              </span>
            </div>

            {customer.inquiries?.length === 0 ? (
              <div className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-lg border border-slate-100">
                Chưa ghi nhận lượt Inquiry nào.
              </div>
            ) : (
              <div className="space-y-3">
                {customer.inquiries?.map((inq: any) => (
                  <div
                    key={inq.id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {LABELS.demandType[inq.demandType as keyof typeof LABELS.demandType] || inq.demandType}
                        </span>
                        <span className="font-semibold text-slate-600">
                          Nguồn: <span className="text-blue-700 font-bold">{inq.source}</span>
                        </span>
                      </div>
                      <span className="text-slate-400 text-[11px] font-mono">
                        📅 {new Date(inq.createdAt).toLocaleString("vi-VN")}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                      {inq.listing && (
                        <div>
                          <span className="text-slate-400">Tin đăng:</span>{" "}
                          <strong className="text-slate-900">{inq.listing.title} ({inq.listing.unitCode})</strong>
                        </div>
                      )}
                      {inq.project && (
                        <div>
                          <span className="text-slate-400">Dự án:</span>{" "}
                          <strong className="text-slate-900">🏢 {inq.project.name}</strong>
                        </div>
                      )}
                    </div>

                    {/* CTV ATTRIBUTION INFO */}
                    {inq.collaborator ? (
                      <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
                        <div className="font-bold flex items-center gap-1">
                          <span>🤝 Nguồn từ CTV:</span>
                          <span className="text-emerald-800">{inq.collaborator.fullName}</span>
                          <code className="text-[11px] bg-white px-1.5 py-0.2 rounded border border-emerald-300 font-mono">
                            {inq.collaborator.publicReferralToken}
                          </code>
                        </div>
                        {inq.collaborator.referredByUser && (
                          <div className="text-[11px] text-emerald-700">
                            CTV thuộc quyền quản lý của Nhân sự:{" "}
                            <strong className="text-emerald-950">{inq.collaborator.referredByUser.name}</strong>{" "}
                            ({inq.collaborator.referredByUser.role})
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-400 italic">
                        Khách hàng liên hệ trực tiếp (Không qua CTV).
                      </div>
                    )}

                    {inq.note && (
                      <div className="text-slate-700 bg-white p-2 rounded border border-slate-200/80">
                        <span className="text-slate-400 font-bold">Nội dung / Ghi chú:</span> {inq.note}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="label font-bold text-sm text-slate-900 mb-2">Cập nhật trạng thái chăm sóc</div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(LABELS.leadStatus).map(([v, l]) => (
                <button
                  key={v}
                  onClick={() => changeStatus(v)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                    customer.status === v
                      ? "border-blue-600 bg-blue-50 text-blue-700 shadow-xs"
                      : "border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="card p-4 space-y-4">
          <div className="font-display text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
            Lịch sử chăm sóc
          </div>

          <div className="space-y-2">
            <textarea
              className="input text-xs"
              rows={3}
              placeholder="Nhập ghi chú cuộc gọi, buổi gặp..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <button onClick={addNote} className="btn-secondary w-full text-xs font-bold py-2">
              + Thêm ghi chú
            </button>
          </div>

          <div className="max-h-96 space-y-3 overflow-y-auto pt-1">
            {customer.activities?.length === 0 && (
              <div className="text-xs text-slate-400 italic text-center py-4">Chưa có lịch sử chăm sóc.</div>
            )}
            {customer.activities?.map((a: any) => (
              <div key={a.id} className="border-l-2 border-blue-500 pl-3 py-0.5 text-xs space-y-0.5">
                <div className="text-slate-800 font-medium whitespace-pre-line">{a.content}</div>
                <div className="text-[11px] text-slate-400">
                  {a.author?.name || "Hệ thống"} · {new Date(a.createdAt).toLocaleString("vi-VN")}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
