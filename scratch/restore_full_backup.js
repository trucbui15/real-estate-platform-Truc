const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

async function restoreFullBackup() {
  console.log("=== BẮT ĐẦU KHÔI PHỤC DỮ LIỆU TỪ FILE SAO LƯU GỐC ===");
  const backupPath = path.join(__dirname, 'backup_real_database_full.json');
  if (!fs.existsSync(backupPath)) {
    console.error("Không tìm thấy file backup!");
    return;
  }

  const { data } = JSON.parse(fs.readFileSync(backupPath, 'utf8'));

  // 1. Users
  console.log(`Đang nạp ${data.users.length} tài khoản Users...`);
  for (const u of data.users) {
    await prisma.user.upsert({
      where: { id: u.id },
      update: u,
      create: u
    });
  }

  // 2. Provinces & Districts
  console.log(`Đang nạp Provinces & Districts...`);
  for (const p of data.provinces) {
    await prisma.province.upsert({
      where: { id: p.id },
      update: p,
      create: p
    });
  }
  for (const d of data.districts) {
    await prisma.district.upsert({
      where: { id: d.id },
      update: d,
      create: d
    });
  }

  // 3. Projects
  console.log(`Đang nạp ${data.projects.length} Dự án Projects...`);
  for (const proj of data.projects) {
    await prisma.project.upsert({
      where: { id: proj.id },
      update: proj,
      create: proj
    });
  }

  // 4. ProjectResources
  console.log(`Đang nạp ${data.projectResources.length} Tài liệu/Tours ProjectResources...`);
  for (const r of data.projectResources) {
    await prisma.projectResource.upsert({
      where: { id: r.id },
      update: r,
      create: r
    });
  }

  // 5. ProjectInventories
  console.log(`Đang nạp ${data.projectInventories.length} Căn hộ ProjectInventories...`);
  for (const inv of data.projectInventories) {
    await prisma.projectInventory.upsert({
      where: { id: inv.id },
      update: inv,
      create: inv
    });
  }

  // 6. ProjectWebsites
  console.log(`Đang nạp ${data.projectWebsites.length} Microsites ProjectWebsites...`);
  for (const pw of data.projectWebsites) {
    await prisma.projectWebsite.upsert({
      where: { id: pw.id },
      update: pw,
      create: pw
    });
  }

  // 7. Listings
  console.log(`Đang nạp ${data.listings.length} BĐS Listings...`);
  for (const l of data.listings) {
    await prisma.listing.upsert({
      where: { id: l.id },
      update: l,
      create: l
    });
  }

  // 8. Collaborators
  for (const c of data.collaborators) {
    await prisma.collaborator.upsert({
      where: { id: c.id },
      update: c,
      create: c
    });
  }

  console.log("🎉 KHÔI PHỤC DỮ LIỆU THÀNH CÔNG 100% VÀO DATABASE HIỆN TẠI!");
}

restoreFullBackup().catch(console.error).finally(() => prisma.$disconnect());
