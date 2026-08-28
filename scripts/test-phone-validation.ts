import { normalizePhone, isValidPhone, validatePhone, PHONE_ERROR_REQUIRED, PHONE_ERROR_INVALID } from "../src/lib/utils";

console.log("=== BẮT ĐẦU TEST CHUẨN HÓA & VALIDATION SỐ ĐIỆN THOẠI ===");

const passCases = [
  "0912345678",
  "0987654321",
  "0321234567",
  "0912 345 678",
  "0912-345-678",
  "0912.345.678",
  "+84912345678",
  "+84 912 345 678",
];

const failCases = [
  { input: "912345678", expectedErr: PHONE_ERROR_INVALID },
  { input: "091234567", expectedErr: PHONE_ERROR_INVALID },
  { input: "09123456789", expectedErr: PHONE_ERROR_INVALID },
  { input: "abcdefghij", expectedErr: PHONE_ERROR_INVALID },
  { input: "09123abc78", expectedErr: PHONE_ERROR_INVALID },
  { input: "000000000", expectedErr: PHONE_ERROR_INVALID }, // 9 digits
  { input: "", expectedErr: PHONE_ERROR_REQUIRED },
  { input: "   ", expectedErr: PHONE_ERROR_REQUIRED },
];

let allPassed = true;

console.log("\n--- TEST PASS CASES ---");
for (const input of passCases) {
  const norm = normalizePhone(input);
  const valid = isValidPhone(input);
  const err = validatePhone(input);
  const ok = valid && err === null && /^0\d{9}$/.test(norm);
  if (!ok) allPassed = false;
  console.log(`[${ok ? "PASS" : "FAIL"}] Input: "${input}" -> Normalized: "${norm}" | Valid: ${valid} | Error: ${err}`);
}

console.log("\n--- TEST FAIL CASES ---");
for (const item of failCases) {
  const norm = normalizePhone(item.input);
  const valid = isValidPhone(item.input);
  const err = validatePhone(item.input);
  const ok = !valid && err === item.expectedErr;
  if (!ok) allPassed = false;
  console.log(`[${ok ? "PASS" : "FAIL"}] Input: "${item.input}" -> Normalized: "${norm}" | Valid: ${valid} | Error: "${err}" (Expected: "${item.expectedErr}")`);
}

console.log("\n--- TEST DEDUPLICATION (CÙNG FORMAT SAU NORMALIZE) ---");
const raw1 = "0912 345 678";
const raw2 = "0912-345-678";
const raw3 = "0912.345.678";
const raw4 = "0912345678";
const n1 = normalizePhone(raw1);
const n2 = normalizePhone(raw2);
const n3 = normalizePhone(raw3);
const n4 = normalizePhone(raw4);
const dedupOk = n1 === "0912345678" && n2 === "0912345678" && n3 === "0912345678" && n4 === "0912345678";
console.log("\n--- TEST SANITIZE INPUT (CHỈ CHO PHÉP SỐ) ---");
import { sanitizePhoneInput } from "../src/lib/utils";
const s1 = sanitizePhoneInput("3y8233uedbdjoeo");
const s2 = sanitizePhoneInput("+84912345678");
const s3 = sanitizePhoneInput("0912 345 678");
const s4 = sanitizePhoneInput("09123456789999"); // > 10 digits
console.log(`Input: "3y8233uedbdjoeo" -> Sanitized: "${s1}" (Expected: "38233")`);
console.log(`Input: "+84912345678" -> Sanitized: "${s2}" (Expected: "0912345678")`);
console.log(`Input: "0912 345 678" -> Sanitized: "${s3}" (Expected: "0912345678")`);
console.log(`Input: "09123456789999" -> Sanitized: "${s4}" (Expected: "0912345678")`);

const sanitizeOk = s1 === "38233" && s2 === "0912345678" && s3 === "0912345678" && s4 === "0912345678";
if (!sanitizeOk) allPassed = false;
console.log(`[${sanitizeOk ? "PASS" : "FAIL"}] Sanitize input results.`);

console.log("\n==========================================");
console.log(`KẾT QUẢ TỔNG THỂ: ${allPassed ? "TẤT CẢ TEST CASES ĐÃ ĐẠT (PASS)" : "CÓ TEST THẤT BẠI"}`);
console.log("==========================================");

if (!allPassed) process.exit(1);
