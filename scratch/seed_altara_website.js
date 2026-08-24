const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function seedAltaraWebsite() {
  console.log("=== SEEDING & PUBLISHING ALTARA RESIDENCES WEBSITE ===");

  try {
    // 1. Find Altara project
    const project = await prisma.project.findFirst({
      where: {
        OR: [
          { slug: "altara-residences-quy-nhon" },
          { slug: "altara-residences" },
          { name: { contains: "Altara" } },
        ],
      },
    });

    if (!project) {
      console.error("❌ Project Altara Residences not found in database!");
      return;
    }

    console.log("✅ Found project:", project.id, project.name, project.slug);

    // 2. Sections Config
    const sectionsConfig = [
      { id: "hero", title: "Hero / Banner Trang Chủ", enabled: true, order: 1 },
      { id: "overview", title: "Tổng Quan Dự Án", enabled: true, order: 2 },
      { id: "location", title: "Vị Trí & Kết Nối Giao Thông", enabled: true, order: 3 },
      { id: "amenities", title: "Hệ Thống Tiện Ích Đẳng Cấp 5★", enabled: true, order: 4 },
      { id: "floor_plans", title: "Mặt Bằng Tầng & Khối Đế", enabled: true, order: 5 },
      { id: "unit_types", title: "Loại Căn Hộ & Bảng Hàng", enabled: true, order: 6 },
      { id: "gallery", title: "Bộ Sưu Tập Ảnh Thực Tế", enabled: true, order: 7 },
      { id: "video", title: "Video Showcase & Tour 360°", enabled: true, order: 8 },
      { id: "progress", title: "Tiến Độ & Pháp Lý Bàn Giao", enabled: true, order: 9 },
      { id: "sales_policy", title: "Chính Sách Bán Hàng & Cho Thuê", enabled: true, order: 10 },
      { id: "documents", title: "Tài Liệu & Bảng Giá Dự Án", enabled: true, order: 11 },
      { id: "contact", title: "Form Đăng Ký & Liên Hệ", enabled: true, order: 12 },
    ];

    // 3. Content JSON for Altara Residences Quy Nhơn
    const contentJson = {
      hero: {
        title: "Tổ Hợp Căn Hộ Hạng Sang Altara Residences Quy Nhơn",
        subtitle: "Căn hộ cao cấp thương hiệu quốc tế view biển 360° tọa lạc tại vị trí kim cương trung tâm TP. Quy Nhơn do Alphanam Group phát triển.",
        tagLine: "🏢 Căn Hộ Hạng Sang View Biển Quy Nhơn",
        bgImage: project.thumbnail || "https://res.cloudinary.com/h8s6hyxc/image/upload/v1787029683/jwyfr28dbgib4hwmnclb.jpg",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        ctaText: "Nhận Bảng Giá & Ưu Đãi Mới Nhất",
        ctaLink: "#contact",
      },
      overview: {
        headline: "Tổ hợp căn hộ cao cấp thương hiệu quốc tế đầu tiên tại Quy Nhơn",
        summary: "Altara Residences Quy Nhơn nằm tại vị trí đắt giá số 76 Trần Hưng Đạo, P. Hải Cảng, TP. Quy Nhơn. Dự án cao 40 tầng với 479 căn hộ thiết kế sang trọng, tối ưu tầm nhìn panorama hướng ra vịnh biển Quy Nhơn xanh mát và toàn cảnh thành phố.",
        specs: [
          { label: "Chủ đầu tư", value: project.developer || "Alphanam Group" },
          { label: "Vị trí", value: "76 Trần Hưng Đạo, P. Hải Cảng, Quy Nhơn" },
          { label: "Quy mô", value: "40 Tầng nổi + 2 Tầng hầm (479 căn hộ)" },
          { label: "Pháp lý", value: "Sổ hồng sở hữu lâu dài" },
        ],
      },
      location: {
        address: "76 Trần Hưng Đạo, P. Hải Cảng, TP. Quy Nhơn, Bình Định",
        googleMapUrl: "https://maps.google.com/maps?q=Altara+Residences+Quy+Nhon&t=&z=14&ie=UTF8&iwloc=&output=embed",
        mapImage: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1200&q=80",
        connectivity: [
          { title: "Bãi biển Quy Nhơn", distance: "3 phút (300m)" },
          { title: "Cảng Quy Nhơn & Vịnh biển", distance: "2 phút" },
          { title: "Chợ đêm & Trung tâm ẩm thực", distance: "4 phút" },
          { title: "Sân bay Quốc tế Phù Cát", distance: "35 phút" },
        ],
      },
      amenities: {
        title: "Hệ thống Tiện ích Đẳng cấp 5★ Nổi Bật",
        description: "Trải nghiệm sống đỉnh cao với chuỗi tiện ích tiêu chuẩn quốc tế ngay trong tòa nhà.",
        items: [
          {
            name: "Hồ bơi vô cực ngắm vịnh biển (Sky Pool)",
            image: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=800&q=80",
            desc: "Tọa lạc trên tầng cao nhất tòa nhà với tầm nhìn ôm trọn biển Quy Nhơn.",
          },
          {
            name: "Sky Bar & Nhà hàng cao cấp",
            image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
            desc: "Thưởng thức ẩm thực và cocktail sang trọng với góc nhìn panorama toàn cảnh.",
          },
          {
            name: "Trung tâm thương mại & Shophouse khối đế",
            image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=800&q=80",
            desc: "Mua sắm, ăn uống và dịch vụ giải trí đa dạng ngay tại tầng trệt.",
          },
          {
            name: "Phòng Gym & Spa cao cấp",
            image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80",
            desc: "Trang thiết bị rèn luyện sức khỏe hiện đại cùng dịch vụ chăm sóc sắc đẹp.",
          },
        ],
      },
      floor_plans: {
        title: "Mặt bằng Tầng & Thiết kế Căn hộ Altara",
        description: "Thiết kế thông minh, vuông vức, tối ưu hóa công năng và ánh sáng tự nhiên.",
        blocks: [
          {
            name: "Mặt bằng Tầng Điển Hình (Tầng 3 - 38)",
            image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
            desc: "Bố trí 13 - 14 căn/sàn với 6 thang máy tốc độ cao vận hành êm ái.",
          },
          {
            name: "Mặt bằng Shophouse Khối Đế",
            image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
            desc: "Khu vực kinh doanh thương mại sầm uất ngay mặt tiền đường Trần Hưng Đạo.",
          },
        ],
      },
      unit_types: {
        title: "Các Loại Căn Hộ Tại Altara Residences",
        description: "Đa dạng diện tích từ 60m² - 71m² phục vụ nhu cầu ở thực & đầu tư cho thuê.",
        units: [
          {
            name: "Căn hộ 1PN + 1 (45m² - 50m²)",
            area: "48m²",
            priceFrom: "1.85 tỷ",
            image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
          },
          {
            name: "Căn hộ 2PN (60m² - 71m²)",
            area: "62.2m² - 70.4m²",
            priceFrom: "2.14 tỷ",
            image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
          },
          {
            name: "Căn hộ Góc View Biển 2PN",
            area: "70.4m²",
            priceFrom: "2.44 tỷ",
            image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
          },
        ],
      },
      gallery: {
        title: "Bộ Sưu Tập Hình Ảnh Real Estate Altara",
        description: "Hình ảnh thực tế căn hộ, tầm nhìn ban công và không gian sống tại Altara.",
        images: [
          {
            url: "https://res.cloudinary.com/h8s6hyxc/image/upload/v1787029683/jwyfr28dbgib4hwmnclb.jpg",
            caption: "Phối cảnh tổng thể tòa nhà Altara Residences Quy Nhơn",
          },
          {
            url: "https://res.cloudinary.com/h8s6hyxc/image/upload/v1786942471/pm2sxw3pqa72ezs8hzte.jpg",
            caption: "Phòng khách sang trọng view biển",
          },
          {
            url: "https://res.cloudinary.com/h8s6hyxc/image/upload/v1786942485/eyehzy679j6tmd0q4rvk.jpg",
            caption: "Nội thất bếp & khu vực ăn uống cao cấp",
          },
          {
            url: "https://res.cloudinary.com/h8s6hyxc/image/upload/v1786942505/lmgs0uc8ufo9axfo96bo.jpg",
            caption: "Phòng ngủ ấm cúng tầm nhìn thoáng đãng",
          },
        ],
      },
      video: {
        title: "Trải Nghiệm Thực Tế Video & 360°",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        tour360Url: "https://altararesidences.vn",
      },
      progress: {
        title: "Tiến Độ Đã Bàn Giao & Sổ Hồng",
        items: [
          {
            date: "Bàn giao sẵn sàng",
            title: "Tòa nhà đã đi vào vận hành ổn định",
            image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80",
            desc: "Căn hộ sẵn sàng bàn giao ngay, hạ tầng kỹ thuật và tiện ích đã đưa vào sử dụng hoàn chỉnh.",
          },
          {
            date: "Sổ hồng lâu dài",
            title: "Cấp GCN quyền sở hữu cho cư dân",
            image: "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=800&q=80",
            desc: "Đã hoàn thành cấp sổ hồng lâu dài cho các chủ sở hữu căn hộ Altara Residences.",
          },
        ],
      },
      sales_policy: {
        title: "Chính Sách Giao Dịch & Ưu Đãi Mua Bán / Cho Thuê",
        summary: "Quỹ căn chuyển nhượng & cho thuê trực tiếp giá tốt nhất thị trường. Hỗ trợ vay ngân hàng tới 70% giá trị hợp đồng.",
        pdfUrl: "",
        promos: [
          "Hỗ trợ làm thủ tục sang tên sổ hồng nhanh chóng",
          "Hỗ trợ vay vốn ngân hàng lãi suất ưu đãi lên tới 70%",
          "Quỹ căn full nội thất cao cấp có thể khai thác cho thuê ngay (9tr - 12tr/tháng)",
        ],
      },
      documents: {
        title: "Tài Liệu Bán Hàng & Bảng Giá Altara",
        description: "Tải trọn bộ hồ sơ pháp lý, chính sách bán hàng, bảng giá và tài liệu marketing Altara Residences.",
      },
      contact: {
        title: "Đăng Ký Nhận Bảng Giá Chi Tiết & Xem Căn Hộ Thực Tế",
        subtitle: "Liên hệ ngay đại lý tư vấn chính thức Minh Dũng Land để nhận bảng giá & xem nhà 24/7.",
        hotline: "0905 123 456",
        zaloUrl: "https://zalo.me",
        buttonText: "Đăng Ký Tư Vấn Ngay",
      },
      seo: {
        metaTitle: "Altara Residences Quy Nhơn | Website Thông Tin & Bảng Giá Chính Thức",
        metaDescription: "Trang thông tin chính thức căn hộ Altara Residences Quy Nhơn. Tra cứu bảng giá, quỹ căn bán & cho thuê, mặt bằng và hỗ trợ xem nhà.",
        ogImage: project.thumbnail || "https://res.cloudinary.com/h8s6hyxc/image/upload/v1787029683/jwyfr28dbgib4hwmnclb.jpg",
      },
    };

    const draftSectionsStr = JSON.stringify(sectionsConfig);
    const draftContentStr = JSON.stringify(contentJson);

    // 4. Create or update ProjectWebsite for Altara Residences Quy Nhơn
    const website = await prisma.projectWebsite.upsert({
      where: { projectId: project.id },
      create: {
        projectId: project.id,
        status: "PUBLISHED",
        draftSectionsConfig: draftSectionsStr,
        draftContentJson: draftContentStr,
        draftMetaTitle: contentJson.seo.metaTitle,
        draftMetaDescription: contentJson.seo.metaDescription,
        draftOgImage: contentJson.seo.ogImage,
        publishedSectionsConfig: draftSectionsStr,
        publishedContentJson: draftContentStr,
        publishedMetaTitle: contentJson.seo.metaTitle,
        publishedMetaDescription: contentJson.seo.metaDescription,
        publishedOgImage: contentJson.seo.ogImage,
        publishedAt: new Date(),
      },
      update: {
        status: "PUBLISHED",
        draftSectionsConfig: draftSectionsStr,
        draftContentJson: draftContentStr,
        draftMetaTitle: contentJson.seo.metaTitle,
        draftMetaDescription: contentJson.seo.metaDescription,
        draftOgImage: contentJson.seo.ogImage,
        publishedSectionsConfig: draftSectionsStr,
        publishedContentJson: draftContentStr,
        publishedMetaTitle: contentJson.seo.metaTitle,
        publishedMetaDescription: contentJson.seo.metaDescription,
        publishedOgImage: contentJson.seo.ogImage,
        publishedAt: new Date(),
      },
    });

    console.log("✅ Seeded & Published ProjectWebsite for Altara:", website.id);

    // 5. Update ProjectResource of type WEBSITE to point to internal route /du-an/altara-residences-quy-nhon
    const targetMicrositeUrl = `/du-an/${project.slug}`;

    const existingWebsiteResource = await prisma.projectResource.findFirst({
      where: {
        projectId: project.id,
        type: "WEBSITE",
      },
    });

    if (existingWebsiteResource) {
      await prisma.projectResource.update({
        where: { id: existingWebsiteResource.id },
        data: {
          title: "Website chính thức Altara Residences Quy Nhơn",
          url: targetMicrositeUrl,
          description: "Trang thông tin tổng quan, vị trí, tiện ích, mặt bằng và bảng giá chính thức Altara Residences Quy Nhơn.",
          isPublic: true,
          isActive: true,
        },
      });
      console.log("✅ Updated existing ProjectResource WEBSITE URL to:", targetMicrositeUrl);
    } else {
      await prisma.projectResource.create({
        data: {
          projectId: project.id,
          type: "WEBSITE",
          title: "Website chính thức Altara Residences Quy Nhơn",
          url: targetMicrositeUrl,
          description: "Trang thông tin tổng quan, vị trí, tiện ích, mặt bằng và bảng giá chính thức Altara Residences Quy Nhơn.",
          isPublic: true,
          isActive: true,
          sortOrder: 1,
        },
      });
      console.log("✅ Created ProjectResource WEBSITE URL:", targetMicrositeUrl);
    }

    console.log("=== ALL DONE! ALTARA RESIDENCES WEBSITE IS NOW FULLY MATCHING THE STANDARD TEMPLATE ===");
  } catch (err) {
    console.error("❌ Error seeding Altara website:", err);
  } finally {
    await prisma.$disconnect();
  }
}

seedAltaraWebsite();
