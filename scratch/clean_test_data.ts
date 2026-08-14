import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Cleaning up dummy test data...");

  // 1. Delete CustomerActivities for test customers or test users
  await prisma.customerActivity.deleteMany({
    where: {
      OR: [
        { customer: { phone: "0988776655" } },
        { author: { email: { in: ["test_admin@example.com", "test_manager@example.com", "test_staff@example.com"] } } },
      ],
    },
  });

  // 2. Delete CustomerInquiries for test collaborators or test customers
  await prisma.customerInquiry.deleteMany({
    where: {
      OR: [
        { customer: { phone: "0988776655" } },
        { collaborator: { publicReferralToken: { in: ["TEST_CTVA", "TEST_CTVB"] } } },
      ],
    },
  });

  // 3. Delete Customer records for test
  await prisma.customer.deleteMany({
    where: { phone: "0988776655" },
  });

  // 4. Delete Collaborator records for test
  await prisma.collaborator.deleteMany({
    where: { publicReferralToken: { in: ["TEST_CTVA", "TEST_CTVB"] } },
  });

  // 5. Delete Test Users
  await prisma.user.deleteMany({
    where: {
      email: { in: ["test_admin@example.com", "test_manager@example.com", "test_staff@example.com"] },
    },
  });

  console.log("✓ Successfully cleaned up all dummy test data from DB!");

  // List remaining real collaborators
  const realCols = await prisma.collaborator.findMany();
  console.log("Real Collaborators count in DB:", realCols.length);
  console.log(realCols.map(c => ({ id: c.id, fullName: c.fullName, token: c.publicReferralToken, status: c.status })));
}

main()
  .catch((e) => {
    console.error("Error cleaning up:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
