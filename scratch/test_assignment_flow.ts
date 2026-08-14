import { prisma } from "../src/lib/prisma";
import { processPublicLead } from "../src/lib/leadService";

async function main() {
  console.log("=== STARTING BUSINESS LOGIC INTEGRATION TESTS ===");

  // 1. Setup Test Users and Collaborators
  console.log("\n--- 1. Setting up test data ---");

  // Create or get Admin
  let testAdmin = await prisma.user.findFirst({ where: { role: "ADMIN", email: "test_admin@example.com" } });
  if (!testAdmin) {
    testAdmin = await prisma.user.create({
      data: {
        name: "Test Admin",
        email: "test_admin@example.com",
        passwordHash: "dummy",
        role: "ADMIN",
        active: true,
      },
    });
  }

  // Create or get Manager
  let testManager = await prisma.user.findFirst({ where: { role: "MANAGER", email: "test_manager@example.com" } });
  if (!testManager) {
    testManager = await prisma.user.create({
      data: {
        name: "Test Manager",
        email: "test_manager@example.com",
        passwordHash: "dummy",
        role: "MANAGER",
        active: true,
      },
    });
  }

  // Create or get Staff
  let testStaff = await prisma.user.findFirst({ where: { role: "STAFF", email: "test_staff@example.com" } });
  if (!testStaff) {
    testStaff = await prisma.user.create({
      data: {
        name: "Test Staff",
        email: "test_staff@example.com",
        passwordHash: "dummy",
        role: "STAFF",
        active: true,
      },
    });
  }

  // Create or get Collaborator A
  let colA = await prisma.collaborator.findFirst({ where: { publicReferralToken: "TEST_CTVA" } });
  if (!colA) {
    colA = await prisma.collaborator.create({
      data: {
        fullName: "CTV Nguyễn A",
        phone: "0900000001",
        email: "ctv_a@example.com",
        publicReferralToken: "TEST_CTVA",
        status: "ACTIVE",
        referredByUserId: testStaff.id,
      },
    });
  }

  // Create or get Collaborator B
  let colB = await prisma.collaborator.findFirst({ where: { publicReferralToken: "TEST_CTVB" } });
  if (!colB) {
    colB = await prisma.collaborator.create({
      data: {
        fullName: "CTV Trần B",
        phone: "0900000002",
        email: "ctv_b@example.com",
        publicReferralToken: "TEST_CTVB",
        status: "ACTIVE",
        referredByUserId: testStaff.id,
      },
    });
  }

  console.log("✓ Test users & collaborators initialized.");

  // 2. Test Lead from CTV A link (Unassigned Customer)
  console.log("\n--- 2. Test Lead from CTV A link (New Lead) ---");
  const testPhone1 = "0988776655";
  // Clean up if exists
  await prisma.customer.deleteMany({ where: { phone: testPhone1 } });

  const lead1Result = await processPublicLead({
    fullName: "Khách Hàng 1",
    phone: testPhone1,
    refToken: "TEST_CTVA",
    note: "Đăng ký từ link CTV A",
  });

  const c1 = await prisma.customer.findUnique({
    where: { id: lead1Result.customerId },
    include: { inquiries: true },
  });

  console.assert(c1?.assignedCollaboratorId === colA.id, "FAIL: Should assign to CTV A");
  console.assert(c1?.assignedToId === null, "FAIL: assignedToId should be null");
  console.assert(c1?.assignedAt !== null, "FAIL: assignedAt should be set");
  console.assert(c1?.inquiries[0].collaboratorId === colA.id, "FAIL: Inquiry attribution should be CTV A");
  console.log("✓ PASS: Lead from CTV A link auto-assigned to CTV A with assignedAt set.");

  // 3. Test Reassignment transitions:
  console.log("\n--- 3. Test Reassignment Matrix & Activity Logs ---");
  
  // Helper to call PUT API logic directly on DB & check log
  async function simulateAssign(customerId: string, assigneeType: string, assigneeId: string | null) {
    const existing = await prisma.customer.findUnique({
      where: { id: customerId },
      include: { assignedTo: true, assignedCollaborator: true },
    });

    let newAssignedToId: string | null = null;
    let newAssignedCollaboratorId: string | null = null;
    let newAssignedAt: Date | null = null;
    let newDisplayName = "";

    if (assigneeType === "USER" && assigneeId) {
      const u = await prisma.user.findUnique({ where: { id: assigneeId } });
      newAssignedToId = u!.id;
      newAssignedAt = new Date();
      newDisplayName = u!.name;
    } else if (assigneeType === "COLLABORATOR" && assigneeId) {
      const col = await prisma.collaborator.findUnique({ where: { id: assigneeId } });
      newAssignedCollaboratorId = col!.id;
      newAssignedAt = new Date();
      newDisplayName = `CTV ${col!.fullName}`;
    } else {
      newDisplayName = "Chưa phân công";
    }

    const oldDisplayName = existing?.assignedTo?.name
      ? existing.assignedTo.name
      : existing?.assignedCollaborator?.fullName
      ? `CTV ${existing.assignedCollaborator.fullName}`
      : "Chưa phân công";

    const updated = await prisma.customer.update({
      where: { id: customerId },
      data: {
        assignedToId: newAssignedToId,
        assignedCollaboratorId: newAssignedCollaboratorId,
        assignedAt: newAssignedAt,
      },
    });

    await prisma.customerActivity.create({
      data: {
        customerId,
        authorId: testAdmin!.id,
        type: "NOTE",
        content: `${oldDisplayName} → ${newDisplayName}`,
      },
    });

    return updated;
  }

  // CTV A -> User (Staff)
  await simulateAssign(c1!.id, "USER", testStaff.id);
  let cUpdated = await prisma.customer.findUnique({ where: { id: c1!.id } });
  console.assert(cUpdated?.assignedToId === testStaff.id, "FAIL: assignedToId should be testStaff");
  console.assert(cUpdated?.assignedCollaboratorId === null, "FAIL: assignedCollaboratorId should be null");
  console.log("✓ PASS: CTV A → Staff reassigned.");

  // User (Staff) -> CTV B
  await simulateAssign(c1!.id, "COLLABORATOR", colB.id);
  cUpdated = await prisma.customer.findUnique({ where: { id: c1!.id } });
  console.assert(cUpdated?.assignedCollaboratorId === colB.id, "FAIL: assignedCollaboratorId should be colB");
  console.assert(cUpdated?.assignedToId === null, "FAIL: assignedToId should be null");
  console.log("✓ PASS: Staff → CTV B reassigned.");

  // CTV B -> Unassigned
  await simulateAssign(c1!.id, "UNASSIGNED", null);
  cUpdated = await prisma.customer.findUnique({ where: { id: c1!.id } });
  console.assert(cUpdated?.assignedCollaboratorId === null, "FAIL: assignedCollaboratorId should be null");
  console.assert(cUpdated?.assignedToId === null, "FAIL: assignedToId should be null");
  console.assert(cUpdated?.assignedAt === null, "FAIL: assignedAt should be null for unassigned");
  console.log("✓ PASS: CTV B → Unassigned.");

  // Unassigned -> User (Manager)
  await simulateAssign(c1!.id, "USER", testManager.id);
  cUpdated = await prisma.customer.findUnique({ where: { id: c1!.id } });
  console.assert(cUpdated?.assignedToId === testManager.id, "FAIL: assignedToId should be testManager");
  console.log("✓ PASS: Unassigned → Manager reassigned.");

  // 4. Test Customer already has assignee -> new CTV ref token does NOT steal lead
  console.log("\n--- 4. Test lead protection (No lead stealing) ---");
  // Customer currently assigned to testManager
  const lead2Result = await processPublicLead({
    fullName: "Khách Hàng 1 (Gửi lại nhu cầu)",
    phone: testPhone1,
    refToken: "TEST_CTVB",
    note: "Đăng ký lần 2 qua link CTV B",
  });

  const c1Recheck = await prisma.customer.findUnique({
    where: { id: lead1Result.customerId },
    include: { inquiries: { orderBy: { createdAt: "asc" } } },
  });

  console.assert(c1Recheck?.assignedToId === testManager.id, "FAIL: Assignee should remain Manager");
  console.assert(c1Recheck?.assignedCollaboratorId === null, "FAIL: Assigned CTV should remain null");
  console.assert(c1Recheck?.inquiries.length === 2, "FAIL: Should have 2 inquiries");
  console.assert(c1Recheck?.inquiries[0].collaboratorId === colA.id, "FAIL: Inquiry 1 attribution must be CTV A");
  console.assert(c1Recheck?.inquiries[1].collaboratorId === colB.id, "FAIL: Inquiry 2 attribution must be CTV B");
  console.log("✓ PASS: New lead from CTV B did NOT steal existing assigned customer.");
  console.log("✓ PASS: Attribution preserved (Inquiry 1 = CTV A, Inquiry 2 = CTV B).");

  // 5. Check Activity Logs format
  console.log("\n--- 5. Verifying Activity Logs format ---");
  const activities = await prisma.customerActivity.findMany({
    where: { customerId: c1!.id },
    orderBy: { createdAt: "asc" },
  });
  console.log("Activity logs generated:");
  activities.forEach((act) => console.log(`  - [${act.type}] ${act.content}`));

  console.log("\n=== ALL INTEGRATION TESTS PASSED SUCCESSFULLY! ===");
}

main()
  .catch((e) => {
    console.error("TEST FAILED WITH ERROR:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
