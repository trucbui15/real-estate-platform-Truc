const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const sourceDir = path.join(__dirname, 'simona', 'sources');
  const targetDir = path.join(__dirname, '..', 'public', 'uploads', 'simona');

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Copy images from scratch/simona/sources to public/uploads/simona
  const imageFiles = fs.readdirSync(sourceDir).filter(f => /\.(jpg|png|webp)$/i.test(f));
  console.log(`Tìm thấy ${imageFiles.length} hình ảnh sơ đồ/mặt bằng trong nguồn scratch.`);

  const copiedUrls = [];
  for (const file of imageFiles) {
    const srcPath = path.join(sourceDir, file);
    const destPath = path.join(targetDir, file);
    fs.copyFileSync(srcPath, destPath);
    copiedUrls.push(`/uploads/simona/${file}`);
  }
  console.log(`Đã copy ${copiedUrls.length} ảnh sang thư mục public/uploads/simona!`);

  // Map floorplan images by bedroom count
  // 1PN: imgi_8_3a, imgi_6_1a
  // 2PN: imgi_9_4a, imgi_11_6a, imgi_13_8a
  // 3PN: imgi_12_7a, imgi_10_5a, imgi_14_9a
  const img1PN = copiedUrls.filter(u => u.includes('imgi_8') || u.includes('imgi_6') || u.includes('9xs1'));
  const img2PN = copiedUrls.filter(u => u.includes('imgi_9') || u.includes('imgi_11') || u.includes('imgi_13'));
  const img3PN = copiedUrls.filter(u => u.includes('imgi_12') || u.includes('imgi_10') || u.includes('imgi_14') || u.includes('90f6c'));
  const defaultImg = copiedUrls.find(u => u.includes('imgi_12')) || copiedUrls[0];

  const project = await prisma.project.findUnique({
    where: { slug: "simona-heights-quy-nhon" },
    include: { inventories: true }
  });

  if (!project) {
    console.error("Không tìm thấy dự án Simona!");
    return;
  }

  console.log(`Gán ảnh mặt bằng sơ đồ cho ${project.inventories.length} căn hộ của dự án ${project.name}...`);

  let count = 0;
  for (let i = 0; i < project.inventories.length; i++) {
    const unit = project.inventories[i];
    let selectedImg = defaultImg;

    if (unit.bedrooms === 1 && img1PN.length > 0) {
      selectedImg = img1PN[i % img1PN.length];
    } else if (unit.bedrooms === 2 && img2PN.length > 0) {
      selectedImg = img2PN[i % img2PN.length];
    } else if (unit.bedrooms === 3 && img3PN.length > 0) {
      selectedImg = img3PN[i % img3PN.length];
    }

    const imagesJson = JSON.stringify([selectedImg]);

    await prisma.projectInventory.update({
      where: { id: unit.id },
      data: { images: imagesJson }
    });
    count++;
  }

  console.log(`\nTHÀNH CÔNG: Đã gán ảnh mặt bằng cho ${count} / ${project.inventories.length} căn hộ Simona Heights!`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
