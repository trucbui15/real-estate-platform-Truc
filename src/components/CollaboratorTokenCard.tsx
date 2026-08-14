"use client";

import { useState } from "react";

interface CollaboratorTokenCardProps {
  publicReferralToken: string;
  status: string;
}

export default function CollaboratorTokenCard({
  publicReferralToken,
  status,
}: CollaboratorTokenCardProps) {
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  function handleCopyToken() {
    navigator.clipboard.writeText(publicReferralToken);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2500);
  }

  function handleCopyLink() {
    const shareUrl = `${window.location.origin}/?ref=${publicReferralToken}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  }

  return (
    <div className="p-5 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50/60 rounded-3xl border border-emerald-200/80 space-y-4 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100/90 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              🤝 TÀI KHOẢN CỘNG TÁC VIÊN (CTV)
            </span>
            {status === "ACTIVE" ? (
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
                Hoạt động
              </span>
            ) : (
              <span className="text-xs font-bold text-rose-600">🔒 Đã tạm khóa</span>
            )}
          </div>

          <div className="flex items-center gap-3 pt-1">
            <span className="text-xs font-extrabold text-slate-700">Mã Referral CTV của bạn:</span>
            <code className="text-xl font-black font-mono text-emerald-700 bg-white border border-emerald-300 px-3.5 py-1 rounded-xl shadow-2xs tracking-wider">
              {publicReferralToken}
            </code>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCopyToken}
            className={`text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-2xs ${
              copiedToken
                ? "bg-emerald-800 text-white"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            }`}
          >
            <span>{copiedToken ? "✓ Đã sao chép" : "📋 Sao chép Mã Token"}</span>
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className={`text-xs font-bold px-4 py-2.5 rounded-xl border transition cursor-pointer flex items-center gap-1.5 ${
              copiedLink
                ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                : "bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-50"
            }`}
          >
            <span>{copiedLink ? "✓ Đã sao chép Link" : "🔗 Sao chép Link Trang chủ CTV"}</span>
          </button>
        </div>
      </div>

      <div className="text-xs text-slate-700 bg-white/90 backdrop-blur p-3.5 rounded-2xl border border-emerald-100/80 space-y-2 leading-relaxed">
        <div className="font-bold text-emerald-900 flex items-center gap-1.5">
          <span>💡</span>
          <span>Cách chia sẻ Link bán hàng CTV để tự động ghi nhận hoa hồng:</span>
        </div>
        <p>
          Mở xem bất kỳ <strong>Dự án</strong> hoặc <strong>Tin đăng BĐS</strong> trên website, hệ thống sẽ hiển thị nút <strong>🔗 &quot;Sao chép Link Bảng hàng CTV&quot;</strong> hoặc <strong>&quot;Sao chép Link giới thiệu CTV&quot;</strong> đính kèm mã <code className="font-bold text-emerald-700 font-mono bg-emerald-50 px-1 py-0.5 rounded">?ref={publicReferralToken}</code> của bạn.
        </p>
        <p className="text-slate-500 font-mono text-[11px]">
          Mọi khách hàng bấm vào link của bạn và gửi tư vấn sẽ được hệ thống tự động ghi nhận hoa hồng cho bạn!
        </p>
      </div>
    </div>
  );
}
