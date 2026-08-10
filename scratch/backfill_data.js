const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function backfill() {
  console.log("Starting controlled referral code backfill & CustomerInquiry migration...");

  const userMapping = [
    { id: "cmsh904mq0000gt05cb4h6ztu", code: "MD_T01", name: "Bùi Thị Trúc" },
    { id: "cmsk64es30000ncqo1eo6eg63", code: "MD_D04", name: "Phạm Minh Dũng" },
    { id: "cmsk6cett000081ofgc1dldlt", code: "MD_L02", name: "Trần Thị Mỹ Linh" },
    { id: "cmsk6dyhc000181ofqzwlda9z", code: "MD_H03", name: "Võ Hoàng Thanh Hiệp" },
  ];

  for (const m of userMapping) {
    const u = await prisma.user.findUnique({ where: { id: m.id } });
    if (u) {
      await prisma.user.update({
        where: { id: m.id },
        data: { referralCode: m.code }
      });
      console.log(`✓ Updated User ${u.name} (${u.email}) with referralCode: ${m.code}`);
    } else {
      console.warn(`! Warning: User ID ${m.id} (${m.name}) not found in DB`);
    }
  }

  // Backfill CustomerInquiry for existing Customer records if they have none yet
  const customers = await prisma.customer.findMany({
    include: { inquiries: true }
  });

  console.log(`Checking ${customers.length} existing customers for CustomerInquiry backfill...`);
  let inquiryCreatedCount = 0;

  for (const c of customers) {
    if (c.inquiries.length === 0) {
      await prisma.customerInquiry.create({
        data: {
          customerId: c.id,
          source: c.source || "WEBSITE",
          demandType: c.demandType || "TU_VAN",
          note: c.note || "Nhu cầu khởi tạo ban đầu",
          projectId: c.projectId || null,
          listingId: c.interestedListingId || null,
          createdAt: c.createdAt || new Date(),
        }
      });
      inquiryCreatedCount++;
    }
  }

  console.log(`✓ Successfully created ${inquiryCreatedCount} CustomerInquiry records for legacy customers.`);
}

backfill().catch(console.error).finally(() => prisma.$disconnect());
