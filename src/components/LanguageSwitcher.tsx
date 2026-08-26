"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export default function LanguageSwitcher({ className = "" }: { className?: string }) {
  const pathname = usePathname() || "";
  const [currentLang, setCurrentLang] = useState<"vi" | "en">("vi");
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check initial language from cookie
  useEffect(() => {
    setMounted(true);
    const getCookie = (name: string) => {
      const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
      return match ? match[2] : null;
    };

    const cookieVal = getCookie("googtrans");
    if (cookieVal && cookieVal.includes("/en")) {
      setCurrentLang("en");
    } else {
      setCurrentLang("vi");
    }
  }, [pathname]);

  // Click outside listener to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  // Don't render inside dashboard
  if (pathname.startsWith("/dashboard")) {
    return null;
  }

  const setLanguage = (lang: "vi" | "en") => {
    setIsOpen(false);
    if (lang === currentLang) return;

    setCurrentLang(lang);

    const targetVal = lang === "en" ? "/vi/en" : "/vi/vi";

    // Set cookie for both current domain and host
    const domain = window.location.hostname;
    document.cookie = `googtrans=${targetVal}; path=/;`;
    document.cookie = `googtrans=${targetVal}; path=/; domain=${domain}`;

    // Also persist in localStorage
    try {
      localStorage.setItem("user_lang_pref", lang);
    } catch (e) {}

    // Find and update google translate select element if available
    const selectElem = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
    if (selectElem) {
      selectElem.value = lang;
      selectElem.dispatchEvent(new Event("change"));
    } else {
      // Reload in place to apply translation cookie
      window.location.reload();
    }
  };

  if (!mounted) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600 bg-white/80 border border-slate-200/80 ${className}`}>
        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 21a9 9 0 100-18 9 9 0 000 18zm0 0c2.5-3 4-6.5 4-9s-1.5-6-4-9c-2.5 3-4 6.5-4 9s1.5 6 4 9zm-9-9h18" />
        </svg>
        <span>VI</span>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative notranslate ${className}`} translate="no">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700 bg-white/95 hover:bg-white border border-slate-200 hover:border-slate-300 shadow-2xs transition-all cursor-pointer select-none"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 21a9 9 0 100-18 9 9 0 000 18zm0 0c2.5-3 4-6.5 4-9s-1.5-6-4-9c-2.5 3-4 6.5-4 9s1.5 6 4 9zm-9-9h18" />
        </svg>
        <span>{currentLang === "en" ? "English" : "Tiếng Việt"}</span>
        <svg
          className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* DROPDOWN MENU */}
      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-36 rounded-xl bg-white border border-slate-200/90 shadow-lg p-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          <button
            type="button"
            onClick={() => setLanguage("vi")}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
              currentLang === "vi"
                ? "bg-sky-50 text-[#0284C7]"
                : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <span>Tiếng Việt</span>
            {currentLang === "vi" && <span className="text-[#0284C7] font-bold">✓</span>}
          </button>
          <button
            type="button"
            onClick={() => setLanguage("en")}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
              currentLang === "en"
                ? "bg-sky-50 text-[#0284C7]"
                : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <span>English</span>
            {currentLang === "en" && <span className="text-[#0284C7] font-bold">✓</span>}
          </button>
        </div>
      )}
    </div>
  );
}
