const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function seedSimonaHeights() {
  console.log("--- SEEDING SIMONA HEIGHTS SAMPLE CMS DATA ---");

  try {
    // 1. Ensure project Simona Heights exists
    let project = await prisma.project.findUnique({
      where: { slug: "simona-heights" },
    });

    if (!project) {
      project = await prisma.project.create({
        data: {
          name: "Simona Heights Quy Nhơn",
          slug: "simona-heights",
          developer: "Công ty Cổ phần Đầu tư Bất động sản Simona",
          address: "145 Trần Hưng Đạo, P. Lê Hồng Phong, TP. Quy Nhơn, Bình Định",
          description: "Tổ hợp căn hộ hạng sang chuẩn phong cách Chăm Pa & Địa Trung Hải trung tâm TP. Quy Nhơn.",
          thumbnail: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
          isActive: true,
          featured: true,
        },
      });
      console.log("Created project Simona Heights:", project.id);
    } else {
      console.log("Existing project Simona Heights found:", project.id);
    }

    // 2. Sample Sections Config
    const sectionsConfig = [
      { id: "hero", title: "Hero / Banner Trang Chủ", enabled: true, order: 1 },
      { id: "overview", title: "Tổng Quan Dự Án", enabled: true, order: 2 },
      { id: "location", title: "Vị Trí & Kết Nối Giao Thông", enabled: true, order: 3 },
      { id: "amenities", title: "Hệ Thống Tiện Ích Đẳng Cấp", enabled: true, order: 4 },
      { id: "floor_plans", title: "Mặt Bằng Tầng & Khối Đế", enabled: true, order: 5 },
      { id: "unit_types", title: "Loại Căn Hộ & Thiết Kế", enabled: true, order: 6 },
      { id: "gallery", title: "Bộ Sưu Tập Ảnh Thực Tế", enabled: true, order: 7 },
      { id: "video", title: "Video Showcase & Tour 360°", enabled: true, order: 8 },
      { id: "progress", title: "Cập Nhật Tiến Độ Thi Công", enabled: true, order: 9 },
      { id: "sales_policy", title: "Chính Sách Bán Hàng & Ưu Đãi", enabled: true, order: 10 },
      { id: "documents", title: "Tài Liệu & Bảng Giá Dự Án", enabled: true, order: 11 },
      { id: "contact", title: "Form Đăng Ký & Liên Hệ", enabled: true, order: 12 },
    ];

    // 3. Sample Content JSON for Simona Heights
    const contentJson = {
      hero: {
        title: "Tổ Hợp Căn Hộ Hạng Sang Simona Heights Quy Nhơn",
        subtitle: "Biểu tượng sống đẳng cấp trung tâm thành phố biển Quy Nhơn với kiến trúc Art Deco hòa quyện văn hóa Chăm Pa độc bản.",
        tagLine: "🏨 Dịch Vụ Đặt Phòng & Căn Hộ View Biển",
        bgImage: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=80",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        ctaText: "Đăng ký nhận Bảng Giá & Khuyến Mãi",
        ctaLink: "#contact",
      },
      overview: {
        headline: "Biểu tượng sống thượng lưu bên bờ vịnh Quy Nhơn",
        summary: "Simona Heights là tổ hợp căn hộ cao cấp bậc nhất trung tâm thành phố Quy Nhơn, quy mô 2 tòa tháp cao 29 tầng với hơn 600 căn hộ sang trọng cùng hệ tiện ích đặc quyền chuẩn 5 sao.",
        specs: [
          { label: "Vị trí", value: "145 Trần Hưng Đạo, Quy Nhơn" },
          { label: "Quy mô", value: "2 Tòa tháp (29 Tầng + 2 Tầng hầm)" },
          { label: "Loại hình", value: "Căn hộ 1PN - 3PN & Penthouse" },
          { label: "Bàn giao", value: "Nội thất cao cấp tiêu chuẩn 5★" },
        ],
      },
      location: {
        address: "145 Trần Hưng Đạo, P. Lê Hồng Phong, TP. Quy Nhơn, Bình Định",
        googleMapUrl: "https://maps.google.com/maps?q=Quy+Nhon&t=&z=13&ie=UTF8&iwloc=&output=embed",
        mapImage: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1200&q=80",
        connectivity: [
          { title: "Bãi biển Quy Nhơn", distance: "2 phút (150m)" },
          { title: "Quảng trường Nguyễn Tất Thành", distance: "3 phút" },
          { title: "Chợ đêm Quy Nhơn & Ẩm thực", distance: "4 phút" },
          { title: "Sân bay Phù Cát", distance: "35 phút" },
        ],
      },
      amenities: {
        title: "Hệ thống Tiện ích Đặc quyền 5★",
        description: "Hơn 50+ tiện ích nội khu đẳng cấp thượng lưu trải dài từ khối đế tới tầng thượng.",
        items: [
          { name: "Hồ bơi vô cực ngắm vịnh biển", image: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=800&q=80", desc: "Tầm nhìn 360 độ ôm trọn biển Quy Nhơn." },
          { name: "Sky Bar & Lounge tầng thượng", image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80", desc: "Không gian thư giãn đẳng cấp ban đêm." },
          { name: "Trung tâm Fitness & Spa cao cấp", image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80", desc: "Trang thiết bị hiện đại nhập khẩu." },
        ],
      },
      floor_plans: {
        title: "Mặt bằng Tầng & Kiến trúc Căn hộ",
        description: "Thiết kế thông minh, tối ưu ánh sáng tự nhiên và luồng gió biển.",
        blocks: [
          { name: "Mặt bằng Tầng Điển Hình (Tầng 5 - 20)", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80", desc: "Mật độ chỉ 12 căn/sàn với 4 thang máy tốc độ cao." },
          { name: "Mặt bằng Tầng 21 - 29 (Penthouse & Duplex)", image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80", desc: "Căn hộ sang trọng tầm nhìn Panorama toàn cảnh thành phố." },
        ],
      },
      unit_types: {
        title: "Thiết kế Căn hộ Mẫu",
        description: "Đa dạng diện tích đáp ứng nhu cầu an cư và đầu tư cho thuê.",
        units: [
          { name: "Căn hộ 1PN (38m² - 45m²)", area: "42m²", priceFrom: "1.45 tỷ", image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80" },
          { name: "Căn hộ 2PN (65m² - 72m²)", area: "68m²", priceFrom: "2.15 tỷ", image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80" },
          { name: "Căn hộ 3PN (85m² - 105m²)", area: "92m²", priceFrom: "3.20 tỷ", image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80" },
        ],
      },
      gallery: {
        title: "Bộ Sưu Tập Hình Ảnh Real Estate",
        description: "Cập nhật hình ảnh thực tế công trình và phối cảnh sắc nét.",
        images: [
          { url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80", caption: "Phối cảnh tổng thể Simona Heights" },
          { url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80", caption: "Ban công view biển trực diện" },
          { url: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80", caption: "Phòng khách nội thất sang trọng" },
        ],
      },
      video: {
        title: "Trải Nghiệm Thực Tế 360°",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        tour360Url: "https://simonaheights.vn/",
      },
      progress: {
        title: "Cập Nhật Tiến Độ Thi Công Mới Nhất",
        items: [
          { date: "Tháng 08/2026", title: "Cất nóc thành công 2 Tòa tháp", image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80", desc: "Hoàn thiện xong kết cấu bê tông cốt thép toàn bộ 29 tầng." },
          { date: "Tháng 06/2026", title: "Thi công hoàn thiện phần thô tầng 25", image: "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=800&q=80", desc: "Đảm bảo đúng tiến độ cam kết với khách hàng." },
        ],
      },
      sales_policy: {
        title: "Chính Sách Bán Hàng & Ưu Đãi Độc Quyền",
        summary: "Chiết khấu lên tới 10% khi thanh toán sớm. Hỗ trợ lãi suất 0% và ân hạn nợ gốc 24 tháng.",
        pdfUrl: "",
        promos: [
          "Chiết khấu 8% cho khách hàng thanh toán chuẩn",
          "Hỗ trợ vay ngân hàng 70% giá trị căn hộ 0% lãi suất",
          "Tặng ngay 2 năm phí quản lý dịch vụ 5 sao",
        ],
      },
      documents: {
        title: "Hồ Sơ Pháp Lý & Tài Liệu Bán Hàng",
        description: "Đã có Giấy phép xây dựng & Sổ hồng sở hữu lâu dài.",
      },
      contact: {
        title: "Đăng Ký Nhận Bảng Giá Chi Tiết & Khảo Sát Căn Hộ Mẫu",
        subtitle: "Liên hệ Hotline đại lý phân phối chính thức để nhận chiết khấu lớn nhất.",
        hotline: "0905 123 456",
        zaloUrl: "https://zalo.me",
        buttonText: "Đăng Ký Tư Vấn Ngay",
      },
      seo: {
        metaTitle: "Simona Heights Quy Nhơn | Website Thông Tin & Bảng Giá Chính Thức",
        metaDescription: "Trang thông tin chính thức căn hộ Simona Heights Quy Nhơn. Bảng giá, chính sách chi tiết và hỗ trợ đặt phòng căn hộ view biển.",
        ogImage: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
      },
    };

    const draftSectionsStr = JSON.stringify(sectionsConfig);
    const draftContentStr = JSON.stringify(contentJson);

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

    console.log("Simona Heights ProjectWebsite seeded & PUBLISHED successfully:", website.id);

    // Sync ProjectResource
    await prisma.projectResource.upsert({
      where: { id: "simona_website_resource_seed" },
      create: {
        id: "simona_website_resource_seed",
        projectId: project.id,
        type: "WEBSITE",
        title: "Website Chính Thức - Simona Heights Quy Nhơn",
        url: "/du-an/simona-heights",
        description: "Trang thông tin tổng quan, tiện ích, mặt bằng và bảng giá chính thức dự án Simona Heights Quy Nhơn",
        isPublic: true,
        isActive: true,
        sortOrder: 0,
      },
      update: {
        projectId: project.id,
        type: "WEBSITE",
        title: "Website Chính Thức - Simona Heights Quy Nhơn",
        url: "/du-an/simona-heights",
        isPublic: true,
        isActive: true,
      },
    });
    console.log("Synced ProjectResource WEBSITE for Simona Heights.");
  } catch (err) {
    console.error("Lỗi seed dữ liệu Simona Heights:", err);
  } finally {
    await prisma.$disconnect();
  }
}

seedSimonaHeights();
