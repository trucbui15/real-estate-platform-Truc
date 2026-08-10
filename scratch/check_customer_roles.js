const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCustomerRoles() {
  const users = await prisma.user.findMany({
    where: { role: "CUSTOMER" }
  });

  console.log(`Total User accounts with role CUSTOMER: ${users.length}`);
  users.forEach(u => {
    console.log(`- ID: ${u.id}, Name: ${u.name}, Email: ${u.email}`);
  });
}

checkCustomerRoles().catch(console.error).finally(() => prisma.$disconnect());
