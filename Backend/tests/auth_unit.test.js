import assert from "node:assert";
import UserModel from "../src/models/user.model.js";

async function runTests() {
  console.log("Running Authentication Unit Tests...");

  // 1. Password required when googleId is missing
  const localUserWithoutPassword = new UserModel({
    name: "Alex Smith",
    email: "alex@example.com",
  });
  const valError = localUserWithoutPassword.validateSync();
  assert(
    valError && valError.errors["password"],
    "Validation must fail: password is required for local users"
  );
  console.log("✔ Local user requires password when googleId is absent");

  // 2. Password NOT required when googleId is present
  const googleUser = new UserModel({
    name: "Google Alex",
    email: "alex.google@example.com",
    googleId: "google-sub-unique-12345",
    isEmailVerified: true,
  });
  const googleValError = googleUser.validateSync();
  assert(
    !googleValError,
    `Google user validation failed: ${googleValError?.message}`
  );
  console.log("✔ Google user validates without password");

  // 3. Password hashing via pre-save hook
  const testUser = new UserModel({
    name: "Hash Test User",
    email: "hash@example.com",
    password: "SecurePassword123!",
  });

  // Execute pre-save hook
  await new Promise((resolve, reject) => {
    testUser.schema.s.hooks.execPre("save", testUser, [testUser], (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  assert.notStrictEqual(
    testUser.password,
    "SecurePassword123!",
    "Password must be hashed with bcrypt"
  );
  assert(
    await testUser.comparePassword("SecurePassword123!"),
    "comparePassword must return true for correct password"
  );
  assert(
    !(await testUser.comparePassword("WrongPassword")),
    "comparePassword must return false for incorrect password"
  );
  console.log("✔ Password hashing and comparePassword work correctly");

  // 4. toJSON strips sensitive fields
  testUser.refreshToken = "sample-secret-refresh-token";
  testUser.resetPasswordToken = "sample-reset-token";
  const jsonUser = testUser.toJSON();

  assert.strictEqual(
    jsonUser.password,
    undefined,
    "toJSON must strip password"
  );
  assert.strictEqual(
    jsonUser.refreshToken,
    undefined,
    "toJSON must strip refreshToken"
  );
  assert.strictEqual(
    jsonUser.resetPasswordToken,
    undefined,
    "toJSON must strip resetPasswordToken"
  );
  console.log("✔ toJSON strips sensitive credentials");

  console.log("\nALL AUTH UNIT TESTS PASSED SUCCESSFULLY! 🎉\n");
}

runTests().catch((err) => {
  console.error("❌ UNIT TEST FAILED:", err);
  process.exit(1);
});

