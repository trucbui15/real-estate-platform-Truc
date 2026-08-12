"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface UserProfileManagerProps {
  initialName: string;
  initialPhone: string;
  initialEmail: string;
}

export default function UserProfileManager({
  initialName,
  initialPhone,
  initialEmail,
}: UserProfileManagerProps) {
  const { update } = useSession();

  // Tab State: 'info' | 'password'
  const [activeTab, setActiveTab] = useState<"info" | "password">("info");

  // Profile Info Form State
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [infoLoading, setInfoLoading] = useState(false);
  const [infoMsg, setInfoMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passLoading, setPassLoading] = useState(false);
  const [passMsg, setPassMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    setName(initialName || "");
    setPhone(initialPhone || "");
  }, [initialName, initialPhone]);

  // Handle Update Profile Info
  async function handleUpdateInfo(e: React.FormEvent) {
    e.preventDefault();
    setInfoMsg(null);

    if (!name.trim()) {
      setInfoMsg({ type: "error", text: "Vui lòng nhập họ và tên" });
      return;
    }

    setInfoLoading(true);

    try {
      const res = await fetch("/api/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });

      const data = await res.json();
      setInfoLoading(false);

      if (!res.ok) {
        setInfoMsg({ type: "error", text: data.error || "Cập nhật thất bại" });
        return;
      }

      setInfoMsg({ type: "success", text: data.message });
      update({ name, phone });
    } catch (err) {
      setInfoLoading(false);
      setInfoMsg({ type: "error", text: "Lỗi kết nối máy chủ" });
    }
  }

  // Handle Change Password
  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPassMsg(null);

    if (newPassword !== confirmPassword) {
      setPassMsg({ type: "error", text: "Mật khẩu mới và xác nhận không khớp!" });
      return;
    }

    setPassLoading(true);

    try {
      const res = await fetch("/api/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });

      const data = await res.json();
      setPassLoading(false);

      if (!res.ok) {
        setPassMsg({ type: "error", text: data.error || "Đổi mật khẩu thất bại" });
        return;
      }

      setPassMsg({ type: "success", text: data.message });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPassLoading(false);
      setPassMsg({ type: "error", text: "Lỗi kết nối máy chủ" });
    }
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-6">
      {/* TABS NAVIGATION */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-4">
        <button
          type="button"
          onClick={() => setActiveTab("info")}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
            activeTab === "info"
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-slate-50 text-slate-700 hover:bg-slate-100"
          }`}
        >
          <span>👤 Chỉnh sửa thông tin cá nhân</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("password")}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
            activeTab === "password"
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-slate-50 text-slate-700 hover:bg-slate-100"
          }`}
        >
          <span>🔑 Đổi mật khẩu bảo mật</span>
        </button>
      </div>

      {/* TAB 1: THÔNG TIN CÁ NHÂN */}
      {activeTab === "info" && (
        <form onSubmit={handleUpdateInfo} className="space-y-4 max-w-xl">
          {infoMsg && (
            <div
              className={`rounded-xl p-3.5 text-xs font-medium ${
                infoMsg.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-rose-50 text-rose-800 border border-rose-200"
              }`}
            >
              {infoMsg.text}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email đăng nhập (Cố định)
            </label>
            <input
              type="email"
              disabled
              value={initialEmail}
              className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-xs text-slate-500 cursor-not-allowed font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Họ và Tên đầy đủ *
              </label>
              <input
                type="text"
                required
                placeholder="Nhập họ và tên đầy đủ"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Số điện thoại liên hệ
              </label>
              <input
                type="tel"
                placeholder="Nhập số điện thoại"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition font-medium"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={infoLoading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition active:scale-95 disabled:opacity-50"
            >
              {infoLoading ? "Đang lưu..." : "Cập nhật thông tin cá nhân"}
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: ĐỔI MẬT KHẨU */}
      {activeTab === "password" && (
        <form onSubmit={handleChangePassword} className="space-y-4 max-w-xl">
          {passMsg && (
            <div
              className={`rounded-xl p-3.5 text-xs font-medium ${
                passMsg.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-rose-50 text-rose-800 border border-rose-200"
              }`}
            >
              {passMsg.text}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Mật khẩu hiện tại *
            </label>
            <input
              type="password"
              required
              placeholder="Nhập mật khẩu hiện tại"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mật khẩu mới *
              </label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="Tối thiểu 6 ký tự"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Xác nhận mật khẩu mới *
              </label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="Nhập lại mật khẩu mới"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition font-medium"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={passLoading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition active:scale-95 disabled:opacity-50"
            >
              {passLoading ? "Đang đổi..." : "Lưu mật khẩu mới"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
