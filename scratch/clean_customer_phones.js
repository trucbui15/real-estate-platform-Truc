const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanCustomers() {
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: 'asc' }
  });

  console.log('Total customers in DB:', customers.length);
  const seenPhones = new Set();
  const toDelete = [];

  for (const c of customers) {
    const normalizedPhone = c.phone ? c.phone.trim().replace(/\s+/g, '') : '';
    if (!normalizedPhone || seenPhones.has(normalizedPhone)) {
      toDelete.push(c.id);
    } else {
      seenPhones.add(normalizedPhone);
    }
  }

  if (toDelete.length > 0) {
    console.log(`Deleting ${toDelete.length} duplicate customer records:`, toDelete);
    await prisma.customer.deleteMany({
      where: { id: { in: toDelete } }
    });
  } else {
    console.log("No duplicate phone numbers found among existing customers.");
  }
}

cleanCustomers().catch(console.error).finally(() => prisma.$disconnect());
