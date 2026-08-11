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
      email,
      password,
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
            <input
              className="input"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
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
