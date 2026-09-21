import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/config/site";

export const revalidate = 3600; // Cache ISR sitemap for 1 hour

// Stable reference timestamp for static pages (September 2026 update)
const STATIC_PAGES_LASTMOD = new Date("2026-09-08T00:00:00.000Z");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. Static Public Pages (Verified HTTP 200 on production)
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}`,
      lastModified: STATIC_PAGES_LASTMOD,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/listings`,
      lastModified: STATIC_PAGES_LASTMOD,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/projects`,
      lastModified: STATIC_PAGES_LASTMOD,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/news`,
      lastModified: STATIC_PAGES_LASTMOD,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/ky-gui`,
      lastModified: STATIC_PAGES_LASTMOD,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/gioi-thieu`,
      lastModified: STATIC_PAGES_LASTMOD,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/lien-he`,
      lastModified: STATIC_PAGES_LASTMOD,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/tai-lieu-du-an`,
      lastModified: STATIC_PAGES_LASTMOD,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/dieu-khoan`,
      lastModified: STATIC_PAGES_LASTMOD,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/chinh-sach`,
      lastModified: STATIC_PAGES_LASTMOD,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/chinh-sach-gia`,
      lastModified: STATIC_PAGES_LASTMOD,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/chinh-sach-thanh-toan`,
      lastModified: STATIC_PAGES_LASTMOD,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/phuong-thuc-cung-cap-dich-vu`,
      lastModified: STATIC_PAGES_LASTMOD,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/dieu-kien-han-che`,
      lastModified: STATIC_PAGES_LASTMOD,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/chinh-sach-mua-hang`,
      lastModified: STATIC_PAGES_LASTMOD,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/quyen-va-nghia-vu`,
      lastModified: STATIC_PAGES_LASTMOD,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/chinh-sach-giao-nhan`,
      lastModified: STATIC_PAGES_LASTMOD,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/tiep-nhan-khieu-nai`,
      lastModified: STATIC_PAGES_LASTMOD,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  let listingRoutes: MetadataRoute.Sitemap = [];
  let projectRoutes: MetadataRoute.Sitemap = [];
  let micrositeRoutes: MetadataRoute.Sitemap = [];
  let newsRoutes: MetadataRoute.Sitemap = [];

  try {
    // 2. Public Active Listings
    const listings = await prisma.listing.findMany({
      where: {
        unitStatus: { in: ["DANG_BAN", "DANG_CHO_THUE"] },
      },
      select: {
        slug: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    listingRoutes = listings
      .filter((l) => Boolean(l.slug))
      .map((listing) => ({
        url: `${SITE_URL}/listings/${encodeURIComponent(listing.slug)}`,
        lastModified: listing.updatedAt,
        changeFrequency: "daily" as const,
        priority: 0.8,
      }));
  } catch (err) {
    console.error("Lỗi sitemap khi query listings:", err);
  }

  try {
    // 3. Public Active Projects
    const projects = await prisma.project.findMany({
      where: {
        isActive: true,
      },
      select: {
        slug: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    projectRoutes = projects
      .filter((p) => Boolean(p.slug))
      .map((project) => ({
        url: `${SITE_URL}/projects/${encodeURIComponent(project.slug)}`,
        lastModified: project.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));
  } catch (err) {
    console.error("Lỗi sitemap khi query projects:", err);
  }

  try {
    // 4. Validated Public Project Microsites
    const microsites = await prisma.projectWebsite.findMany({
      where: {
        status: "PUBLISHED",
        project: { isActive: true },
      },
      include: {
        project: {
          select: {
            slug: true,
            isActive: true,
            updatedAt: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    micrositeRoutes = microsites
      .filter(
        (site) =>
          Boolean(site.project?.slug) &&
          site.project.isActive === true &&
          Boolean(site.publishedSectionsConfig || site.publishedContentJson)
      )
      .map((site) => ({
        url: `${SITE_URL}/du-an/${encodeURIComponent(site.project.slug)}`,
        lastModified: site.updatedAt || site.publishedAt || site.project.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));
  } catch (err) {
    console.error("Lỗi sitemap khi query microsites:", err);
  }

  try {
    // 5. Published News Articles
    const news = await prisma.news.findMany({
      where: {
        published: true,
      },
      select: {
        slug: true,
        updatedAt: true,
        publishedAt: true,
        createdAt: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    newsRoutes = news
      .filter((n) => Boolean(n.slug))
      .map((article) => ({
        url: `${SITE_URL}/news/${encodeURIComponent(article.slug)}`,
        lastModified: article.updatedAt || article.publishedAt || article.createdAt,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));
  } catch (err) {
    console.error("Lỗi sitemap khi query news:", err);
  }

  return [
    ...staticRoutes,
    ...listingRoutes,
    ...projectRoutes,
    ...micrositeRoutes,
    ...newsRoutes,
  ];
}
