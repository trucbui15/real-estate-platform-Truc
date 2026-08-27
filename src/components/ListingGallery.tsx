"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface ListingGalleryProps {
  images: string[];
  title?: string;
  badges?: React.ReactNode;
}

export default function ListingGallery({
  images = [],
  title = "Hình ảnh bất động sản",
  badges,
}: ListingGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const thumbnailsContainerRef = useRef<HTMLDivElement | null>(null);

  // Touch tracking for main image
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const [touchTranslateX, setTouchTranslateX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  // Touch tracking for lightbox
  const lightboxTouchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const [lightboxTouchTranslateX, setLightboxTouchTranslateX] = useState(0);
  const [isLightboxSwiping, setIsLightboxSwiping] = useState(false);

  const totalImages = images.length;
  const hasMultipleImages = totalImages > 1;

  // Next / Prev navigation handlers
  const handleNext = useCallback(() => {
    if (!hasMultipleImages) return;
    setActiveIndex((prev) => (prev + 1) % totalImages);
  }, [hasMultipleImages, totalImages]);

  const handlePrev = useCallback(() => {
    if (!hasMultipleImages) return;
    setActiveIndex((prev) => (prev - 1 + totalImages) % totalImages);
  }, [hasMultipleImages, totalImages]);

  // Scroll active thumbnail into view smoothly
  useEffect(() => {
    const activeThumb = thumbnailRefs.current[activeIndex];
    const container = thumbnailsContainerRef.current;
    if (activeThumb && container) {
      activeThumb.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [activeIndex]);

  // Body scroll lock & Keyboard navigation for Lightbox
  useEffect(() => {
    if (!lightboxOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightboxOpen(false);
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightboxOpen, handleNext, handlePrev]);

  // MAIN IMAGE TOUCH HANDLERS
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!hasMultipleImages) return;
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
    setIsSwiping(true);
    setTouchTranslateX(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current || !hasMultipleImages) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;

    // Only translate horizontally if movement is predominantly horizontal
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      setTouchTranslateX(deltaX);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || !hasMultipleImages) {
      setIsSwiping(false);
      setTouchTranslateX(0);
      return;
    }

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;

    const isHorizontalSwipe =
      Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2;

    if (isHorizontalSwipe) {
      if (deltaX < 0) {
        // Swipe left -> Next image
        handleNext();
      } else {
        // Swipe right -> Prev image
        handlePrev();
      }
    }

    // Reset touch state
    touchStartRef.current = null;
    setIsSwiping(false);
    setTouchTranslateX(0);
  };

  // LIGHTBOX TOUCH HANDLERS
  const handleLightboxTouchStart = (e: React.TouchEvent) => {
    if (!hasMultipleImages) return;
    const touch = e.touches[0];
    lightboxTouchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
    setIsLightboxSwiping(true);
    setLightboxTouchTranslateX(0);
  };

  const handleLightboxTouchMove = (e: React.TouchEvent) => {
    if (!lightboxTouchStartRef.current || !hasMultipleImages) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - lightboxTouchStartRef.current.x;
    const deltaY = touch.clientY - lightboxTouchStartRef.current.y;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      setLightboxTouchTranslateX(deltaX);
    }
  };

  const handleLightboxTouchEnd = (e: React.TouchEvent) => {
    if (!lightboxTouchStartRef.current || !hasMultipleImages) {
      setIsLightboxSwiping(false);
      setLightboxTouchTranslateX(0);
      return;
    }

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - lightboxTouchStartRef.current.x;
    const deltaY = touch.clientY - lightboxTouchStartRef.current.y;

    const isHorizontalSwipe =
      Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2;

    if (isHorizontalSwipe) {
      if (deltaX < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }

    lightboxTouchStartRef.current = null;
    setIsLightboxSwiping(false);
    setLightboxTouchTranslateX(0);
  };

  // 0 IMAGES CASE
  if (totalImages === 0) {
    return (
      <div className="space-y-2.5">
        <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden rounded-2xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-400 select-none">
          <svg
            className="w-12 h-12 mb-2 text-slate-300 stroke-current"
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>
          <span className="text-[13px] font-medium text-slate-500">Chưa có hình ảnh</span>
          {badges && <div className="absolute left-3 top-3 flex items-center gap-2 z-10">{badges}</div>}
        </div>
      </div>
    );
  }

  const currentImage = images[activeIndex] || images[0];

  return (
    <div className="space-y-2.5 select-none">
      {/* 1. MAIN DISPLAY AREA */}
      <div
        className="group relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden rounded-2xl bg-slate-900 border border-slate-200 touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Main Image with smooth transition & swipe drag visual */}
        <div
          className={`w-full h-full ${
            isSwiping ? "" : "transition-transform duration-300 ease-out"
          }`}
          style={{
            transform: isSwiping && touchTranslateX ? `translateX(${touchTranslateX * 0.4}px)` : "none",
          }}
        >
          <img
            key={currentImage}
            src={currentImage}
            alt={title}
            loading={activeIndex === 0 ? "eager" : "lazy"}
            decoding="async"
            onClick={() => setLightboxOpen(true)}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/logo.png";
            }}
            className="h-full w-full object-cover cursor-pointer hover:scale-[1.01] transition-transform duration-300"
          />
        </div>

        {/* BADGES (TOP LEFT) */}
        {badges && (
          <div className="absolute left-3 top-3 flex items-center gap-2 z-10 pointer-events-none">
            {badges}
          </div>
        )}

        {/* EXPAND ICON HINT (TOP RIGHT) */}
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-full bg-slate-900/60 backdrop-blur-md px-2.5 py-1 text-[11px] font-medium text-white/90 shadow-sm hover:bg-slate-900/80 transition cursor-pointer"
          title="Xem toàn màn hình"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="hidden sm:inline">Phóng to</span>
        </button>

        {/* IMAGE COUNTER (BOTTOM RIGHT) - ONLY IF MULTIPLE IMAGES */}
        {hasMultipleImages && (
          <div className="absolute right-3 bottom-3 z-10 rounded-full bg-slate-950/70 backdrop-blur-md px-3 py-1 text-[11px] font-semibold text-white shadow-sm flex items-center gap-1.5 pointer-events-none">
            <svg className="w-3 h-3 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
            <span>
              {activeIndex + 1} / {totalImages}
            </span>
          </div>
        )}

        {/* DESKTOP PREV / NEXT BUTTONS (VISIBLE ON HOVER / DESKTOP) */}
        {hasMultipleImages && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              aria-label="Ảnh trước"
              className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-slate-900/60 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 hover:bg-slate-900/90 transition duration-200 cursor-pointer shadow-md"
            >
              <svg className="w-5 h-5 -translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              aria-label="Ảnh kế tiếp"
              className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full bg-slate-900/60 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 hover:bg-slate-900/90 transition duration-200 cursor-pointer shadow-md"
            >
              <svg className="w-5 h-5 translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* 2. THUMBNAILS STRIP (ONLY IF > 1 IMAGE) */}
      {hasMultipleImages && (
        <div
          ref={thumbnailsContainerRef}
          className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none snap-x scroll-smooth"
        >
          {images.map((img: string, idx: number) => {
            const isActive = activeIndex === idx;
            return (
              <button
                key={idx}
                ref={(el) => {
                  thumbnailRefs.current[idx] = el;
                }}
                type="button"
                onClick={() => setActiveIndex(idx)}
                aria-label={`Xem ảnh ${idx + 1}`}
                className={`relative h-14 w-20 shrink-0 snap-center rounded-xl overflow-hidden border-2 transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "border-[#0284C7] ring-2 ring-blue-200 scale-100 opacity-100"
                    : "border-transparent opacity-60 hover:opacity-100 hover:border-slate-300"
                }`}
              >
                <img
                  src={img}
                  alt=""
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/logo.png";
                  }}
                  className="w-full h-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* 3. FULLSCREEN LIGHTBOX MODAL */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-black/95 backdrop-blur-md p-4 sm:p-6 select-none touch-pan-y"
          onClick={() => setLightboxOpen(false)}
        >
          {/* HEADER / TOOLBAR */}
          <div
            className="w-full max-w-6xl flex items-center justify-between z-50 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium">
              <span>📷</span>
              <span>
                {activeIndex + 1} / {totalImages}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 active:bg-white/30 text-white transition cursor-pointer"
              title="Đóng (Esc)"
              aria-label="Đóng"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* MAIN LIGHTBOX IMAGE CONTAINER (WITH TOUCH SWIPE) */}
          <div
            className="relative flex-1 w-full max-w-6xl flex items-center justify-center my-auto overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleLightboxTouchStart}
            onTouchMove={handleLightboxTouchMove}
            onTouchEnd={handleLightboxTouchEnd}
          >
            <div
              className={`w-full h-full flex items-center justify-center ${
                isLightboxSwiping ? "" : "transition-transform duration-300 ease-out"
              }`}
              style={{
                transform:
                  isLightboxSwiping && lightboxTouchTranslateX
                    ? `translateX(${lightboxTouchTranslateX * 0.5}px)`
                    : "none",
              }}
            >
              <img
                key={currentImage}
                src={currentImage}
                alt={title}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/logo.png";
                }}
                className="max-h-[75vh] sm:max-h-[82vh] max-w-full object-contain rounded-lg shadow-2xl transition-all duration-200"
              />
            </div>

            {/* LIGHTBOX PREV / NEXT ARROWS */}
            {hasMultipleImages && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrev();
                  }}
                  aria-label="Ảnh trước"
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white/15 hover:bg-white/30 active:scale-95 text-white backdrop-blur-md transition cursor-pointer shadow-lg"
                >
                  <svg className="w-6 h-6 -translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  aria-label="Ảnh kế tiếp"
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white/15 hover:bg-white/30 active:scale-95 text-white backdrop-blur-md transition cursor-pointer shadow-lg"
                >
                  <svg className="w-6 h-6 translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* LIGHTBOX THUMBNAIL STRIP (BOTTOM) */}
          {hasMultipleImages && (
            <div
              className="w-full max-w-3xl flex items-center justify-center gap-2 overflow-x-auto py-2 px-1 scrollbar-none z-50"
              onClick={(e) => e.stopPropagation()}
            >
              {images.map((img: string, idx: number) => {
                const isSelected = activeIndex === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    aria-label={`Chọn ảnh ${idx + 1}`}
                    className={`relative h-11 w-14 sm:h-13 sm:w-18 shrink-0 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                      isSelected
                        ? "border-blue-400 ring-2 ring-blue-400/50 scale-105 opacity-100"
                        : "border-transparent opacity-40 hover:opacity-80"
                    }`}
                  >
                    <img
                      src={img}
                      alt=""
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/logo.png";
                      }}
                      className="w-full h-full object-cover"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
