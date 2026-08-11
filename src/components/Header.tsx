"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export default function Header() {
  const { data: session } = useSession();
  const pathname = usePathname() || "";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileAccordion, setMobileAccordion] = useState<"listings" | "projects" | null>("projects");

  const isBackoffice = session && ["ADMIN", "MANAGER", "STAFF"].includes((session.user as any).role);

  // Active state checks
  const isListingsActive = pathname.startsWith("/listings");
  const isProjectsActive = pathname.startsWith("/projects") || pathname.startsWith("/tai-lieu-du-an");
  const isKyGuiActive = pathname.startsWith("/ky-gui");
  const isNewsActive = pathname.startsWith("/news");

  return (
    <header className="sticky top-0 z-50 h-[68px] md:h-[72px] border-b border-slate-200 bg-white transition-all">
      <div className="container-page flex h-full items-center justify-between">
        {/* LEFT: BRAND LOGO */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-lg md:text-xl text-slate-900">
            <img
              src="/logo.png"
              alt="Minh Dũng Land Logo"
              className="h-9 w-9 object-contain rounded-lg shadow-xs"
            />
            <span className="font-bold tracking-tight text-slate-900">Minh Dũng Land</span>
          </Link>
        </div>

        {/* CENTER: NAVIGATION DESKTOP */}
        <nav className="hidden lg:flex items-center gap-7">
          {/* MENU 1: MUA BÁN / CHO THUÊ ▾ */}
          <div className="relative group py-5">
            <button
              className={`flex items-center gap-1 text-[14px] md:text-[15px] font-semibold transition ${
                isListingsActive
                  ? "text-[#2563EB] font-bold"
                  : "text-slate-700 hover:text-[#2563EB]"
              }`}
            >
              <span>Mua bán / Cho thuê</span>
              <span className="text-[11px] transition-transform duration-200 group-hover:rotate-180">▾</span>
            </button>

            {/* DROPDOWN MENU */}
            <div className="absolute top-full left-0 hidden group-hover:block w-48 bg-white border border-slate-200 shadow-md rounded-xl p-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
              <Link
                href="/listings?transactionType=SALE"
                className="block px-3 py-2 rounded-lg text-[13px] font-medium text-slate-700 hover:bg-slate-50 hover:text-[#2563EB] transition"
              >
                Mua bán
              </Link>
              <Link
                href="/listings?transactionType=RENT"
                className="block px-3 py-2 rounded-lg text-[13px] font-medium text-slate-700 hover:bg-slate-50 hover:text-[#2563EB] transition"
              >
                Cho thuê
              </Link>
            </div>
          </div>

          {/* MENU 2: DỰ ÁN ▾ */}
          <div className="relative group py-5">
            <button
              className={`flex items-center gap-1 text-[14px] md:text-[15px] font-semibold transition ${
                isProjectsActive
                  ? "text-[#2563EB] font-bold"
                  : "text-slate-700 hover:text-[#2563EB]"
              }`}
            >
              <span>Dự án</span>
              <span className="text-[11px] transition-transform duration-200 group-hover:rotate-180">▾</span>
            </button>

            {/* DROPDOWN MENU */}
            <div className="absolute top-full left-0 hidden group-hover:block w-52 bg-white border border-slate-200 shadow-md rounded-xl p-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
              <Link
                href="/projects"
                className="block px-3 py-2 rounded-lg text-[13px] font-medium text-slate-700 hover:bg-slate-50 hover:text-[#2563EB] transition"
              >
                Bảng hàng các dự án
              </Link>
              <Link
                href="/tai-lieu-du-an"
                className="block px-3 py-2 rounded-lg text-[13px] font-medium text-slate-700 hover:bg-slate-50 hover:text-[#2563EB] transition"
              >
                Tài liệu dự án
              </Link>
              <Link
                href="/tai-lieu-du-an/360"
                className="block px-3 py-2 rounded-lg text-[13px] font-medium text-slate-700 hover:bg-slate-50 hover:text-[#2563EB] transition"
              >
                Sa bàn / 360° dự án
              </Link>
            </div>
          </div>

          {/* MENU 3: KÝ GỬI BĐS */}
          <Link
            href="/ky-gui"
            className={`text-[14px] md:text-[15px] font-semibold transition ${
              isKyGuiActive
                ? "text-[#2563EB] font-bold"
                : "text-slate-700 hover:text-[#2563EB]"
            }`}
          >
            Ký gửi BĐS
          </Link>

          {/* MENU 4: TIN TỨC */}
          <Link
            href="/news"
            className={`text-[14px] md:text-[15px] font-semibold transition ${
              isNewsActive
                ? "text-[#2563EB] font-bold"
                : "text-slate-700 hover:text-[#2563EB]"
            }`}
          >
            Tin tức
          </Link>
        </nav>

        {/* RIGHT: AUTH / USER ACTIONS */}
        <div className="hidden md:flex items-center gap-3">
          {session ? (
            <div className="flex items-center gap-3">
              {isBackoffice && (
                <Link
                  href="/dashboard"
                  className="rounded-xl bg-blue-50 px-3.5 py-2 text-[13px] font-semibold text-[#2563EB] hover:bg-blue-100 transition"
                >
                  Bảng điều khiển
                </Link>
              )}
              <Link
                href="/profile"
                className="text-[14px] font-bold text-slate-800 hover:text-[#2563EB] transition flex items-center gap-1.5"
              >
                <span>👤</span>
                <span>{session.user?.name}</span>
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-xl border border-slate-200 px-3.5 py-1.5 text-[13px] font-semibold text-slate-600 hover:border-[#2563EB] hover:text-[#2563EB] transition cursor-pointer"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="btn-primary !px-5 !py-2 text-[14px]"
            >
              Đăng nhập
            </Link>
          )}
        </div>

        {/* MOBILE MENU TOGGLE BUTTON */}
        <button
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 focus:outline-none"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* MOBILE DRAWER */}
      {mobileOpen && (
        <>
          {/* BACKDROP OVERLAY */}
          <div
            className="fixed inset-0 top-[68px] z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
            onClick={() => setMobileOpen(false)}
          />

          {/* DRAWER CONTENT */}
          <div className="fixed inset-x-0 top-[68px] z-50 bg-white border-b border-slate-200 p-4 lg:hidden shadow-2xl space-y-3 max-h-[calc(100vh-70px)] overflow-y-auto w-full">
            <nav className="flex flex-col space-y-1 text-[14px]">
              {/* ACCORDION 1: MUA BÁN / CHO THUÊ */}
              <div className="rounded-xl border border-slate-100 overflow-hidden">
                <button
                  onClick={() => setMobileAccordion(mobileAccordion === "listings" ? null : "listings")}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 font-semibold transition text-left ${
                    isListingsActive ? "text-[#2563EB] bg-blue-50/50" : "text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  <span>Mua bán / Cho thuê</span>
                  <span className="text-xs">{mobileAccordion === "listings" ? "▲" : "▼"}</span>
                </button>

                {mobileAccordion === "listings" && (
                  <div className="bg-slate-50 p-2 space-y-1 border-t border-slate-100">
                    <Link
                      href="/listings?transactionType=SALE"
                      onClick={() => setMobileOpen(false)}
                      className="block px-3 py-2 rounded-lg font-medium text-slate-700 hover:text-[#2563EB] hover:bg-white transition"
                    >
                      Mua bán
                    </Link>
                    <Link
                      href="/listings?transactionType=RENT"
                      onClick={() => setMobileOpen(false)}
                      className="block px-3 py-2 rounded-lg font-medium text-slate-700 hover:text-[#2563EB] hover:bg-white transition"
                    >
                      Cho thuê
                    </Link>
                  </div>
                )}
              </div>

              {/* ACCORDION 2: DỰ ÁN */}
              <div className="rounded-xl border border-slate-100 overflow-hidden">
                <button
                  onClick={() => setMobileAccordion(mobileAccordion === "projects" ? null : "projects")}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 font-semibold transition text-left ${
                    isProjectsActive ? "text-[#2563EB] bg-blue-50/50" : "text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  <span>Dự án</span>
                  <span className="text-xs">{mobileAccordion === "projects" ? "▲" : "▼"}</span>
                </button>

                {mobileAccordion === "projects" && (
                  <div className="bg-slate-50 p-2 space-y-1 border-t border-slate-100">
                    <Link
                      href="/projects"
                      onClick={() => setMobileOpen(false)}
                      className="block px-3 py-2 rounded-lg font-medium text-slate-700 hover:text-[#2563EB] hover:bg-white transition"
                    >
                      Bảng hàng các dự án
                    </Link>
                    <Link
                      href="/tai-lieu-du-an"
                      onClick={() => setMobileOpen(false)}
                      className="block px-3 py-2 rounded-lg font-medium text-slate-700 hover:text-[#2563EB] hover:bg-white transition"
                    >
                      Tài liệu dự án
                    </Link>
                    <Link
                      href="/tai-lieu-du-an/360"
                      onClick={() => setMobileOpen(false)}
                      className="block px-3 py-2 rounded-lg font-medium text-slate-700 hover:text-[#2563EB] hover:bg-white transition"
                    >
                      Sa bàn / 360° dự án
                    </Link>
                  </div>
                )}
              </div>

              {/* DIRECT LINK: KÝ GỬI */}
              <Link
                href="/ky-gui"
                onClick={() => setMobileOpen(false)}
                className={`px-3.5 py-2.5 rounded-xl font-semibold transition border border-transparent ${
                  isKyGuiActive ? "text-[#2563EB] bg-blue-50/50" : "text-slate-800 hover:bg-slate-50"
                }`}
              >
                Ký gửi BĐS
              </Link>

              {/* DIRECT LINK: TIN TỨC */}
              <Link
                href="/news"
                onClick={() => setMobileOpen(false)}
                className={`px-3.5 py-2.5 rounded-xl font-semibold transition border border-transparent ${
                  isNewsActive ? "text-[#2563EB] bg-blue-50/50" : "text-slate-800 hover:bg-slate-50"
                }`}
              >
                Tin tức
              </Link>
            </nav>

            <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
              {session ? (
                <>
                  {isBackoffice && (
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="btn-primary w-full text-center text-[14px] justify-center py-2.5"
                    >
                      Bảng điều khiển
                    </Link>
                  )}
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="btn-outline w-full text-center text-[14px] flex items-center justify-center py-2.5 px-3"
                  >
                    <span className="truncate max-w-full">Đăng xuất ({session.user?.name})</span>
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="btn-primary w-full text-center text-[14px] justify-center py-2.5"
                >
                  Đăng nhập
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
}
