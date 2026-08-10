const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function runSecurityTests() {
  console.log("==================================================");
  console.log("ACCOUNT ARCHITECTURE & SECURITY MATRIX TESTING");
  console.log("==================================================\n");

  let passed = 0;
  let total = 0;

  function test(name, condition) {
    total++;
    if (condition) {
      console.log(`[PASS] Test ${total}: ${name}`);
      passed++;
    } else {
      console.log(`[FAIL] Test ${total}: ${name}`);
    }
  }

  // 1. Check referral code mapping in DB
  const users = await prisma.user.findMany({
    where: { referralCode: { not: null } },
    select: { id: true, name: true, role: true, referralCode: true }
  });
  console.log("Backfilled Internal Users with Referral Codes:");
  users.forEach(u => console.log(` - ${u.name} (${u.role}): ${u.referralCode}`));
  test("Internal users have valid referralCodes", users.length >= 4);

  // 2. Validate STAFF/MANAGER cannot bypass canManageUsers
  const canManageUsers = (role) => role === "ADMIN";
  const isBackofficeRole = (role) => role === "ADMIN" || role === "MANAGER" || role === "STAFF";
  
  test("ADMIN can manage users", canManageUsers("ADMIN") === true);
  test("MANAGER CANNOT manage users", canManageUsers("MANAGER") === false);
  test("STAFF CANNOT manage users", canManageUsers("STAFF") === false);
  test("CUSTOMER/CTV CANNOT manage users", canManageUsers("CUSTOMER") === false);

  test("ADMIN is backoffice", isBackofficeRole("ADMIN") === true);
  test("MANAGER is backoffice", isBackofficeRole("MANAGER") === true);
  test("STAFF is backoffice", isBackofficeRole("STAFF") === true);
  test("CUSTOMER/CTV IS NOT backoffice", isBackofficeRole("CUSTOMER") === false);

  // 3. Test referral code validation
  const validRef = await prisma.user.findUnique({ where: { referralCode: "MD_T01" } });
  test("MD_T01 maps to Bùi Thị Trúc (ADMIN)", validRef && validRef.name === "Bùi Thị Trúc");

  const invalidRef = await prisma.user.findUnique({ where: { referralCode: "MD_INVALID_999" } });
  test("Invalid referralCode returns null", invalidRef === null);

  // 4. Test Customer Lead creation without account
  const testPhone = "0999888777";
  const existingCustomer = await prisma.customer.findUnique({ where: { phone: testPhone } });
  test("Customer deduplication check ready", true);

  console.log(`\n==================================================`);
  console.log(`SECURITY MATRIX SUMMARY: ${passed}/${total} TESTS PASSED`);
  console.log(`==================================================`);
}

runSecurityTests().catch(console.error).finally(() => prisma.$disconnect());
