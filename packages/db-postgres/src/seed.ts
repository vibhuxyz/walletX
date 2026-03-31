// "db:seed": "tsx src/seed.ts"
import { hashPassword, hashPin, Currency } from "@repo/libs";
import { nanoid } from "nanoid";
import { prismaPostgres as prisma } from "./index.js";
import bcrypt from "bcryptjs";
import {
  BankAccountType,
  BankAccountStatus,
  UserRole,
} from "../node_modules/.prisma/client";

// ₹10,000 in paise
const INITIAL_BALANCE = BigInt(1_000_000);

// ============================================
// BANK TEST ACCOUNTS DATA
// ============================================
const bankTestAccounts = [
  // ─── HDFC — SAVINGS ─────────────────────────────────────────────
  {
    user: {
      email: "try.vikram.kumar01@gmail.com",
      phone: "9876543201",
      fullName: "Vikram Kumar",
      password: "Test@1234",
    },
    account: {
      accountNumber: "HDFC0000000001",
      bankName: "hdfc",
      accountHolder: "Vikram Singh",
      email: "vikram.hdfc@gmail.com",
      phone: "9876543201",
      accountType: BankAccountType.SAVINGS,
      ifscCode: "HDFC0001234",
      branch: "Mumbai - Andheri West",
      balance: INITIAL_BALANCE,
      status: BankAccountStatus.ACTIVE,
    },
  },
  // ─── HDFC — CURRENT ─────────────────────────────────────────────
  {
    user: {
      email: "priya.hdfc@gmail.com",
      phone: "9876543202",
      fullName: "Priya Sharma",
      password: "Test@1234",
    },
    account: {
      accountNumber: "HDFC0000000002",
      bankName: "hdfc",
      accountHolder: "Priya Sharma",
      email: "priya.hdfc@gmail.com",
      phone: "9876543202",
      accountType: BankAccountType.CURRENT,
      ifscCode: "HDFC0005678",
      branch: "Delhi - Connaught Place",
      balance: INITIAL_BALANCE,
      status: BankAccountStatus.ACTIVE,
    },
  },
  // ─── HDFC — SAVINGS ─────────────────────────────────────────────
  {
    user: {
      email: "rahul.hdfc@gmail.com",
      phone: "9876543203",
      fullName: "Rahul Sharma",
      password: "Test@1234",
    },
    account: {
      accountNumber: "HDFC0000000003",
      bankName: "hdfc",
      accountHolder: "Rahul Sharma",
      email: "rahul.hdfc@gmail.com",
      phone: "9876543203",
      accountType: BankAccountType.SAVINGS,
      ifscCode: "HDFC0009101",
      branch: "Bangalore - Koramangala",
      balance: INITIAL_BALANCE,
      status: BankAccountStatus.ACTIVE,
    },
  },
  // ─── ICICI — SAVINGS ────────────────────────────────────────────
  {
    user: {
      email: "ananya.icici@gmail.com",
      phone: "9876543204",
      fullName: "Ananya Patel",
      password: "Test@1234",
    },
    account: {
      accountNumber: "ICICI000000001",
      bankName: "icici",
      accountHolder: "Ananya Patel",
      email: "ananya.icici@gmail.com",
      phone: "9876543204",
      accountType: BankAccountType.SAVINGS,
      ifscCode: "ICIC0001122",
      branch: "Chennai - T. Nagar",
      balance: INITIAL_BALANCE,
      status: BankAccountStatus.ACTIVE,
    },
  },
  // ─── ICICI — CURRENT ────────────────────────────────────────────
  {
    user: {
      email: "rahul.icici@gmail.com", // Same name as rahul.hdfc — different person!
      phone: "9876543205",
      fullName: "Rahul Sharma",
      password: "Test@1234",
    },
    account: {
      accountNumber: "ICICI000000002",
      bankName: "icici",
      accountHolder: "Rahul Sharma",
      email: "rahul.icici@gmail.com",
      phone: "9876543205",
      accountType: BankAccountType.CURRENT,
      ifscCode: "ICIC0003344",
      branch: "Pune - FC Road",
      balance: INITIAL_BALANCE,
      status: BankAccountStatus.ACTIVE,
    },
  },
  // ─── ICICI — SAVINGS ────────────────────────────────────────────
  {
    user: {
      email: "meera.icici@gmail.com",
      phone: "9876543206",
      fullName: "Meera Nair",
      password: "Test@1234",
    },
    account: {
      accountNumber: "ICICI000000003",
      bankName: "icici",
      accountHolder: "Meera Nair",
      email: "meera.icici@gmail.com",
      phone: "9876543206",
      accountType: BankAccountType.SAVINGS,
      ifscCode: "ICIC0005566",
      branch: "Hyderabad - Banjara Hills",
      balance: INITIAL_BALANCE,
      status: BankAccountStatus.ACTIVE,
    },
  },
  // ─── AXIS — CURRENT ─────────────────────────────────────────────
  {
    user: {
      email: "arjun.axis@gmail.com",
      phone: "9876543207",
      fullName: "Arjun Mehta",
      password: "Test@1234",
    },
    account: {
      accountNumber: "AXIS000000001",
      bankName: "axis",
      accountHolder: "Arjun Mehta",
      email: "arjun.axis@gmail.com",
      phone: "9876543207",
      accountType: BankAccountType.CURRENT,
      ifscCode: "UTIB0001234",
      branch: "Kolkata - Park Street",
      balance: INITIAL_BALANCE,
      status: BankAccountStatus.ACTIVE,
    },
  },
  // ─── AXIS — SAVINGS ─────────────────────────────────────────────
  {
    user: {
      email: "kavya.axis@gmail.com",
      phone: "9876543208",
      fullName: "Kavya Reddy",
      password: "Test@1234",
    },
    account: {
      accountNumber: "AXIS000000002",
      bankName: "axis",
      accountHolder: "Kavya Reddy",
      email: "kavya.axis@gmail.com",
      phone: "9876543208",
      accountType: BankAccountType.SAVINGS,
      ifscCode: "UTIB0005678",
      branch: "Ahmedabad - CG Road",
      balance: INITIAL_BALANCE,
      status: BankAccountStatus.ACTIVE,
    },
  },
  // ─── AXIS — CURRENT ─────────────────────────────────────────────
  {
    user: {
      email: "siddharth.axis@gmail.com",
      phone: "9876543209",
      fullName: "Siddharth Joshi",
      password: "Test@1234",
    },
    account: {
      accountNumber: "AXIS000000003",
      bankName: "axis",
      accountHolder: "Siddharth Joshi",
      email: "siddharth.axis@gmail.com",
      phone: "9876543209",
      accountType: BankAccountType.CURRENT,
      ifscCode: "UTIB0009101",
      branch: "Jaipur - MI Road",
      balance: INITIAL_BALANCE,
      status: BankAccountStatus.ACTIVE,
    },
  },
  // ─── AXIS — SAVINGS ─────────────────────────────────────────────
  {
    user: {
      email: "neha.axis@gmail.com",
      phone: "9876543210",
      fullName: "Neha Gupta",
      password: "Test@1234",
    },
    account: {
      accountNumber: "AXIS000000004",
      bankName: "axis",
      accountHolder: "Neha Gupta",
      email: "neha.axis@gmail.com",
      phone: "9876543210",
      accountType: BankAccountType.SAVINGS,
      ifscCode: "UTIB0002345",
      branch: "Lucknow - Hazratganj",
      balance: INITIAL_BALANCE,
      status: BankAccountStatus.ACTIVE,
    },
  },
];

async function seed() {
  console.log("🌱 Starting database seed...\n");

  try {
    // ============================================
    // 🧹 CLEANUP PREVIOUS SEED DATA
    // ============================================
    console.log("🧹 Cleaning up old seed data to prevent conflicts...");

    // Collect ALL emails to clean — core users + bank test users
    const coreEmails = [
      "customer@example.com",
      "merchant@example.com",
      "admin@example.com",
    ];
    const bankTestEmails = bankTestAccounts.map((s) => s.user.email);
    const allSeedEmails = [...coreEmails, ...bankTestEmails];

    const coreAccountNumbers = ["1234567890123456", "2345678901234567"];
    const bankTestAccountNumbers = bankTestAccounts.map(
      (s) => s.account.accountNumber,
    );
    const allSeedAccountNumbers = [
      ...coreAccountNumbers,
      ...bankTestAccountNumbers,
    ];

    // 1. Find all seed user IDs
    const existingUsers = await prisma.user.findMany({
      where: { email: { in: allSeedEmails } },
      select: { id: true },
    });
    const userIds = existingUsers.map((u: any) => u.id);

    if (userIds.length > 0) {
      // 2. Delete non-cascade relations first
      await prisma.ledgerEntry.deleteMany({
        where: { userId: { in: userIds } },
      });
      await prisma.linkedBankAccount.deleteMany({
        where: { userId: { in: userIds } },
      });

      // 3. Delete users (cascades to Wallet, Merchant, KYC, BankAccount, etc.)
      await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    }

    // 4. Delete any remaining bank accounts by account number
    await prisma.bankAccount.deleteMany({
      where: { accountNumber: { in: allSeedAccountNumbers } },
    });

    console.log("✅ Cleanup complete. Proceeding with fresh seed...\n");

    // ============================================
    // PART 1: CORE USERS (Customer / Merchant / Admin)
    // ============================================

    // ── CUSTOMER ──────────────────────────────────────────────────
    console.log("👤 Creating customer user...");

    const customerPassword = await hashPassword("Customer@123");
    const testPin = await hashPin("1234");

    const customer = await prisma.user.create({
      data: {
        id: `usr_${nanoid(21)}`,
        email: "customer@example.com",
        phone: "+919876543210",
        fullName: "Test Customer",
        hashedPassword: customerPassword,
        hashedPin: testPin,
        role: "USER",
        isEmailVerified: true,
        isActive: true,
      },
    });

    console.log(`✅ Customer created: ${customer.email}`);

    const wallet = await prisma.wallet.create({
      data: {
        id: `wal_${nanoid(21)}`,
        userId: customer.id,
        balance: BigInt(Currency.toPaise("10000")), // ₹10,000
        status: "ACTIVE",
        isFrozen: false,
        qrCode: `WALLET_${nanoid(16).toUpperCase()}`,
        version: 0,
      },
    });

    console.log(
      `✅ Customer wallet created: ${Currency.toRupees(Number(wallet.balance))}`,
    );

    await prisma.kycProfile.create({
      data: {
        id: `kyc_${nanoid(21)}`,
        userId: customer.id,
        walletId: wallet.id,
        fullName: "Test Customer",
        dob: new Date("1990-01-01T00:00:00Z"),
        idType: "PAN",
        idNumber: "ABCDE1234F",
        idFrontUrl: "https://placehold.co/600x400?text=PAN+Front",
        idBackUrl: "https://placehold.co/600x400?text=PAN+Back",
        address: {
          line1: "123 Test Street",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400001",
        },
        status: "APPROVED",
        verifiedAt: new Date(),
      },
    });

    console.log("✅ Customer KYC approved\n");

    // ── MERCHANT ──────────────────────────────────────────────────
    console.log("🏪 Creating merchant user...");

    const merchantPassword = await hashPassword("Merchant@123");

    const merchantUser = await prisma.user.create({
      data: {
        id: `usr_${nanoid(21)}`,
        email: "merchant@example.com",
        phone: "+919876543211",
        fullName: "Test Merchant",
        hashedPassword: merchantPassword,
        hashedPin: testPin,
        role: "MERCHANT",
        isEmailVerified: true,
        isActive: true,
      },
    });

    console.log(`✅ Merchant created: ${merchantUser.email}`);

    const merchant = await prisma.merchant.create({
      data: {
        id: `mer_${nanoid(21)}`,
        userId: merchantUser.id,
        businessName: "Test Coffee Shop",
        businessType: "FOOD",
        businessCategory: "Restaurant",
        panNumber: "FGHIJ5678K",
        address: {
          line1: "456 Market Street",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400002",
        },
        merchantQrCode: `MERCH_${nanoid(16).toUpperCase()}`,
        balance: BigInt(Currency.toPaise("5000")), // ₹5,000
        pendingBalance: BigInt(Currency.toPaise("0")),
        status: "ACTIVE",
        isFrozen: false,
        commissionRate: 2.0,
        version: 0,
      },
    });

    console.log(`✅ Merchant business created: ${merchant.businessName}`);
    console.log(`   Balance: ${Currency.toRupees(Number(merchant.balance))}\n`);

    // ── BANK ADMIN ────────────────────────────────────────────────
    console.log("🏦 Creating bank admin user...");

    const adminPassword = await hashPassword("Admin@123");

    const adminUser = await prisma.user.create({
      data: {
        id: `usr_${nanoid(21)}`,
        email: "admin@example.com",
        phone: "+919876543212",
        fullName: "Bank Admin",
        hashedPassword: adminPassword,
        hashedPin: testPin,
        role: "BANK_ADMIN",
        isEmailVerified: true,
        isActive: true,
      },
    });

    console.log(`✅ Bank admin created: ${adminUser.email}`);

    await prisma.bankAdmin.create({
      data: {
        id: `ba_${nanoid(21)}`,
        userId: adminUser.id,
        bankName: "State Bank of India",
        permissions: { canApprove: true, canFreeze: true, canClose: true },
        isActive: true,
      },
    });

    console.log("✅ Bank admin profile created\n");

    // ── CORE BANK ACCOUNTS ────────────────────────────────────────
    console.log("💳 Creating core bank accounts...");

    const account1 = await prisma.bankAccount.create({
      data: {
        id: `acc_${nanoid(21)}`,
        //@ts-ignore
        userId: customer.id, // ← ownership
        accountNumber: "1234567890123456",
        bankName: "State Bank of India",
        accountHolder: "Test Customer",
        email: "customer@example.com",
        phone: "+919876543210",
        balance: BigInt(Currency.toPaise("50000")), // ₹50,000
        accountType: "SAVINGS",
        ifscCode: "SBIN0001234",
        branch: "Main Branch",
        status: "ACTIVE",
        approvedBy: adminUser.id,
        approvedAt: new Date(),
        version: 0,
      },
    });

    console.log(`✅ Customer bank account: ${account1.accountNumber}`);
    console.log(`   Owner:   ${customer.email}`);
    console.log(`   Balance: ${Currency.toRupees(Number(account1.balance))}`);

    const account2 = await prisma.bankAccount.create({
      data: {
        id: `acc_${nanoid(21)}`,
        //@ts-ignore
        userId: merchantUser.id, // ← ownership
        accountNumber: "2345678901234567",
        bankName: "HDFC Bank",
        accountHolder: "Test Merchant",
        email: "merchant@example.com",
        phone: "+919876543211",
        balance: BigInt(Currency.toPaise("100000")), // ₹1,00,000
        accountType: "CURRENT",
        ifscCode: "HDFC0001234",
        branch: "Main Branch",
        status: "ACTIVE",
        approvedBy: adminUser.id,
        approvedAt: new Date(),
        version: 0,
      },
    });

    console.log(`✅ Merchant bank account: ${account2.accountNumber}`);
    console.log(`   Owner:   ${merchantUser.email}`);
    console.log(`   Balance: ${Currency.toRupees(Number(account2.balance))}\n`);

    // ── LINK ACCOUNT TO WALLET ────────────────────────────────────
    console.log("🔗 Linking bank account to wallet...");

    await prisma.linkedBankAccount.create({
      data: {
        id: `lnk_${nanoid(21)}`,
        userId: customer.id,
        accountId: account1.id,
        bankName: "State Bank of India",
        maskedAccount: "******3456",
        isDefault: true,
      },
    });

    console.log("✅ Bank account linked to customer wallet\n");

    // ── LEDGER ENTRY ──────────────────────────────────────────────
    console.log("📒 Creating sample ledger entries...");

    await prisma.ledgerEntry.create({
      data: {
        id: `ledger_${nanoid(21)}`,
        userId: customer.id,
        referenceId: `INITIAL_CREDIT_${nanoid(21)}`,
        entryType: "WALLET_TOPUP",
        amount: BigInt(Currency.toPaise("10000")),
        balanceBefore: BigInt(0),
        balanceAfter: BigInt(Currency.toPaise("10000")),
        description: "Initial wallet credit",
        metadata: { source: "seed" },
      },
    });

    console.log("✅ Ledger entry created\n");

    // ── TRUSTED DEVICES ───────────────────────────────────────────
    console.log("📱 Creating trusted devices...");

    await prisma.trustedDevice.create({
      data: {
        id: `dev_${nanoid(21)}`,
        userId: customer.id,
        deviceId: "seed-device-customer-001",
        deviceName: "Chrome on Windows",
        ipAddress: "192.168.1.100",
        isTrusted: true,
        lastUsedAt: new Date(),
      },
    });

    await prisma.trustedDevice.create({
      data: {
        id: `dev_${nanoid(21)}`,
        userId: merchantUser.id,
        deviceId: "seed-device-merchant-001",
        deviceName: "Safari on Mac",
        ipAddress: "192.168.1.101",
        isTrusted: true,
        lastUsedAt: new Date(),
      },
    });

    console.log("✅ Trusted devices created\n");

    // ============================================
    // PART 2: BANK TEST ACCOUNTS (HDFC / ICICI / AXIS)
    // ============================================
    console.log("━".repeat(60));
    console.log("🏦 Seeding bank test accounts...\n");
    console.log("  BANK   TYPE      USERS");
    console.log("  HDFC   SAVINGS   Vikram Singh, Rahul Sharma");
    console.log("  HDFC   CURRENT   Priya Sharma");
    console.log("  ICICI  SAVINGS   Ananya Patel, Meera Nair");
    console.log(
      "  ICICI  CURRENT   Rahul Sharma  ← same name, different person!",
    );
    console.log("  AXIS   SAVINGS   Kavya Reddy, Neha Gupta");
    console.log("  AXIS   CURRENT   Arjun Mehta, Siddharth Joshi");
    console.log("━".repeat(60) + "\n");

    for (const seed of bankTestAccounts) {
      const hashedPassword = await bcrypt.hash(seed.user.password, 10);

      // Upsert user
      const user = await prisma.user.upsert({
        where: { email: seed.user.email },
        update: {},
        create: {
          email: seed.user.email,
          phone: seed.user.phone,
          fullName: seed.user.fullName,
          hashedPassword,
          role: UserRole.USER,
          isEmailVerified: true,
          isActive: true,
        },
      });

      // Upsert bank account with userId ownership
      await prisma.bankAccount.upsert({
        where: {
          accountNumber_bankName: {
            accountNumber: seed.account.accountNumber,
            bankName: seed.account.bankName,
          },
        },
        update: {},
        create: {
          //@ts-ignore
          userId: user.id, // ← ownership
          ...seed.account,
          approvedAt: new Date(),
          approvedBy: "system-seed",
        },
      });

      const typeLabel =
        seed.account.accountType === BankAccountType.SAVINGS
          ? "💰 SAVINGS"
          : "🏢 CURRENT";

      console.log(`✅  ${seed.user.fullName.padEnd(20)} ${typeLabel}`);
      console.log(`    📧  ${seed.user.email}`);
      console.log(`    🔑  Password : ${seed.user.password}`);
      console.log(
        `    🏦  ${seed.account.bankName.toUpperCase().padEnd(6)} | ${seed.account.accountNumber}`,
      );
      console.log(`    📍  ${seed.account.branch}`);
      console.log(`    🔢  IFSC     : ${seed.account.ifscCode}`);
      console.log(
        `    💵  Balance  : ₹10,000 (${INITIAL_BALANCE.toString()} paise)\n`,
      );
    }

    // ============================================
    // SUMMARY
    // ============================================
    console.log("=".repeat(70));
    console.log("✅ DATABASE SEED COMPLETED SUCCESSFULLY!");
    console.log("=".repeat(70));

    console.log("\n📋 CORE TEST CREDENTIALS:\n");

    console.log("👤 CUSTOMER:");
    console.log(`   Email:    customer@example.com`);
    console.log(`   Password: Customer@123`);
    console.log(`   PIN:      1234`);
    console.log(
      `   Wallet:   ${Currency.toRupees(Number(wallet.balance))} (ACTIVE)`,
    );
    console.log(`   QR Code:  ${wallet.qrCode}`);
    console.log(`   Bank:     1234567890123456 (SBI SAVINGS — ₹50,000)`);
    console.log(`   IFSC:     SBIN0001234`);
    console.log("");

    console.log("🏪 MERCHANT:");
    console.log(`   Email:    merchant@example.com`);
    console.log(`   Password: Merchant@123`);
    console.log(`   PIN:      1234`);
    console.log(`   Business: ${merchant.businessName}`);
    console.log(`   Balance:  ${Currency.toRupees(Number(merchant.balance))}`);
    console.log(`   QR Code:  ${merchant.merchantQrCode}`);
    console.log(`   Bank:     2345678901234567 (HDFC CURRENT — ₹1,00,000)`);
    console.log(`   IFSC:     HDFC0001234`);
    console.log("");

    console.log("🏦 BANK ADMIN:");
    console.log(`   Email:    admin@example.com`);
    console.log(`   Password: Admin@123`);
    console.log(`   Bank:     State Bank of India`);
    console.log("");

    console.log("─".repeat(70));
    console.log("  HOW TO TEST link-initiate (bank test accounts):");
    console.log("  1. Login with e.g. vikram.hdfc@gmail.com → get JWT");
    console.log("  2. POST /api/v0/bank/link-initiate with:");
    console.log('     { "bankName": "hdfc",');
    console.log('       "accountNumber": "HDFC0000000001",');
    console.log('       "ifscCode": "HDFC0001234",');
    console.log('       "accountType": "SAVINGS" }');
    console.log("  ✅ Links     — if JWT belongs to vikram.hdfc@gmail.com");
    console.log("  ❌ Rejected  — if JWT belongs to anyone else");
    console.log("─".repeat(70));

    console.log("\n💡 TIP: All bank test accounts use password: Test@1234");
    console.log("=".repeat(70) + "\n");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seed().catch((error) => {
  console.error("Fatal error during seeding:", error);
  process.exit(1);
});
