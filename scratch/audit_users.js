const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function auditDBUsers() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'asc' }
  });

  console.log('Total users in DB:', users.length);
  users.forEach((u, i) => {
    console.log(`[${i + 1}] ID: ${u.id}`);
    console.log(`    Name: ${u.name}`);
    console.log(`    Email: ${u.email}`);
    console.log(`    Phone: ${u.phone || 'NULL'}`);
    console.log(`    Role: ${u.role}`);
    console.log(`    active (Boolean field): ${u.active}`);
    console.log(`    createdAt: ${u.createdAt}`);
    console.log('-----------------------------------');
  });
}

auditDBUsers().catch(console.error).finally(() => prisma.$disconnect());
