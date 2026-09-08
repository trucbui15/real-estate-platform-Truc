import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

/**
 * Server-side processor for Article content.
 * 1. Automatically assigns stable slug IDs to H2 and H3 tags if missing.
 * 2. Hydrates semantic project and listing cards with live database data.
 * 3. Formats tables with responsive wrapper.
 * 4. Ensures clean, secure HTML.
 */
export async function processArticleHtml(rawHtml: string): Promise<string> {
  if (!rawHtml) return "";

  let processed = rawHtml;

  // 1. Add stable slug IDs to H2 & H3 for Table of Contents anchors
  processed = processed.replace(/<(h[23])([^>]*)>(.*?)<\/\1>/gi, (match, tag, attrs, text) => {
    // If id already exists, keep it
    if (/id=["'][^"']+["']/i.test(attrs)) {
      return match;
    }
    const cleanText = text.replace(/<[^>]*>/g, "").trim();
    const id = slugify(cleanText) || `section-${Math.random().toString(36).substring(2, 7)}`;
    return `<${tag} id="${id}"${attrs}>${text}</${tag}>`;
  });

  // 2. Find and hydrate Project Cards: data-type="project-card" data-project-slug="..."
  const projectSlugMatches = Array.from(
    processed.matchAll(/<div[^>]*data-type=["']project-card["'][^>]*data-project-slug=["']([^"']+)["'][^>]*>([\s\S]*?)<\/div>/gi)
  );

  if (projectSlugMatches.length > 0) {
    const projectSlugs = Array.from(new Set(projectSlugMatches.map((m) => m[1])));
    const projects = await prisma.project.findMany({
      where: { slug: { in: projectSlugs } },
      select: {
        id: true,
        name: true,
        slug: true,
        developer: true,
        thumbnail: true,
        address: true,
        province: { select: { name: true } },
        district: { select: { name: true } },
      },
    });

    const projectMap = new Map(projects.map((p) => [p.slug, p]));

    for (const match of projectSlugMatches) {
      const fullMatch = match[0];
      const slug = match[1];
      const project = projectMap.get(slug);

      if (project) {
        const location = [project.district?.name, project.province?.name].filter(Boolean).join(", ") || project.address || "Quy Nhơn";
        const hydratedHtml = `
          <div data-type="project-card" data-project-slug="${project.slug}" class="article-project-card group not-prose">
            <a href="/projects/${project.slug}" class="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 hover:bg-sky-50/50 p-4 rounded-2xl border border-slate-200 hover:border-sky-300 transition text-decoration-none">
              <div class="w-full sm:w-44 h-28 rounded-xl overflow-hidden bg-slate-200 shrink-0 border border-slate-200">
                <img src="${project.thumbnail || "/logo.png"}" alt="${project.name}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300" loading="lazy" />
              </div>
              <div class="flex-1 min-w-0 space-y-1 text-left w-full">
                <span class="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-100 text-sky-800">DỰ ÁN NỔI BẬT</span>
                <h4 class="text-base sm:text-lg font-bold text-slate-900 truncate group-hover:text-sky-700 transition">${project.name}</h4>
                <p class="text-xs text-slate-500 line-clamp-1">📍 ${location}</p>
                <div class="pt-1 flex items-center justify-between">
                  <span class="text-xs font-semibold text-slate-600">${project.developer ? `Chủ đầu tư: ${project.developer}` : ""}</span>
                  <span class="text-xs font-bold text-sky-600 group-hover:translate-x-1 transition flex items-center gap-0.5">Xem dự án &rarr;</span>
                </div>
              </div>
            </a>
          </div>
        `.trim();
        processed = processed.replace(fullMatch, hydratedHtml);
      }
    }
  }

  // 3. Find and hydrate Listing Cards: data-type="listing-card" data-listing-slug="..."
  const listingSlugMatches = Array.from(
    processed.matchAll(/<div[^>]*data-type=["']listing-card["'][^>]*data-listing-slug=["']([^"']+)["'][^>]*>([\s\S]*?)<\/div>/gi)
  );

  if (listingSlugMatches.length > 0) {
    const listingSlugs = Array.from(new Set(listingSlugMatches.map((m) => m[1])));
    const listings = await prisma.listing.findMany({
      where: { slug: { in: listingSlugs } },
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
        district: { select: { name: true } },
        province: { select: { name: true } },
      },
    });

    const listingMap = new Map(listings.map((l) => [l.slug, l]));

    for (const match of listingSlugMatches) {
      const fullMatch = match[0];
      const slug = match[1];
      const listing = listingMap.get(slug);

      if (listing) {
        let firstImg: string = "/logo.png";
        try {
          if (listing.images) {
            const parsed = JSON.parse(listing.images);
            if (Array.isArray(parsed) && parsed.length > 0) firstImg = parsed[0];
            else if (typeof listing.images === "string") firstImg = listing.images;
          }
        } catch {
          firstImg = listing.images || "/logo.png";
        }

        const priceText =
          listing.transactionType === "RENT"
            ? listing.rentPrice
              ? `${listing.rentPrice} triệu/tháng`
              : "Giá thỏa thuận"
            : listing.salePrice
            ? `${listing.salePrice} tỷ`
            : "Giá liên hệ";

        const hydratedHtml = `
          <div data-type="listing-card" data-listing-slug="${listing.slug}" class="article-listing-card group not-prose">
            <a href="/listings/${listing.slug}" class="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 hover:bg-sky-50/50 p-4 rounded-2xl border border-slate-200 hover:border-sky-300 transition text-decoration-none">
              <div class="w-full sm:w-44 h-28 rounded-xl overflow-hidden bg-slate-200 shrink-0 border border-slate-200">
                <img src="${firstImg}" alt="${listing.title}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300" loading="lazy" />
              </div>
              <div class="flex-1 min-w-0 space-y-1 text-left w-full">
                <div class="flex items-center gap-2">
                  <span class="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">BẤT ĐỘNG SẢN</span>
                  ${listing.productCode ? `<span class="text-[10px] font-mono font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md">MÃ: ${listing.productCode}</span>` : ""}
                </div>
                <h4 class="text-base sm:text-lg font-bold text-slate-900 truncate group-hover:text-sky-700 transition">${listing.title}</h4>
                <div class="flex items-center gap-3 text-xs text-slate-600 font-semibold">
                  <span class="text-rose-600 font-extrabold text-sm">${priceText}</span>
                  <span>·</span>
                  <span>${listing.area} m²</span>
                  ${listing.bedrooms ? `<span>·</span><span>${listing.bedrooms} PN</span>` : ""}
                </div>
                <div class="pt-1 flex items-center justify-between text-xs">
                  <span class="text-slate-500 truncate">${listing.project?.name || listing.district?.name || "Minh Dũng Land"}</span>
                  <span class="font-bold text-sky-600 group-hover:translate-x-1 transition flex items-center gap-0.5">Xem chi tiết &rarr;</span>
                </div>
              </div>
            </a>
          </div>
        `.trim();
        processed = processed.replace(fullMatch, hydratedHtml);
      }
    }
  }

  // 4. Wrap tables in responsive container if not already wrapped
  processed = processed.replace(/(<table[\s\S]*?<\/table>)/gi, (tableHtml) => {
    return `<div class="overflow-x-auto my-6 rounded-2xl border border-slate-200 shadow-sm">${tableHtml}</div>`;
  });

  return processed;
}

/**
 * Generate Table of Contents items from HTML string
 */
export function extractTableOfContents(html: string): Array<{ id: string; text: string; level: number }> {
  if (!html) return [];
  const toc: Array<{ id: string; text: string; level: number }> = [];
  const regex = /<(h[23])(?:[^>]*id=["']([^"']+)["'])?[^>]*>(.*?)<\/\1>/gi;
  let match;

  while ((match = regex.exec(html)) !== null) {
    const level = match[1].toLowerCase() === "h2" ? 2 : 3;
    const cleanText = match[3].replace(/<[^>]*>/g, "").trim();
    const id = match[2] || slugify(cleanText);
    if (cleanText) {
      toc.push({ id, text: cleanText, level });
    }
  }

  return toc;
}
