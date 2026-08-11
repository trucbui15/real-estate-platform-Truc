import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Find existing admin or fallback
  let admin = await prisma.user.findFirst({
    where: { role: "ADMIN", active: true },
  });

  if (!admin) {
    const pass = await bcrypt.hash("Truc@010503", 10);
    admin = await prisma.user.create({
      data: {
        name: "Bùi Thị Trúc",
        email: "buithitruc05@gmail.com",
        passwordHash: pass,
        role: "ADMIN",
        phone: "0393118322",
        referralCode: "MD_T01",
        active: true,
      },
    });
  }

  const manager = admin;
  const staff = admin;


  // Khu vực
  const binhDinh = await prisma.province.upsert({
    where: { slug: "binh-dinh" },
    update: {},
    create: { name: "Bình Định", slug: "binh-dinh" },
  });
  const hcm = await prisma.province.upsert({
    where: { slug: "tp-hcm" },
    update: {},
    create: { name: "TP. Hồ Chí Minh", slug: "tp-hcm" },
  });

  const quyNhon = await prisma.district.upsert({
    where: { provinceId_slug: { provinceId: binhDinh.id, slug: "quy-nhon" } },
    update: {},
    create: { name: "TP. Quy Nhơn", slug: "quy-nhon", provinceId: binhDinh.id },
  });

  // Danh sách các dự án Quy Nhơn tiêu biểu
  const projectList = [
    {
      name: "Altara Residences Quy Nhơn",
      slug: "altara-residences-quy-nhon",
      developer: "Alphanam Group",
      address: "76 Trần Hưng Đạo, P. Hải Cảng, TP. Quy Nhơn",
      description: "Tổ hợp căn hộ cao cấp view biển trực diện với thiết kế hiện đại và tiện ích chuẩn 5 sao.",
      featured: true,
    },
    {
      name: "Simona Heights Quy Nhơn",
      slug: "simona-heights-quy-nhon",
      developer: "Phú Sơn Thuận",
      address: "145 Trần Hưng Đạo, P. Trần Hưng Đạo, TP. Quy Nhơn",
      description: "Dự án căn hộ hạng sang chuẩn phong cách sống thượng lưu giữa lòng Quy Nhơn.",
      featured: true,
    },
    {
      name: "The Sailing Quy Nhơn",
      slug: "the-sailing-quy-nhon",
      developer: "Đô Thành Land",
      address: "Đường Lê Duẩn, P. Lý Thường Kiệt, TP. Quy Nhơn",
      description: "Tòa tháp đôi biểu tượng nghỉ dưỡng 5 sao trung tâm thành phố biển Quy Nhơn.",
      featured: true,
    },
    {
      name: "Phú Tài Residence Quy Nhơn",
      slug: "phu-tai-residence-quy-nhon",
      developer: "Phú Tài Joint Stock Company",
      address: "Khu đô thị thương mại An Phú Thịnh, TP. Quy Nhơn",
      description: "Căn hộ chung cư cao cấp với hệ thống tiện ích phong phú, pháp lý sổ hồng lâu dài.",
      featured: true,
    },
    {
      name: "Phú Tài Central Life Quy Nhơn",
      slug: "phu-tai-central-life-quy-nhon",
      developer: "Công ty Cổ phần Phú Tài",
      address: "Đường Hoàng Văn Thụ, P. Quang Trung, TP. Quy Nhơn",
      description: "Dự án căn hộ hiện đại tối ưu không gian sống cho gia đình trẻ tại Quy Nhơn.",
      featured: true,
    },
    {
      name: "Quy Nhơn Iconic",
      slug: "quy-nhon-iconic",
      developer: "Iconic Quy Nhơn",
      address: "Đường Nguyễn Tất Thành, TP. Quy Nhơn",
      description: "Tổ hợp căn hộ cao cấp và trung tâm thương mại biểu tượng phong cách sống mới.",
      featured: true,
    },
    {
      name: "Solera Quy Nhơn",
      slug: "solera-quy-nhon",
      developer: "Solera Land",
      address: "TP. Quy Nhơn, Tỉnh Bình Định",
      description: "Khu đô thị ven biển hiện đại quy hoạch đồng bộ hạ tầng và tiện ích nghỉ dưỡng.",
      featured: true,
    },
    {
      name: "MerryLand Quy Nhơn",
      slug: "merryland-quy-nhon",
      developer: "Hưng Thịnh Corporation",
      address: "Hải Giang, Nhơn Hải, TP. Quy Nhơn",
      description: "Siêu quần thể du lịch nghỉ dưỡng thương mại hội tụ trải nghiệm giải trí đẳng cấp quốc tế.",
      featured: true,
    },
    {
      name: "Ecolife Riverside Quy Nhơn",
      slug: "ecolife-riverside-quy-nhon",
      developer: "Capital House",
      address: "Đường Điện Biên Phủ, P. Nhơn Bình, TP. Quy Nhơn",
      description: "Chung cư xanh chứng nhận EDGE hàng đầu tại Bình Định với cảnh quan ven sông thoáng mát.",
      featured: false,
    },
    {
      name: "TMS Luxury Quy Nhơn",
      slug: "tms-luxury-quy-nhon",
      developer: "TMS Group",
      address: "28 Nguyễn Huệ, P. Lê Lợi, TP. Quy Nhơn",
      description: "Khách sạn và căn hộ du lịch chuẩn 5 sao với bể bơi vô cực trên tầng thượng.",
      featured: false,
    },
    {
      name: "FLC Sea Tower Quy Nhơn",
      slug: "flc-sea-tower-quy-nhon",
      developer: "FLC Group",
      address: "Đường An Dương Vương, P. Nguyễn Văn Cừ, TP. Quy Nhơn",
      description: "Tòa tháp căn hộ du lịch nghỉ dưỡng view biển đẹp bậc nhất TP. Quy Nhơn.",
      featured: false,
    },
    {
      name: "Oriva Bay Quy Nhơn",
      slug: "oriva-bay-quy-nhon",
      developer: "Oriva Việt Nam",
      address: "TP. Quy Nhơn, Tỉnh Bình Định",
      description: "Dự án phức hợp thương mại và căn hộ cao cấp giáp biển Quy Nhơn.",
      featured: false,
    },
    {
      name: "KĐT An Phú Thịnh Quy Nhơn",
      slug: "an-phu-thinh-quy-nhon",
      developer: "An Phú Thịnh Corp",
      address: "P. Nhơn Bình & P. Đống Đa, TP. Quy Nhơn",
      description: "Khu đô thị mới quy mô lớn tích hợp nhà phố, biệt thự và căn hộ chung cư.",
      featured: false,
    },
    {
      name: "Melody Quy Nhơn",
      slug: "quy-nhon-melody",
      developer: "Hưng Thịnh Land",
      address: "Đường Nguyễn Trung Tín & Chương Dương, TP. Quy Nhơn",
      description: "Tổ hợp căn hộ du lịch biển nằm ngay trung tâm thành phố Quy Nhơn.",
      featured: false,
    },
    {
      name: "Richmond Quy Nhơn",
      slug: "richmond-quy-nhon",
      developer: "Hưng Thịnh Land",
      address: "Đường Chế Lan Viên, P. Ghềnh Ráng, TP. Quy Nhơn",
      description: "Khu đô thị kiểu mẫu với nhà phố liên kế và biệt thự đẳng cấp phong cách Pháp.",
      featured: false,
    },
    {
      name: "Nhơn Hội New City",
      slug: "nhon-hoi-new-city",
      developer: "Phát Đạt Corporation",
      address: "Khu kinh tế Nhơn Hội, TP. Quy Nhơn",
      description: "Khu đô thị sinh thái ven biển quy mô lớn giáp quần thể nghỉ dưỡng FLC Quy Nhơn.",
      featured: false,
    },
    {
      name: "FLC Luxury Resort Quy Nhơn",
      slug: "flc-luxury-resort-quy-nhon",
      developer: "FLC Group",
      address: "Khu kinh tế Nhơn Hội, TP. Quy Nhơn",
      description: "Quần thể biệt thự nghỉ dưỡng và sân golf 36 hố tiêu chuẩn quốc tế.",
      featured: false,
    },
    {
      name: "The Ocean Resort Villas Quy Nhơn",
      slug: "the-ocean-resort-villas-quy-nhon",
      developer: "VinaCapital",
      address: "Nhơn Lý, TP. Quy Nhơn, Tỉnh Bình Định",
      description: "Khu biệt thự biển sang trọng khép kín mang trải nghiệm nghỉ dưỡng đích thực.",
      featured: false,
    },
    {
      name: "Cadia Quy Nhơn",
      slug: "cardia-quy-nhon",
      developer: "Phát Đạt Corporation",
      address: "Số 1 Ngô Mây, P. Lý Thường Kiệt, TP. Quy Nhơn",
      description: "Tổ hợp thương mại dịch vụ và căn hộ du lịch biển 5 sao quảng trường trung tâm Quy Nhơn.",
      featured: false,
    },
  ];

  const createdProjects: Record<string, any> = {};

  for (const p of projectList) {
    const proj = await prisma.project.upsert({
      where: { slug: p.slug },
      update: {
        provinceId: binhDinh.id,
        districtId: quyNhon.id,
        featured: p.featured,
        isActive: true,
      },
      create: {
        name: p.name,
        slug: p.slug,
        developer: p.developer,
        address: p.address,
        provinceId: binhDinh.id,
        districtId: quyNhon.id,
        description: p.description,
        featured: p.featured,
        isActive: true,
        authorId: manager.id,
      },
    });
    createdProjects[p.slug] = proj;
  }

  // Tin đăng mẫu
  const sample = [
    {
      unitCode: "SP-ALTARA01",
      title: "Bán căn hộ Altara Residences Quy Nhơn - 2PN View biển cực đẹp",
      projectSlug: "altara-residences-quy-nhon",
      transactionType: "SALE" as const,
      salePrice: 3_200_000_000,
      propertyType: "CAN_HO" as const,
      area: 69,
      bedrooms: 2,
      bathrooms: 2,
      doorDirection: "DONG_NAM" as const,
      furnitureStatus: "FULL_NOI_THAT" as const,
      legalStatus: "SO_DO_HONG" as const,
      unitStatus: "DANG_BAN" as const,
      verified: true,
      block: "Tháp A",
      floor: "12",
    },
    {
      unitCode: "SP-ALTARA02",
      title: "Cho thuê căn hộ Altara Residences Quy Nhơn - 3PN full nội thất cao cấp",
      projectSlug: "altara-residences-quy-nhon",
      transactionType: "RENT" as const,
      rentPrice: 15_000_000,
      propertyType: "CAN_HO" as const,
      area: 86,
      bedrooms: 3,
      bathrooms: 2,
      doorDirection: "TAY_BAC" as const,
      furnitureStatus: "FULL_NOI_THAT" as const,
      legalStatus: "SO_DO_HONG" as const,
      unitStatus: "DANG_CHO_THUE" as const,
      verified: true,
      block: "Tháp B",
      floor: "8",
    },
    {
      unitCode: "SP-SIMONA01",
      title: "Bán căn hộ Simona Heights Quy Nhơn - 2PN tầng trung view thoáng",
      projectSlug: "simona-heights-quy-nhon",
      transactionType: "SALE" as const,
      salePrice: 2_850_000_000,
      propertyType: "CAN_HO" as const,
      area: 65,
      bedrooms: 2,
      bathrooms: 2,
      doorDirection: "DONG_NAM" as const,
      furnitureStatus: "CO_BAN" as const,
      legalStatus: "HOP_DONG_MUA_BAN" as const,
      unitStatus: "DANG_BAN" as const,
      verified: true,
      block: "Tháp Simona 1",
      floor: "15",
    },
    {
      unitCode: "SP-SIMONA02",
      title: "Bán căn 3PN Simona Heights Quy Nhơn căn góc 2 mặt tiền",
      projectSlug: "simona-heights-quy-nhon",
      transactionType: "SALE" as const,
      salePrice: 4_100_000_000,
      propertyType: "CAN_HO" as const,
      area: 88,
      bedrooms: 3,
      bathrooms: 2,
      doorDirection: "BAC" as const,
      furnitureStatus: "FULL_NOI_THAT" as const,
      legalStatus: "SO_DO_HONG" as const,
      unitStatus: "DANG_BAN" as const,
      verified: true,
      block: "Tháp Simona 2",
      floor: "20",
    },
    {
      unitCode: "SP-SAILING01",
      title: "Cho thuê căn hộ The Sailing Quy Nhơn 1PN view biển trực diện",
      projectSlug: "the-sailing-quy-nhon",
      transactionType: "RENT" as const,
      rentPrice: 10_000_000,
      propertyType: "CAN_HO" as const,
      area: 48,
      bedrooms: 1,
      bathrooms: 1,
      doorDirection: "DONG" as const,
      furnitureStatus: "FULL_NOI_THAT" as const,
      legalStatus: "HOP_DONG_MUA_BAN" as const,
      unitStatus: "DANG_CHO_THUE" as const,
      verified: true,
      block: "Tháp A",
      floor: "18",
    },
  ];

  for (const s of sample) {
    const proj = createdProjects[s.projectSlug];
    await prisma.listing.upsert({
      where: { unitCode: s.unitCode },
      update: {
        projectId: proj?.id,
        provinceId: binhDinh.id,
        districtId: quyNhon.id,
      },
      create: {
        unitCode: s.unitCode,
        title: s.title,
        transactionType: s.transactionType,
        salePrice: s.salePrice,
        rentPrice: s.rentPrice,
        propertyType: s.propertyType,
        area: s.area,
        bedrooms: s.bedrooms,
        bathrooms: s.bathrooms,
        doorDirection: s.doorDirection,
        furnitureStatus: s.furnitureStatus,
        legalStatus: s.legalStatus,
        unitStatus: s.unitStatus,
        verified: s.verified,
        block: s.block,
        floor: s.floor,
        slug: s.unitCode.toLowerCase(),
        projectId: proj?.id,
        provinceId: binhDinh.id,
        districtId: quyNhon.id,
        authorId: staff.id,
        description: `Bất động sản thuộc dự án ${proj?.name || "Quy Nhơn"}, vị trí đẹp, tiện ích đồng bộ, an ninh 24/7.`,
      },
    });
  }

  // Seed mẫu ProjectResource (Bao gồm 10 link 360° thực tế chuẩn xác từ LadiPage)
  const sampleResources = [
    // 1. TOÀN CẢNH QUY NHƠN (Resource toàn thành phố - projectId = null)
    {
      projectSlug: null,
      type: "TOUR_360" as const,
      title: "Toàn cảnh 360° Quy Nhơn",
      url: "https://diaocnamtrungbo.vn/360-toan-canh-quy-nhon/",
      description: "Virtual tour 360° toàn cảnh không gian thành phố Quy Nhơn, tỉnh Bình Định",
      isPublic: true,
      isActive: true,
      sortOrder: 0,
    },

    // 2. SIMONA HEIGHTS
    {
      projectSlug: "simona-heights-quy-nhon",
      type: "TOUR_360" as const,
      title: "Toàn cảnh 360° Simona Heights",
      url: "https://simonaheights.vn/vr360/index.html",
      description: "Virtual tour 360° căn hộ và toàn cảnh dự án Simona Heights Quy Nhơn",
      isPublic: true,
      isActive: true,
      sortOrder: 1,
    },
    {
      projectSlug: "simona-heights-quy-nhon",
      type: "WEBSITE" as const,
      title: "Website chính thức Simona Heights",
      url: "https://simonaheights.vn",
      description: "Trang chủ giới thiệu tổng quan dự án Simona Heights Quy Nhơn",
      isPublic: true,
      isActive: true,
      sortOrder: 2,
    },
    {
      projectSlug: "simona-heights-quy-nhon",
      type: "GENERAL_INFO" as const,
      title: "Tổng thông tin dự án Simona Heights",
      url: "https://www.minhdungland.com.vn/tongthongtinduanquynhon",
      description: "Hồ sơ tổng quan thông tin, vị trí, bảng giá và tình trạng Simona Heights",
      isPublic: true,
      isActive: true,
      sortOrder: 3,
    },

    // 3. PHÚ TÀI CENTRAL LIFE
    {
      projectSlug: "phu-tai-central-life-quy-nhon",
      type: "TOUR_360" as const,
      title: "Toàn cảnh 360° Phú Tài Central Life",
      url: "https://studio1.asia/360-phu-tai-central-life/",
      description: "Trải nghiệm thực tế ảo 360° dự án căn hộ Phú Tài Central Life Quy Nhơn",
      isPublic: true,
      isActive: true,
      sortOrder: 1,
    },
    {
      projectSlug: "phu-tai-central-life-quy-nhon",
      type: "GENERAL_INFO" as const,
      title: "Tổng thông tin Phú Tài Central Life",
      url: "https://www.minhdungland.com.vn/tongthongtinduanquynhon",
      description: "Thông tin quy hoạch, căn hộ mẫu và vị trí Phú Tài Central Life",
      isPublic: true,
      isActive: true,
      sortOrder: 2,
    },

    // 4. THE SAILING QUY NHƠN (Giữ nguyên ?lang=vn)
    {
      projectSlug: "the-sailing-quy-nhon",
      type: "TOUR_360" as const,
      title: "Toàn cảnh 360° The Sailing Quy Nhơn",
      url: "https://vni.pro.vn/fh/TheSailingQuyNhon?lang=vn",
      description: "Virtual tour 360° tòa tháp đôi biểu tượng The Sailing Quy Nhơn",
      isPublic: true,
      isActive: true,
      sortOrder: 1,
    },
    {
      projectSlug: "the-sailing-quy-nhon",
      type: "WEBSITE" as const,
      title: "Website The Sailing Quy Nhơn",
      url: "https://thesailingquynhon.vn",
      description: "Cổng thông tin biểu tượng nghỉ dưỡng The Sailing Quy Nhơn",
      isPublic: true,
      isActive: true,
      sortOrder: 2,
    },

    // 5. QUY NHƠN ICONIC
    {
      projectSlug: "quy-nhon-iconic",
      type: "TOUR_360" as const,
      title: "Toàn cảnh 360° Quy Nhơn Iconic",
      url: "https://quynhoniconic.com.vn/thu-vien/360.html",
      description: "Thư viện trải nghiệm thực tế ảo 360° dự án Quy Nhơn Iconic",
      isPublic: true,
      isActive: true,
      sortOrder: 1,
    },

    // 6. MELODY QUY NHƠN
    {
      projectSlug: "quy-nhon-melody",
      type: "TOUR_360" as const,
      title: "Toàn cảnh 360° Melody Quy Nhơn",
      url: "https://quynhonmelody.com.vn/vr360/",
      description: "Virtual tour 360° căn hộ nghỉ dưỡng Melody Quy Nhơn",
      isPublic: true,
      isActive: true,
      sortOrder: 1,
    },

    // 7. SOLERA QUY NHƠN
    {
      projectSlug: "solera-quy-nhon",
      type: "TOUR_360" as const,
      title: "Toàn cảnh 360° Solera Quy Nhơn",
      url: "https://vr.soleraquynhon.vn/",
      description: "Trải nghiệm không gian ảo 360° Solera Quy Nhơn",
      isPublic: true,
      isActive: true,
      sortOrder: 1,
    },

    // 8. RICHMOND QUY NHƠN
    {
      projectSlug: "richmond-quy-nhon",
      type: "TOUR_360" as const,
      title: "Toàn cảnh 360° Richmond Quy Nhơn",
      url: "https://richmondquynhon.com.vn/vr360/",
      description: "Trải nghiệm không gian ảo 360° khu đô thị Richmond Quy Nhơn",
      isPublic: true,
      isActive: true,
      sortOrder: 1,
    },

    // 9. FLC LUXURY RESORT QUY NHƠN
    {
      projectSlug: "flc-luxury-resort-quy-nhon",
      type: "TOUR_360" as const,
      title: "Toàn cảnh 360° FLC Luxury Resort Quy Nhơn",
      url: "https://flchotelsresorts.com/360_QN/app-files/index.html",
      description: "Toàn cảnh 360° quần thể nghỉ dưỡng FLC Luxury Resort Quy Nhơn",
      isPublic: true,
      isActive: true,
      sortOrder: 1,
    },

    // 10. MERRYLAND QUY NHƠN (URL chính xác: https://vni.pro.vn/tour/114dvRcBmetAD7glVS/temp)
    {
      projectSlug: "merryland-quy-nhon",
      type: "TOUR_360" as const,
      title: "Toàn cảnh 360° MerryLand Quy Nhơn",
      url: "https://vni.pro.vn/tour/114dvRcBmetAD7glVS/temp",
      description: "Siêu quần thể du lịch nghỉ dưỡng MerryLand Quy Nhơn 360° Tour",
      isPublic: true,
      isActive: true,
      sortOrder: 1,
    },

    // ALTARA RESIDENCES (Website & General Info)
    {
      projectSlug: "altara-residences-quy-nhon",
      type: "WEBSITE" as const,
      title: "Website Altara Residences Quy Nhơn",
      url: "https://altararesidences.vn",
      description: "Trang thông tin chính thức căn hộ Altara Quy Nhơn",
      isPublic: true,
      isActive: true,
      sortOrder: 1,
    },
    {
      projectSlug: "altara-residences-quy-nhon",
      type: "GENERAL_INFO" as const,
      title: "Tổng thông tin Altara Residences",
      url: "https://www.minhdungland.com.vn/tongthongtinduanquynhon",
      description: "Tổng hợp pháp lý, vị trí và mặt bằng căn hộ Altara Residences",
      isPublic: true,
      isActive: true,
      sortOrder: 2,
    },
  ];

  for (const r of sampleResources) {
    const targetProjectId = r.projectSlug ? createdProjects[r.projectSlug]?.id : null;

    // Chống trùng lặp theo URL
    const existing = await prisma.projectResource.findFirst({
      where: { url: r.url },
    });

    if (existing) {
      await prisma.projectResource.update({
        where: { id: existing.id },
        data: {
          projectId: targetProjectId,
          type: r.type,
          title: r.title,
          description: r.description,
          isPublic: r.isPublic,
          isActive: r.isActive,
          sortOrder: r.sortOrder,
        },
      });
    } else {
      await prisma.projectResource.create({
        data: {
          projectId: targetProjectId,
          type: r.type,
          title: r.title,
          url: r.url,
          description: r.description,
          isPublic: r.isPublic,
          isActive: r.isActive,
          sortOrder: r.sortOrder,
        },
      });
    }
  }

  console.log("Seed hoàn tất. Đã thêm đầy đủ dự án Quy Nhơn & sản phẩm mẫu.");
  console.log("Tài khoản demo (mật khẩu: 123456):");
  console.log("- admin@demo.vn (Admin)");
  console.log("- manager@demo.vn (Quản lý)");
  console.log("- staff@demo.vn (Nhân viên)");
  console.log("- customer@demo.vn (Khách hàng)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

