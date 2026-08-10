import React from "react";
import Link from "next/link";

interface ProjectListingsStripProps {
  projectName: string;
  projectSlug: string;
  listingsCount: number;
}

export function ProjectListingsStrip({
  projectName,
  projectSlug,
  listingsCount,
}: ProjectListingsStripProps) {
  return (
    <div className="rounded-3xl border border-primary-100 bg-gradient-to-r from-primary-900 to-slate-900 p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="space-y-1.5 text-center md:text-left">
        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-amber-400">
          ⚡ GIỎ HÀNG THỰC TẾ
        </span>
        <h3 className="font-display text-xl md:text-2xl font-extrabold tracking-tight">
          Danh sách BĐS đang rao bán tại {projectName}
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed font-medium">
          {listingsCount > 0
            ? `Hiện đang có ${listingsCount} bất động sản chuyển nhượng & cho thuê được xác thực dữ liệu.`
            : "Xem danh sách các căn hộ và bất động sản đang được cập nhật giỏ hàng mới nhất."}
        </p>
      </div>

      <Link
        href={`/listings?project=${projectSlug}`}
        className="btn-primary !bg-amber-400 !text-slate-950 hover:!bg-amber-300 !px-6 !py-3 text-xs font-extrabold shadow-lg shadow-amber-400/20 shrink-0"
      >
        Khám phá giỏ hàng {projectName} ➔
      </Link>
    </div>
  );
}
