"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

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
  const navRef = useRef<HTMLElement>(null);
  const activeLinkRef = useRef<HTMLAnchorElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Check scroll position to show/hide left & right assist buttons
  const checkScroll = () => {
    if (navRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = navRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    checkScroll();
    const nav = navRef.current;
    if (nav) {
      nav.addEventListener("scroll", checkScroll, { passive: true });
      window.addEventListener("resize", checkScroll);
      return () => {
        nav.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
      };
    }
  }, []);

  // Auto-scroll active tab into center on page change
  useEffect(() => {
    if (activeLinkRef.current && navRef.current) {
      const nav = navRef.current;
      const activeEl = activeLinkRef.current;
      const navRect = nav.getBoundingClientRect();
      const activeRect = activeEl.getBoundingClientRect();

      if (activeRect.left < navRect.left || activeRect.right > navRect.right) {
        nav.scrollTo({
          left: activeEl.offsetLeft - nav.offsetWidth / 2 + activeEl.offsetWidth / 2,
          behavior: "smooth",
        });
      }
    }
  }, [pathname]);

  const scrollNav = (direction: "left" | "right") => {
    if (navRef.current) {
      navRef.current.scrollBy({
        left: direction === "left" ? -180 : 180,
        behavior: "smooth",
      });
    }
  };

  const visibleLinks = links.filter((l) => l.show);

  return (
    <div className="relative w-full min-w-0 max-w-full">
      {/* Left Scroll Arrow (Mobile only) */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollNav("left")}
          className="md:hidden absolute -left-1 top-1/2 -translate-y-1/2 z-20 w-7 h-7 bg-white/95 text-slate-700 shadow-md border border-slate-200 rounded-full flex items-center justify-center text-xs font-black active:scale-90 transition cursor-pointer"
          aria-label="Cuộn sang trái"
        >
          ‹
        </button>
      )}

      {/* Right Scroll Arrow (Mobile only) */}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => scrollNav("right")}
          className="md:hidden absolute -right-1 top-1/2 -translate-y-1/2 z-20 w-7 h-7 bg-white/95 text-slate-700 shadow-md border border-slate-200 rounded-full flex items-center justify-center text-xs font-black active:scale-90 transition cursor-pointer"
          aria-label="Cuộn sang phải"
        >
          ›
        </button>
      )}

      {/* Navigation list */}
      <nav
        ref={navRef}
        className="card p-1.5 md:p-2 flex md:flex-col overflow-x-auto custom-scrollbar gap-1.5 w-full min-w-0 max-w-full scroll-smooth touch-pan-x select-none"
        style={{ WebkitOverflowScrolling: "touch" }}
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
