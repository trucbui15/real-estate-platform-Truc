const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "buithitruc05@gmail.com";
  const adminName = process.env.ADMIN_NAME || "Bùi Thị Trúc";
  const adminPassword = process.env.ADMIN_PASSWORD || "Truc@010503";

  if (!adminEmail || !adminPassword) {
    console.error("Missing admin email or password");
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  // 1. Upsert Admin user
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: adminName,
      role: 'ADMIN',
      passwordHash: hashedPassword,
      active: true,
    },
    create: {
      email: adminEmail,
      name: adminName,
      role: 'ADMIN',
      passwordHash: hashedPassword,
      active: true,
    },
  });

  console.log(`Successfully created/updated ADMIN account: ${adminUser.email} (ID: ${adminUser.id})`);

  // 2. Deactivate demo accounts
  const demoEmails = ['admin@demo.vn', 'manager@demo.vn', 'staff@demo.vn', 'customer@demo.vn'];
  const updateResult = await prisma.user.updateMany({
    where: { email: { in: demoEmails } },
    data: { active: false },
  });

  console.log(`Deactivated ${updateResult.count} demo accounts.`);

  // 3. Reassign project & listing author references from demo users to real admin if needed
  await prisma.project.updateMany({
    where: { authorId: { not: adminUser.id } },
    data: { authorId: adminUser.id },
  });

  await prisma.listing.updateMany({
    where: { authorId: { not: adminUser.id } },
    data: { authorId: adminUser.id },
  });

  console.log('Reassigned projects and listings author references to real ADMIN.');
}

main()
  .catch((err) => {
    console.error('Error creating real admin user:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
