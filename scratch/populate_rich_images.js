const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const projectImages = {
  "altara-residences-quy-nhon": {
    thumbnail: "https://res.cloudinary.com/h8s6hyxc/image/upload/v1787029683/jwyfr28dbgib4hwmnclb.jpg",
    images: [
      "https://res.cloudinary.com/h8s6hyxc/image/upload/v1787029683/jwyfr28dbgib4hwmnclb.jpg",
      "https://res.cloudinary.com/h8s6hyxc/image/upload/v1786942471/pm2sxw3pqa72ezs8hzte.jpg",
      "https://res.cloudinary.com/h8s6hyxc/image/upload/v1786942485/eyehzy679j6tmd0q4rvk.jpg",
      "https://res.cloudinary.com/h8s6hyxc/image/upload/v1786942505/lmgs0uc8ufo9axfo96bo.jpg"
    ]
  },
  "simona-heights-quy-nhon": {
    thumbnail: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  "the-sailing-quy-nhon": {
    thumbnail: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  "phu-tai-residence-quy-nhon": {
    thumbnail: "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  "phu-tai-central-life-quy-nhon": {
    thumbnail: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  "quy-nhon-iconic": {
    thumbnail: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  "solera-quy-nhon": {
    thumbnail: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  "merryland-quy-nhon": {
    thumbnail: "https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  "ecolife-riverside-quy-nhon": {
    thumbnail: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  "tms-luxury-quy-nhon": {
    thumbnail: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  "flc-sea-tower-quy-nhon": {
    thumbnail: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  "oriva-bay-quy-nhon": {
    thumbnail: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  "an-phu-thinh-quy-nhon": {
    thumbnail: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  "quy-nhon-melody": {
    thumbnail: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  "richmond-quy-nhon": {
    thumbnail: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  "nhon-hoi-new-city": {
    thumbnail: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  "flc-luxury-resort-quy-nhon": {
    thumbnail: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  "the-ocean-resort-villas-quy-nhon": {
    thumbnail: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  "cardia-quy-nhon": {
    thumbnail: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80"
    ]
  }
};

async function main() {
  console.log("=== BẮT ĐẦU CẬP NHẬT ẢNH CHO TẤT CẢ DỰ ÁN & TIN ĐĂNG ===");

  // 1. Cập nhật ảnh cho từng dự án
  for (const [slug, data] of Object.entries(projectImages)) {
    const proj = await prisma.project.findUnique({ where: { slug } });
    if (proj) {
      await prisma.project.update({
        where: { id: proj.id },
        data: {
          thumbnail: data.thumbnail,
          images: JSON.stringify(data.images),
        }
      });
      console.log(`✅ Đã cập nhật ảnh đại diện & gallery cho dự án: ${proj.name}`);
    }
  }

  // 2. Cập nhật ảnh cho tất cả Listings
  const listings = await prisma.listing.findMany({
    include: { project: true }
  });

  for (const l of listings) {
    let listImg = [];
    if (l.project && projectImages[l.project.slug]) {
      listImg = projectImages[l.project.slug].images;
    } else {
      listImg = [
        "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
      ];
    }

    await prisma.listing.update({
      where: { id: l.id },
      data: {
        images: JSON.stringify(listImg)
      }
    });
    console.log(`✅ Đã cập nhật ảnh cho tin đăng: ${l.title}`);
  }

  console.log("\n🎉 HOÀN TẤT CẬP NHẬT HÌNH ẢNH 100%!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
