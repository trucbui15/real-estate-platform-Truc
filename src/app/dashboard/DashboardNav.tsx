"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useRef } from "react";

interface DashboardNavProps {
  links: {
    href: string;
    label: string;
    icon: string;
    show: boolean;
  }[];
}

export default function DashboardNav({ links }: DashboardNavProps) {
  const pathname = usePathname();
  const navRef = useRef<HTMLDivElement>(null);
  const activeLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (activeLinkRef.current && navRef.current) {
      const nav = navRef.current;
      const activeEl = activeLinkRef.current;
      const navRect = nav.getBoundingClientRect();
      const activeRect = activeEl.getBoundingClientRect();

      // If active tab is out of view horizontally on mobile, smoothly scroll it into center
      if (activeRect.left < navRect.left || activeRect.right > navRect.right) {
        nav.scrollTo({
          left: activeEl.offsetLeft - nav.offsetWidth / 2 + activeEl.offsetWidth / 2,
          behavior: "smooth",
        });
      }
    }
  }, [pathname]);

  const visibleLinks = links.filter((l) => l.show);

  return (
    <div className="relative group">
      {/* Visual edge gradient on mobile to show scrollability */}
      <div className="md:hidden pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-100/90 to-transparent z-10 rounded-r-2xl" />

      <nav
        ref={navRef}
        className="card p-1.5 md:p-2 flex md:flex-col overflow-x-auto custom-scrollbar gap-1.5 shrink-0 scroll-smooth touch-pan-x"
        aria-label="Dashboard Navigation"
      >
        {visibleLinks.map((l) => {
          const isActive =
            l.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(l.href);

          return (
            <Link
              key={l.href}
              href={l.href}
              ref={isActive ? activeLinkRef : null}
              className={`shrink-0 flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs md:text-sm font-bold transition-all whitespace-nowrap min-h-[42px] ${
                isActive
                  ? "bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-sm shadow-sky-600/30 scale-[1.01]"
                  : "text-slate-700 hover:bg-slate-100/80 hover:text-sky-700 active:scale-95"
              }`}
            >
              <span className="text-sm md:text-base">{l.icon}</span>
              <span>{l.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
