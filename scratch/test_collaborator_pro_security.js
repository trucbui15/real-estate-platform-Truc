const ROLE_LABELS = {
  ADMIN: "Quản trị",
  MANAGER: "Quản lý",
  STAFF: "Nhân viên",
  COLLABORATOR_PRO: "CTV Pro",
  CUSTOMER: "Khách hàng",
};

const canManageUsers = (role) => role === "ADMIN";
const isDeniedUnitCode = (role) => role === "COLLABORATOR_PRO";
const canViewInternalUnitCode = (role) => role === "ADMIN" || role === "MANAGER" || role === "STAFF";
const canManageInventory = (role) => role === "ADMIN" || role === "MANAGER" || role === "STAFF";

const canManageProjectContent = (role) =>
  role === "ADMIN" || role === "MANAGER" || role === "STAFF" || role === "COLLABORATOR_PRO";
const canManageProjectResources = (role) =>
  role === "ADMIN" || role === "MANAGER" || role === "STAFF" || role === "COLLABORATOR_PRO";
const canManageProjectWebsite = (role) =>
  role === "ADMIN" || role === "MANAGER" || role === "STAFF" || role === "COLLABORATOR_PRO";
const canManageNews = (role) =>
  role === "ADMIN" || role === "MANAGER" || role === "STAFF" || role === "COLLABORATOR_PRO";

const canManageAllListings = (role) => role === "ADMIN" || role === "MANAGER";
const canCreateListing = (role) =>
  role === "ADMIN" || role === "MANAGER" || role === "STAFF" || role === "COLLABORATOR_PRO";
const canEditListing = (role, authorId, userId) =>
  canManageAllListings(role) || ((role === "STAFF" || role === "COLLABORATOR_PRO") && authorId === userId);
const canApproveListing = (role) => role === "ADMIN" || role === "MANAGER";

const canAccessCRM = (role) =>
  role === "ADMIN" || role === "MANAGER" || role === "STAFF" || role === "COLLABORATOR_PRO";
const canManageAllCustomers = (role) => role === "ADMIN" || role === "MANAGER";
const canAssignCustomers = (role) => role === "ADMIN" || role === "MANAGER";

const isBackofficeRole = (role) =>
  role === "ADMIN" || role === "MANAGER" || role === "STAFF" || role === "COLLABORATOR_PRO";

let passed = 0;
let failed = 0;

function test(name, condition) {
  if (condition) {
    console.log(`  ✅ PASS: ${name}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${name}`);
    failed++;
  }
}

console.log("\n=======================================================");
console.log("=== 1. ROLE LABELS & HIERARCHY TEST ===");
console.log("=======================================================");
test("ADMIN label is 'Quản trị'", ROLE_LABELS.ADMIN === "Quản trị");
test("MANAGER label is 'Quản lý'", ROLE_LABELS.MANAGER === "Quản lý");
test("STAFF label is 'Nhân viên'", ROLE_LABELS.STAFF === "Nhân viên");
test("COLLABORATOR_PRO label is 'CTV Pro'", ROLE_LABELS.COLLABORATOR_PRO === "CTV Pro");
test("CUSTOMER label is 'Khách hàng'", ROLE_LABELS.CUSTOMER === "Khách hàng");

console.log("\n=======================================================");
console.log("=== 2. UNITCODE PRIVACY & SANITIZATION MATRIX ===");
console.log("=======================================================");
test("ADMIN can view internal unit code", canViewInternalUnitCode("ADMIN") === true);
test("MANAGER can view internal unit code", canViewInternalUnitCode("MANAGER") === true);
test("STAFF can view internal unit code", canViewInternalUnitCode("STAFF") === true);
test("COLLABORATOR_PRO is STRICTLY DENIED from seeing unit code", isDeniedUnitCode("COLLABORATOR_PRO") === true);
test("COLLABORATOR_PRO cannot view internal unit code", canViewInternalUnitCode("COLLABORATOR_PRO") === false);
test("GUEST (undefined) is not explicitly denied public policy", isDeniedUnitCode(undefined) === false);

// Simulate Server Sanitization logic for ProjectInventory
const sampleInventory = [
  { id: "inv_1", projectId: "p1", unitCode: "H.03.01", block: "THE HARBOUR", area: 65.5, salePrice: 2500000000 },
  { id: "inv_2", projectId: "p1", unitCode: "S.12.05", block: "THE SEA", area: 72.0, salePrice: 3200000000 },
  { id: "inv_3", projectId: "p1", unitCode: "ALT 05.03", block: "ALT", area: 55.0, salePrice: 2100000000 },
];

function sanitizeForRole(items, role) {
  if (isDeniedUnitCode(role)) {
    return items.map((item) => ({
      ...item,
      unitCode: null, // Server strictly sends null for CTV Pro
    }));
  }
  return items;
}

const ctvProResponse = sanitizeForRole(sampleInventory, "COLLABORATOR_PRO");
const ctvProPayloadString = JSON.stringify(ctvProResponse);

test("CTV Pro payload contains null unitCodes", ctvProResponse.every((item) => item.unitCode === null));
test("CTV Pro payload DOES NOT contain 'H.03.01'", !ctvProPayloadString.includes("H.03.01"));
test("CTV Pro payload DOES NOT contain 'S.12.05'", !ctvProPayloadString.includes("S.12.05"));
test("CTV Pro payload DOES NOT contain 'ALT 05.03'", !ctvProPayloadString.includes("ALT 05.03"));

const adminResponse = sanitizeForRole(sampleInventory, "ADMIN");
test("ADMIN receives original unitCode 'H.03.01'", adminResponse[0].unitCode === "H.03.01");

const staffResponse = sanitizeForRole(sampleInventory, "STAFF");
test("STAFF receives original unitCode 'S.12.05'", staffResponse[1].unitCode === "S.12.05");

console.log("\n=======================================================");
console.log("=== 3. PROJECT INVENTORY CRUD PERMISSION ===");
console.log("=======================================================");
test("ADMIN can manage inventory", canManageInventory("ADMIN") === true);
test("MANAGER can manage inventory", canManageInventory("MANAGER") === true);
test("STAFF can manage inventory", canManageInventory("STAFF") === true);
test("COLLABORATOR_PRO CANNOT manage inventory (READ ONLY)", canManageInventory("COLLABORATOR_PRO") === false);
test("CUSTOMER CANNOT manage inventory", canManageInventory("CUSTOMER") === false);

console.log("\n=======================================================");
console.log("=== 4. CONTENT & CMS MODULES (STAFF-EQUIVALENT) ===");
console.log("=======================================================");
test("COLLABORATOR_PRO can manage News", canManageNews("COLLABORATOR_PRO") === true);
test("COLLABORATOR_PRO can manage Project Content", canManageProjectContent("COLLABORATOR_PRO") === true);
test("COLLABORATOR_PRO can manage Project Resources", canManageProjectResources("COLLABORATOR_PRO") === true);
test("COLLABORATOR_PRO can manage Project Website CMS", canManageProjectWebsite("COLLABORATOR_PRO") === true);
test("COLLABORATOR_PRO has backoffice access", isBackofficeRole("COLLABORATOR_PRO") === true);

console.log("\n=======================================================");
console.log("=== 5. LISTINGS CRUD & APPROVAL WORKFLOW ===");
console.log("=======================================================");
test("COLLABORATOR_PRO can create listing", canCreateListing("COLLABORATOR_PRO") === true);
test("COLLABORATOR_PRO can edit their own listing", canEditListing("COLLABORATOR_PRO", "user_pro", "user_pro") === true);
test("COLLABORATOR_PRO CANNOT edit others' listing", canEditListing("COLLABORATOR_PRO", "user_other", "user_pro") === false);
test("ADMIN can edit any listing", canEditListing("ADMIN", "user_other", "admin_id") === true);
test("COLLABORATOR_PRO CANNOT approve listings", canApproveListing("COLLABORATOR_PRO") === false);
test("STAFF CANNOT approve listings", canApproveListing("STAFF") === false);
test("MANAGER can approve listings", canApproveListing("MANAGER") === true);
test("ADMIN can approve listings", canApproveListing("ADMIN") === true);

console.log("\n=======================================================");
console.log("=== 6. CRM & LEAD SCOPE ===");
console.log("=======================================================");
test("COLLABORATOR_PRO can access CRM", canAccessCRM("COLLABORATOR_PRO") === true);
test("COLLABORATOR_PRO CANNOT manage all customers", canManageAllCustomers("COLLABORATOR_PRO") === false);
test("COLLABORATOR_PRO CANNOT assign customers", canAssignCustomers("COLLABORATOR_PRO") === false);
test("STAFF CANNOT manage all customers", canManageAllCustomers("STAFF") === false);
test("STAFF CANNOT assign customers", canAssignCustomers("STAFF") === false);
test("ADMIN can manage all customers", canManageAllCustomers("ADMIN") === true);
test("ADMIN can assign customers", canAssignCustomers("ADMIN") === true);
test("MANAGER can manage all customers", canManageAllCustomers("MANAGER") === true);

console.log("\n=======================================================");
console.log("=== 7. USER & ROLE MANAGEMENT BOUNDARY ===");
console.log("=======================================================");
test("ADMIN can manage users", canManageUsers("ADMIN") === true);
test("MANAGER CANNOT manage users", canManageUsers("MANAGER") === false);
test("STAFF CANNOT manage users", canManageUsers("STAFF") === false);
test("COLLABORATOR_PRO CANNOT manage users", canManageUsers("COLLABORATOR_PRO") === false);

console.log("\n=======================================================");
console.log(`=== TEST SUMMARY: ${passed} PASSED, ${failed} FAILED ===`);
console.log("=======================================================\n");

if (failed > 0) {
  process.exit(1);
}
