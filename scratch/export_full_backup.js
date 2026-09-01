const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

async function exportFullBackup() {
  console.log("=== BẮT ĐẦU XUẤT TOÀN BỘ DỮ LIỆU GỐC VỀ MÁY TÍNH ===");

  const [
    users,
    provinces,
    districts,
    projects,
    projectResources,
    projectInventories,
    projectWebsites,
    listings,
    news,
    collaborators,
    customers,
    customerInquiries,
    customerActivities,
    favorites
  ] = await Promise.all([
    prisma.user.findMany(),
    prisma.province.findMany(),
    prisma.district.findMany(),
    prisma.project.findMany(),
    prisma.projectResource.findMany(),
    prisma.projectInventory.findMany(),
    prisma.projectWebsite.findMany(),
    prisma.listing.findMany(),
    prisma.news.findMany(),
    prisma.collaborator.findMany(),
    prisma.customer.findMany(),
    prisma.customerInquiry.findMany(),
    prisma.customerActivity.findMany(),
    prisma.favorite.findMany()
  ]);

  const backupData = {
    exportDate: new Date().toISOString(),
    stats: {
      users: users.length,
      provinces: provinces.length,
      districts: districts.length,
      projects: projects.length,
      projectResources: projectResources.length,
      projectInventories: projectInventories.length,
      projectWebsites: projectWebsites.length,
      listings: listings.length,
      news: news.length,
      collaborators: collaborators.length,
      customers: customers.length,
      customerInquiries: customerInquiries.length,
      customerActivities: customerActivities.length,
      favorites: favorites.length
    },
    data: {
      users,
      provinces,
      districts,
      projects,
      projectResources,
      projectInventories,
      projectWebsites,
      listings,
      news,
      collaborators,
      customers,
      customerInquiries,
      customerActivities,
      favorites
    }
  };

  const backupPath = path.join(__dirname, 'backup_real_database_full.json');
  fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2), 'utf8');

  console.log("✅ XUẤT DỮ LIỆU THÀNH CÔNG 100%!");
  console.log("Thống kê dữ liệu đã lưu trữ an toàn trong máy tính:");
  console.log(JSON.stringify(backupData.stats, null, 2));
  console.log(`Đường dẫn file backup: ${backupPath}`);
}

exportFullBackup().catch(console.error).finally(() => prisma.$disconnect());
