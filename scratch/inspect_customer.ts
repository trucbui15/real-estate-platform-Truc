import { prisma } from "../src/lib/prisma";

async function main() {
  const customer = await prisma.customer.findFirst({
    where: {
      OR: [
        { fullName: { contains: "Khách" } },
        { phone: { contains: "0962822700" } },
      ],
    },
    include: {
      assignedTo: true,
      assignedCollaborator: true,
      inquiries: {
        include: {
          collaborator: true,
        },
      },
    },
  });

  console.log("Customer found:", JSON.stringify(customer, null, 2));
}

main().finally(() => prisma.$disconnect());
