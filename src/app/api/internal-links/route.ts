export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const STATIC_PAGES = [
  { title: "Trang chủ Minh Dũng Land", type: "PAGE", url: "/" },
  { title: "Danh sách Bất động sản", type: "PAGE", url: "/listings" },
  { title: "Danh mục Dự án BĐS", type: "PAGE", url: "/projects" },
  { title: "Tin tức & Thị trường BĐS", type: "PAGE", url: "/news" },
  // { title: "Ký gửi Bất động sản", type: "PAGE", url: "/ky-gui" },
  { title: "Giới thiệu Minh Dũng Land", type: "PAGE", url: "/gioi-thieu" },
  { title: "Liên hệ & Tư vấn 24/7", type: "PAGE", url: "/lien-he" },
  { title: "Chính sách giá & Phí dịch vụ", type: "PAGE", url: "/chinh-sach-gia" },
  { title: "Chính sách thanh toán", type: "PAGE", url: "/chinh-sach-thanh-toan" },
  { title: "Điều khoản sử dụng", type: "PAGE", url: "/dieu-khoan" },
  { title: "Điều kiện giao dịch hạn chế", type: "PAGE", url: "/dieu-kien-han-che" },
  { title: "Phương thức cung cấp dịch vụ", type: "PAGE", url: "/phuong-thuc-cung-cap-dich-vu" },
  { title: "Tiếp nhận & Xử lý khiếu nại", type: "PAGE", url: "/tiep-nhan-khieu-nai" },
  { title: "Đăng ký Cộng tác viên", type: "PAGE", url: "/cong-tac-vien" },
  { title: "Tài liệu & Brochure Dự án", type: "PAGE", url: "/tai-lieu-du-an" },
  { title: "Dịch vụ Visa & Định cư", type: "PAGE", url: "/dich-vu-visa" },
];

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim().toLowerCase();
  const type = searchParams.get("type") || "ALL"; // ALL | PROJECT | LISTING | NEWS | PAGE

  try {
    const results: Array<{
      id: string;
      title: string;
      type: "PROJECT" | "LISTING" | "NEWS" | "PAGE";
      url: string;
      subtitle?: string;
      thumbnail?: string | null;
      badge?: string;
      extra?: any;
    }> = [];

    // 1. STATIC PAGES
    if (type === "ALL" || type === "PAGE") {
      const filteredPages = STATIC_PAGES.filter((p) =>
        !q || p.title.toLowerCase().includes(q) || p.url.toLowerCase().includes(q)
      );
      filteredPages.forEach((p) => {
        results.push({
          id: p.url,
          title: p.title,
          type: "PAGE",
          url: p.url,
          subtitle: "Trang hệ thống",
        });
      });
    }

    // 2. PROJECTS
    if (type === "ALL" || type === "PROJECT") {
      const projects = await prisma.project.findMany({
        where: q
          ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { slug: { contains: q, mode: "insensitive" } },
              { developer: { contains: q, mode: "insensitive" } },
            ],
          }
          : undefined,
        take: 8,
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
        select: {
          id: true,
          name: true,
          slug: true,
          developer: true,
          thumbnail: true,
          address: true,
        },
      });

      projects.forEach((p) => {
        results.push({
          id: p.id,
          title: p.name,
          type: "PROJECT",
          url: `/projects/${p.slug}`,
          subtitle: p.developer || p.address || "Dự án",
          thumbnail: p.thumbnail,
          badge: "Dự án",
          extra: { slug: p.slug, name: p.name },
        });
      });
    }

    // 3. LISTINGS
    if (type === "ALL" || type === "LISTING") {
      const listings = await prisma.listing.findMany({
        where: q
          ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { slug: { contains: q, mode: "insensitive" } },
              { productCode: { contains: q, mode: "insensitive" } },
            ],
          }
          : undefined,
        take: 8,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          productCode: true,
          salePrice: true,
          rentPrice: true,
          transactionType: true,
          area: true,
          bedrooms: true,
          images: true,
          project: { select: { name: true } },
        },
      });

      listings.forEach((l) => {
        let firstImg: string | null = null;
        try {
          if (l.images) {
            const parsed = JSON.parse(l.images);
            if (Array.isArray(parsed) && parsed.length > 0) firstImg = parsed[0];
          }
        } catch {
          firstImg = l.images;
        }

        const price =
          l.transactionType === "RENT"
            ? l.rentPrice
              ? `${l.rentPrice} tr/tháng`
              : "Giá thỏa thuận"
            : l.salePrice
              ? `${l.salePrice} tỷ`
              : "Giá liên hệ";

        results.push({
          id: l.id,
          title: l.title,
          type: "LISTING",
          url: `/listings/${l.slug}`,
          subtitle: `${l.productCode ? `[${l.productCode}] ` : ""}${price} · ${l.area}m²${l.bedrooms ? ` · ${l.bedrooms} PN` : ""}`,
          thumbnail: firstImg,
          badge: "BĐS",
          extra: {
            slug: l.slug,
            productCode: l.productCode,
            price,
            area: l.area,
            bedrooms: l.bedrooms,
          },
        });
      });
    }

    // 4. NEWS
    if (type === "ALL" || type === "NEWS") {
      const news = await prisma.news.findMany({
        where: q
          ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { slug: { contains: q, mode: "insensitive" } },
              { category: { contains: q, mode: "insensitive" } },
            ],
          }
          : undefined,
        take: 8,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          thumbnail: true,
          category: true,
        },
      });

      news.forEach((n) => {
        results.push({
          id: n.id,
          title: n.title,
          type: "NEWS",
          url: `/news/${n.slug}`,
          subtitle: n.category || "Bài viết tin tức",
          thumbnail: n.thumbnail,
          badge: "Tin tức",
        });
      });
    }

    return NextResponse.json(results);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Lỗi tra cứu liên kết" }, { status: 500 });
  }
}
