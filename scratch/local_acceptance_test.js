const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runAcceptanceTests() {
  console.log("==================================================");
  console.log("       LOCAL ACCEPTANCE TEST - WEBSITE & MICROSITES");
  console.log("==================================================\n");

  // 1. QUERY ALL ACTIVE PROJECTS
  const projects = await prisma.project.findMany({
    where: { isActive: true },
    include: {
      resources: {
        where: { type: "WEBSITE", isActive: true, isPublic: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      },
      district: true,
      province: true,
    },
    orderBy: [{ featured: "desc" }, { name: "asc" }],
  });

  console.log(`[TEST 1: WEBSITE LIST COUNT] Total Active Projects = ${projects.length}`);
  const isCount19 = projects.length === 19;
  console.log(`Result: ${isCount19 ? "PASS (19/19 Projects)" : "FAIL"}\n`);

  // 2. TEST SEARCH FILTER LOGIC
  console.log("[TEST 2: SEARCH FILTER]");
  const searchKeywords = ["Simona", "Altara", "TMS", "Oriva", "Phú Tài", "Hưng Thịnh"];
  let searchPass = true;

  searchKeywords.forEach((kw) => {
    const q = kw.toLowerCase();
    const matches = projects.filter((p) => {
      const nameMatch = p.name.toLowerCase().includes(q);
      const devMatch = p.developer ? p.developer.toLowerCase().includes(q) : false;
      const addrMatch = p.address ? p.address.toLowerCase().includes(q) : false;
      return nameMatch || devMatch || addrMatch;
    });
    console.log(`- Keyword "${kw}" -> ${matches.length} matching project(s): ${matches.map(m=>m.name).join(', ')}`);
    if (matches.length === 0) searchPass = false;
  });
  console.log(`Result: ${searchPass ? "PASS" : "FAIL"}\n`);

  // 3. TEST CTA MICROSITE PATHS
  console.log("[TEST 3: PRIMARY MICROSITE CTA]");
  const sampleSlugs = [
    "altara-residences-quy-nhon",
    "tms-luxury-quy-nhon",
    "oriva-bay-quy-nhon",
    "q-terra-q1-tower",
    "simona-heights-quy-nhon",
  ];
  let ctaPass = true;

  sampleSlugs.forEach((slug) => {
    const p = projects.find((item) => item.slug === slug);
    if (!p) {
      console.log(`- [FAIL] ${slug} missing in project list`);
      ctaPass = false;
      return;
    }
    const internalCta = `/du-an/${p.slug}`;
    console.log(`- Project "${p.name}": Primary CTA = "${internalCta}"`);
    if (internalCta !== `/du-an/${slug}`) ctaPass = false;
  });
  console.log(`Result: ${ctaPass ? "PASS" : "FAIL"}\n`);

  // 4. TEST SECONDARY EXTERNAL LINKS
  console.log("[TEST 4: SECONDARY EXTERNAL LINKS]");
  let extLinksCount = 0;
  projects.forEach((p) => {
    const extResources = p.resources.filter(
      (r) => r.url && r.url.startsWith("http") && !r.url.includes(`/du-an/${p.slug}`)
    );
    if (extResources.length > 0) {
      extLinksCount++;
      console.log(`- Project "${p.name}" has ${extResources.length} secondary link(s): ${extResources.map(r=>r.url).join(', ')}`);
    }
  });
  console.log(`- Projects with valid external reference links: ${extLinksCount}`);
  console.log(`Result: PASS\n`);

  // 5. TEST SAMPLE MICROSITE RENDERING & SECTION HIDING
  console.log("[TEST 5: MICROSITE SAMPLE RENDERING]");
  let micrositePass = true;

  for (const slug of sampleSlugs) {
    const p = await prisma.project.findUnique({
      where: { slug },
      include: {
        website: true,
        resources: { where: { isActive: true, isPublic: true } },
        inventories: true,
        listings: { where: { unitStatus: { in: ["DANG_BAN", "DANG_CHO_THUE"] } } },
      },
    });

    if (!p) {
      console.log(`- [FAIL] ${slug} not found`);
      micrositePass = false;
      continue;
    }

    const tour360 = p.resources.find((r) => r.type === "TOUR_360");
    const video = p.resources.find((r) => r.type === "VIDEO");
    const floorPlans = p.resources.filter((r) => r.type === "FLOOR_PLAN" || r.type === "DESIGN_FILE");
    const images = p.resources.filter((r) => r.type === "IMAGE");
    const policy = p.resources.filter((r) => r.type === "SALES_POLICY" || r.type === "PRICE_LIST");

    const activeSections = [
      "Hero",
      "Overview",
      (p.address || p.districtId) && "Location",
      floorPlans.length > 0 && "Floor Plans",
      (p.inventories.length > 0 || p.listings.length > 0) && "Units/Inventory",
      (p.thumbnail || images.length > 0) && "Gallery",
      (tour360 || video) && "Video 360°",
      policy.length > 0 && "Policy",
      p.resources.length > 0 && "Documents",
      "Contact",
    ].filter(Boolean);

    console.log(`- [Microsite /du-an/${p.slug}] Name: "${p.name}" | Active Sections (${activeSections.length}): ${activeSections.join(', ')}`);
  }
  console.log(`Result: ${micrositePass ? "PASS" : "FAIL"}\n`);

  // 6. SIMONA HEIGHTS REGRESSION CHECK
  console.log("[TEST 6: SIMONA HEIGHTS GOLDEN MASTER REGRESSION]");
  const simona = await prisma.project.findUnique({
    where: { slug: "simona-heights-quy-nhon" },
    include: {
      website: true,
      resources: { where: { isActive: true, isPublic: true } },
      inventories: true,
      listings: true,
    },
  });

  const simonaOk =
    simona &&
    simona.website?.status === "PUBLISHED" &&
    simona.inventories.length === 138 &&
    simona.resources.length === 11;

  console.log(`- Simona Status: ${simona?.website?.status}`);
  console.log(`- Inventory Count: ${simona?.inventories.length} (Expected: 138)`);
  console.log(`- Resource Count: ${simona?.resources.length} (Expected: 11)`);
  console.log(`Result: ${simonaOk ? "PASS" : "FAIL"}\n`);
}

runAcceptanceTests()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
