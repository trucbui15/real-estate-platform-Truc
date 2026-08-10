const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const simona = await prisma.project.findFirst({
    where: {
      OR: [
        { slug: 'simona-heights' },
        { slug: 'simonaheights' },
        { name: { contains: 'Simona', mode: 'insensitive' } }
      ]
    },
    include: {
      resources: true
    }
  });

  console.log('Simona Project in DB:', JSON.stringify(simona, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
