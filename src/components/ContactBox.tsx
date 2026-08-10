"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function ContactBox({
  listingId,
  agentName,
  agentPhone,
}: {
  listingId: string;
  agentName?: string | null;
  agentPhone?: string | null;
}) {
  const { data: session } = useSession();
  const [sent, setSent] = useState(false);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    const res = await fetch("/api/contact-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId, note }),
    });
    setLoading(false);
    if (res.ok) setSent(true);
  }

  return (
    <div className="card-glass p-6 rounded-3xl border border-gray-100 space-y-4 shadow-glass">
      <div>
        <div className="text-[11px] font-extrabold uppercase tracking-widest text-gray-400">
          Tư vấn viên phụ trách
        </div>
        <div className="mt-1 font-display text-lg font-extrabold text-dark flex items-center gap-2">
          <span>👤 {agentName || "Chuyên viên Minh Dũng Land"}</span>
        </div>
      </div>

      {!session ? (
        <div className="rounded-2xl bg-surface p-4 text-xs font-medium text-gray-600 border border-gray-100 space-y-2">
          <p>
            Vui lòng <Link href="/login" className="font-bold text-primary-600 underline">Đăng nhập</Link> hoặc{" "}
            <Link href="/register" className="font-bold text-primary-600 underline">Đăng ký</Link> để nhận tư vấn trực tiếp từ chuyên viên.
          </p>
        </div>
      ) : sent ? (
        <div className="rounded-2xl bg-emerald-50 p-4 text-xs font-bold text-emerald-800 border border-emerald-200">
          ✓ Đã gửi yêu cầu tư vấn! Chuyên viên sẽ liên hệ lại quý khách trong thời gian sớm nhất.
        </div>
      ) : (
        <div className="space-y-3">
          <textarea
            className="input text-xs"
            rows={3}
            placeholder="Ghi chú thêm cho tư vấn viên (không bắt buộc)..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <button onClick={submit} disabled={loading} className="btn-primary w-full text-xs shadow-lg shadow-primary-500/25">
            {loading ? "Đang gửi yêu cầu..." : "Yêu cầu tư vấn ngay ➔"}
          </button>
        </div>
      )}
    </div>
  );
}
