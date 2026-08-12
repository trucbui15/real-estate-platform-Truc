"use client";
import { useState, useEffect, Suspense } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { data: session, status } = useSession();
  const emailParam = params.get("email") || "";
  const [email, setEmail] = useState(emailParam);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const role = (session.user as any).role;
      const callback = params.get("callbackUrl");
      if (["ADMIN", "MANAGER", "STAFF"].includes(role)) {
        router.replace(callback && callback !== "/" ? callback : "/dashboard");
      } else {
        router.replace(callback && callback !== "/" && !callback.includes("/dashboard") ? callback : "/");
      }
    }
  }, [status, session, router, params]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      email: email.trim(),
      password: password.trim(),
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Email hoặc mật khẩu không đúng");
      return;
    }

    const callback = params.get("callbackUrl");
    // Reload page to let useSession useEffect trigger smart role-based redirect
    router.refresh();
    if (callback && callback !== "/" && !callback.includes("/dashboard")) {
      router.push(callback);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-12">
      <form onSubmit={onSubmit} className="card w-full max-w-md p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="Minh Dũng Land Logo" className="h-10 w-10 object-contain rounded-lg shadow-xs" />
          <span className="font-extrabold text-xl text-slate-900 tracking-tight">Minh Dũng Land</span>
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Đăng nhập hệ thống</h1>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            Đăng nhập dành cho Nhân sự nội bộ (Admin, Quản lý, Nhân viên) & Cộng tác viên (CTV) Minh Dũng Land.
          </p>
        </div>

        {emailParam && (
          <div className="mt-3 rounded-xl bg-blue-50 border border-blue-200 p-3 text-xs font-semibold text-blue-800">
            ℹ️ Đăng ký CTV thành công! Vui lòng nhập Mật khẩu để đăng nhập.
          </div>
        )}

        {error && <div className="mt-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700">{error}</div>}

        <div className="mt-5 space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email đăng nhập</label>
            <input
              className="input"
              type="email"
              required
              autoComplete="username"
              placeholder="nhansu@minhdungland.vn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Mật khẩu</label>
            <div className="relative">
              <input
                className="input pr-10"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1 transition"
                title={showPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
              >
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.025 10.025 0 013.122-.063c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        <button disabled={loading} className="btn-primary mt-6 w-full py-2.5 text-xs font-bold shadow-xs cursor-pointer">
          {loading ? "Đang đăng nhập..." : "Đăng nhập ngay"}
        </button>

        <div className="mt-5 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
          Bạn muốn làm Cộng tác viên?{" "}
          <Link href="/cong-tac-vien/dang-ky" className="font-bold text-blue-600 hover:underline">
            Đăng ký CTV tại đây
          </Link>
        </div>
      </form>
    </div>
  );
}


export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
