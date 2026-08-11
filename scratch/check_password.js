const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function check() {
  const users = await prisma.user.findMany();
  const candidates = [
    "Truc@010503", "123456", "12345678", "admin", "admin123",
    "010503", "buithitruc", "buithitruc05", "0393118322", "MD_T01",
    "Truc123", "truc123", "Truc010503", "truc010503", "Truc@123", "Truc@2026",
    "MinhDungLand", "minhdungland", "MinhDung@2026", "minhdung2026"
  ];
  for (const user of users) {
    console.log('=== Email:', user.email, '===');
    for (const cand of candidates) {
      if (await bcrypt.compare(cand, user.passwordHash)) {
        console.log(`  >>> FOUND MATCH: "${cand}"`);
      }
    }
  }
}

check().catch(console.error).finally(() => prisma.$disconnect());
