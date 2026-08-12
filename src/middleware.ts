import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const proto = request.headers.get("x-forwarded-proto");
  const host = request.headers.get("host") || "";

  // 1. Ép tự động chuyển hướng tên miền trần minhdungland.com.vn sang www.minhdungland.com.vn
  if (host === "minhdungland.com.vn") {
    return NextResponse.redirect(
      `https://www.minhdungland.com.vn${request.nextUrl.pathname}${request.nextUrl.search}`,
      301
    );
  }

  // 2. Tự động chuyển hướng từ http:// sang https:// trên môi trường Production
  if (proto === "http" && host && !host.includes("localhost")) {
    return NextResponse.redirect(
      `https://${host}${request.nextUrl.pathname}${request.nextUrl.search}`,
      301
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
