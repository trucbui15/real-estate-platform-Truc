const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanupDemoUsers() {
  const demoEmails = ['admin@demo.vn', 'manager@demo.vn', 'staff@demo.vn', 'customer@demo.vn'];
  
  // Find demo users
  const demoUsers = await prisma.user.findMany({
    where: { email: { in: demoEmails } }
  });

  const demoUserIds = demoUsers.map(u => u.id);

  if (demoUserIds.length > 0) {
    // Reassign any foreign keys if linked (listings, projects, etc) to real admin
    const realAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN', active: true }
    });

    if (realAdmin) {
      await prisma.project.updateMany({
        where: { authorId: { in: demoUserIds } },
        data: { authorId: realAdmin.id }
      });
      await prisma.listing.updateMany({
        where: { authorId: { in: demoUserIds } },
        data: { authorId: realAdmin.id }
      });
      await prisma.news.updateMany({
        where: { authorId: { in: demoUserIds } },
        data: { authorId: realAdmin.id }
      });
    }

    // Delete customer activities & favorites linked to demo users if any
    await prisma.customerActivity.deleteMany({
      where: { authorId: { in: demoUserIds } }
    });
    await prisma.favorite.deleteMany({
      where: { userId: { in: demoUserIds } }
    });

    // Delete demo users
    const deleted = await prisma.user.deleteMany({
      where: { id: { in: demoUserIds } }
    });

    console.log(`Deleted ${deleted.count} demo users permanently from DB.`);
  } else {
    console.log('No demo users found to delete.');
  }

  const remainingUsers = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, active: true }
  });
  console.log('Remaining real users in DB:', remainingUsers);
}

cleanupDemoUsers().catch(console.error).finally(() => prisma.$disconnect());
