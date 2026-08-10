"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LABELS } from "@/lib/utils";
import ProjectSelect from "@/components/ProjectSelect";

const initial = {
  unitCode: "",
  title: "",
  projectId: "",
  block: "",
  floor: "",
  address: "",
  provinceId: "",
  transactionType: "SALE",
  salePrice: "",
  rentPrice: "",
  propertyType: "CAN_HO",
  area: "",
  bedrooms: "",
  bathrooms: "",
  doorDirection: "",
  balconyDirection: "",
  view: "",
  furnitureStatus: "",
  legalStatus: "",
  unitStatus: "DANG_BAN",
  description: "",
  imagesText: "", // 1 URL / dòng
};

export default function ListingForm({
  listingId,
  defaultValues,
}: {
  listingId?: string;
  defaultValues?: Partial<typeof initial>;
}) {
  const router = useRouter();
  const [form, setForm] = useState({ ...initial, ...defaultValues });
  const [provinces, setProvinces] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [projectError, setProjectError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadProvinces() {
      try {
        const res = await fetch("/api/projects");
        if (res.ok) {
          const projects = await res.json();
          // Extract unique provinces if any or fetch from API
        }
      } catch (err) {}
    }
    loadProvinces();
  }, []);

  function set(k: keyof typeof initial, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  const apartmentTypes = ["CAN_HO", "OFFICETEL", "CONDOTEL", "PENTHOUSE", "DUPLEX", "SHOPHOUSE_KHOI_DE", "DAT_NEN_DU_AN"];
  const isApartment = apartmentTypes.includes(form.propertyType);

  const imageUrls = form.imagesText.split("\n").map((s) => s.trim()).filter(Boolean);

  function setImageUrls(urls: string[]) {
    set("imagesText", urls.join("\n"));
  }

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError("");
    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || `Upload "${file.name}" thất bại`);
        continue;
      }
      uploaded.push(data.url);
    }
    if (uploaded.length) setImageUrls([...imageUrls, ...uploaded]);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeImage(url: string) {
    setImageUrls(imageUrls.filter((u) => u !== url));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setProjectError("");

    if (isApartment && (!form.projectId || form.projectId === "NONE")) {
      setProjectError("Vui lòng chọn dự án cho loại hình căn hộ/chung cư");
      return;
    }

    setLoading(true);

    const payload = {
      ...form,
      images: form.imagesText.split("\n").map((s) => s.trim()).filter(Boolean),
    };

    const res = await fetch(listingId ? `/api/listings/${listingId}` : "/api/listings", {
      method: listingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Có lỗi xảy ra");
      return;
    }
    router.push("/dashboard/listings");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="card space-y-4 p-6">
      {error && <div className="rounded bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Mã căn *</label>
          <input className="input" required disabled={!!listingId} value={form.unitCode} onChange={(e) => set("unitCode", e.target.value)} />
        </div>
        <div>
          <label className="label">Loại giao dịch *</label>
          <select className="input" value={form.transactionType} onChange={(e) => set("transactionType", e.target.value)}>
            <option value="SALE">Bán</option>
            <option value="RENT">Cho thuê</option>
          </select>
        </div>
      </div>

      <div>
        <label className="label">Tiêu đề tin đăng *</label>
        <input className="input" required value={form.title} onChange={(e) => set("title", e.target.value)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Loại BĐS *</label>
          <select
            className="input"
            value={form.propertyType}
            onChange={(e) => {
              set("propertyType", e.target.value);
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
            onChange={(pId, proj) => {
              set("projectId", pId);
              if (proj?.provinceId) {
                set("provinceId", proj.provinceId);
              }
              setProjectError("");
            }}
            provinceId={form.provinceId}
            allowNoProject={!isApartment}
            placeholder="Chọn hoặc tìm dự án..."
            error={projectError}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label">Tòa</label>
          <input className="input" value={form.block} onChange={(e) => set("block", e.target.value)} />
        </div>
        <div>
          <label className="label">Tầng</label>
          <input className="input" value={form.floor} onChange={(e) => set("floor", e.target.value)} />
        </div>
        <div>
          <label className="label">Diện tích (m²) *</label>
          <input type="number" step="0.1" className="input" required value={form.area} onChange={(e) => set("area", e.target.value)} />
        </div>
      </div>

      <div>
        <label className="label">Địa chỉ</label>
        <input className="input" value={form.address} onChange={(e) => set("address", e.target.value)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Giá bán (VNĐ)</label>
          <input type="number" className="input" value={form.salePrice} onChange={(e) => set("salePrice", e.target.value)} />
        </div>
        <div>
          <label className="label">Giá thuê (VNĐ/tháng)</label>
          <input type="number" className="input" value={form.rentPrice} onChange={(e) => set("rentPrice", e.target.value)} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Số phòng ngủ</label>
          <input type="number" className="input" value={form.bedrooms} onChange={(e) => set("bedrooms", e.target.value)} />
        </div>
        <div>
          <label className="label">Số nhà vệ sinh</label>
          <input type="number" className="input" value={form.bathrooms} onChange={(e) => set("bathrooms", e.target.value)} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label">Hướng cửa</label>
          <select className="input" value={form.doorDirection} onChange={(e) => set("doorDirection", e.target.value)}>
            <option value="">-- Chọn --</option>
            {Object.entries(LABELS.direction).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Hướng ban công</label>
          <select className="input" value={form.balconyDirection} onChange={(e) => set("balconyDirection", e.target.value)}>
            <option value="">-- Chọn --</option>
            {Object.entries(LABELS.direction).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="label">View</label>
          <input className="input" placeholder="VD: View sông, View biển" value={form.view} onChange={(e) => set("view", e.target.value)} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label">Tình trạng nội thất</label>
          <select className="input" value={form.furnitureStatus} onChange={(e) => set("furnitureStatus", e.target.value)}>
            <option value="">-- Chọn --</option>
            {Object.entries(LABELS.furnitureStatus).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Pháp lý</label>
          <select className="input" value={form.legalStatus} onChange={(e) => set("legalStatus", e.target.value)}>
            <option value="">-- Chọn --</option>
            {Object.entries(LABELS.legalStatus).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Trạng thái căn</label>
          <select className="input" value={form.unitStatus} onChange={(e) => set("unitStatus", e.target.value)}>
            {Object.entries(LABELS.unitStatus).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="label">Mô tả chi tiết</label>
        <textarea className="input" rows={5} value={form.description} onChange={(e) => set("description", e.target.value)} />
      </div>

      <div>
        <label className="label">Hình ảnh</label>

        {imageUrls.length > 0 && (
          <div className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {imageUrls.map((url) => (
              // eslint-disable-next-line @next/next/no-img-element
              <div key={url} className="group relative overflow-hidden rounded-md border border-sand-100">
                <img src={url} alt="" className="h-24 w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="absolute right-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-xs text-white opacity-0 transition group-hover:opacity-100"
                >
                  Xoá
                </button>
              </div>
            ))}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          multiple
          onChange={(e) => handleUpload(e.target.files)}
          className="input cursor-pointer"
        />
        {uploading && <p className="mt-1 text-xs text-brand-500">Đang tải ảnh lên...</p>}
        <p className="mt-1 text-xs text-brand-300">Tối đa 5MB/ảnh, định dạng JPG/PNG/WEBP/GIF. Hoặc dán URL ảnh ngoài bên dưới (mỗi dòng 1 URL):</p>
        <textarea className="input mt-1" rows={2} placeholder="https://..." value={form.imagesText} onChange={(e) => set("imagesText", e.target.value)} />
      </div>

      <button disabled={loading} className="btn-primary">
        {loading ? "Đang lưu..." : listingId ? "Cập nhật tin đăng" : "Đăng tin"}
      </button>
    </form>
  );
}

