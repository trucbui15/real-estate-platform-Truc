"use client";
import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { LABELS, validatePhone, sanitizePhoneInput } from "@/lib/utils";
import ProjectSelect from "@/components/ProjectSelect";

function KyGuiContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const projectParam = searchParams.get("project");
  const typeParam = searchParams.get("type");

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    demandType: typeParam === "RENT" ? "KY_GUI_CHO_THUE" : "KY_GUI_BAN",
    propertyTypeInterest: "CAN_HO",
    provinceId: "",
    projectId: "",
    areaInterest: "",
    budgetFrom: "",
    budgetTo: "",
    note: "",
  });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [projectError, setProjectError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function prefillProject() {
      if (!projectParam) return;
      try {
        const res = await fetch("/api/projects");
        if (res.ok) {
          const projects = await res.json();
          const match = projects.find((p: any) => p.slug === projectParam || p.id === projectParam);
          if (match) {
            setForm((f) => ({ ...f, projectId: match.id }));
          }
        }
      } catch (err) { }
    }
    prefillProject();
  }, [projectParam]);

  useEffect(() => {
    if (session?.user) {
      setForm((f) => ({
        ...f,
        fullName: f.fullName || session.user.name || "",
        phone: f.phone || (session.user as any).phone || "",
        email: f.email || session.user.email || "",
      }));

      if (!(session.user as any).phone) {
        fetch("/api/me")
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data?.phone) {
              setForm((f) => ({ ...f, phone: f.phone || data.phone }));
            }
          })
          .catch(() => { });
      }
    }
  }, [session]);


  const apartmentTypes = ["CAN_HO", "OFFICETEL", "CONDOTEL", "PENTHOUSE", "DUPLEX", "SHOPHOUSE_KHOI_DE", "DAT_NEN_DU_AN"];
  const isApartment = apartmentTypes.includes(form.propertyTypeInterest);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setProjectError("");

    if (!form.fullName.trim()) {
      setError("Vui lòng nhập họ và tên.");
      return;
    }

    const phoneError = validatePhone(form.phone);
    if (phoneError) {
      setError(phoneError);
      return;
    }

    if (isApartment && (!form.projectId || form.projectId === "NONE")) {
      setProjectError("Vui lòng chọn dự án đối với loại hình căn hộ/chung cư.");
      return;
    }

    setLoading(true);
    const refToken = typeof window !== "undefined" ? sessionStorage.getItem("md_public_ref_token") : null;
    const res = await fetch("/api/ky-gui", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        refToken,
        pageUrl: typeof window !== "undefined" ? window.location.href : null,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Có lỗi xảy ra");
      return;
    }
    setSent(true);
  }

  return (
    <div className="container-page py-12">
      <div className="mx-auto max-w-xl">
        <h1 className="font-display text-2xl font-semibold text-brand-900">Ký gửi bất động sản</h1>
        <p className="mt-2 text-brand-700">
          Gửi thông tin bất động sản bạn muốn bán hoặc cho thuê - đội ngũ tư vấn Minh Dũng Land sẽ liên hệ trong 24h.
        </p>

        {sent ? (
          <div className="card mt-6 p-6 text-center text-emerald-800 bg-emerald-50 border-emerald-200">
            ✓ Cảm ơn bạn! Yêu cầu ký gửi đã được ghi nhận, chúng tôi sẽ liên hệ kiểm tra căn hộ và hỗ trợ bạn trong thời gian sớm nhất.
          </div>
        ) : (
          <form onSubmit={submit} className="card mt-6 space-y-4 p-6">
            {error && <div className="rounded bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}

            <div>
              <label className="label">Họ và tên *</label>
              <input className="input" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="label">Số điện thoại *</label>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="VD: 0912345678"
                  className={`input ${form.phone && validatePhone(form.phone) ? "!border-rose-500 !ring-rose-200 bg-rose-50/20" : ""}`}
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: sanitizePhoneInput(e.target.value) })}
                />
                {form.phone && validatePhone(form.phone) && (
                  <p className="mt-1.5 text-xs text-rose-600 font-semibold flex items-center gap-1">
                    <span>⚠️</span>
                    <span>{validatePhone(form.phone)}</span>
                  </p>
                )}
              </div>
              <div>
                <label className="label">Email</label>
                <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="label">Nhu cầu *</label>
              <select className="input" value={form.demandType} onChange={(e) => setForm({ ...form, demandType: e.target.value })}>
                <option value="KY_GUI_BAN">Ký gửi bán</option>
                <option value="KY_GUI_CHO_THUE">Ký gửi cho thuê</option>
              </select>
            </div>

            <div>
              <label className="label">Loại bất động sản *</label>
              <select
                className="input"
                value={form.propertyTypeInterest}
                onChange={(e) => {
                  const newType = e.target.value;
                  setForm({ ...form, propertyTypeInterest: newType });
                  setProjectError("");
                }}
              >
                {Object.entries(LABELS.propertyType).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">
                Dự án {isApartment ? <span className="text-red-500">*</span> : "(nếu có)"}
              </label>
              <ProjectSelect
                value={form.projectId}
                onChange={(pId) => {
                  setForm({ ...form, projectId: pId });
                  setProjectError("");
                }}
                provinceId={form.provinceId}
                allowNoProject={!isApartment}
                placeholder="Chọn hoặc tìm dự án..."
                error={projectError}
              />
            </div>

            <div>
              <label className="label">Khu vực / Chi tiết địa chỉ</label>
              <input className="input" placeholder="VD: Quy Nhơn, Bình Định" value={form.areaInterest} onChange={(e) => setForm({ ...form, areaInterest: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Mức giá mong muốn từ (VNĐ)</label>
                <input type="number" className="input" value={form.budgetFrom} onChange={(e) => setForm({ ...form, budgetFrom: e.target.value })} />
              </div>
              <div>
                <label className="label">đến (VNĐ)</label>
                <input type="number" className="input" value={form.budgetTo} onChange={(e) => setForm({ ...form, budgetTo: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="label">Ghi chú</label>
              <textarea className="input" rows={3} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
            </div>

            <button disabled={loading} className="btn-primary w-full">
              {loading ? "Đang gửi..." : "Gửi yêu cầu ký gửi"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function KyGuiPage() {
  return (
    <Suspense>
      <KyGuiContent />
    </Suspense>
  );
}


