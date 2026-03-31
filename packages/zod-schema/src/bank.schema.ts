import { z } from "zod";

export const BankName = {
  SBI: "State Bank of India",
  HDFC: "HDFC Bank",
  ICICI: "ICICI Bank",
  AXIS: "Axis Bank",
  KOTAK: "Kotak Mahindra Bank",
  PNB: "Punjab National Bank",
  BOB: "Bank of Baroda",
  CANARA: "Canara Bank",
  UNION: "Union Bank of India",
  IDBI: "IDBI Bank",
} as const;

export const BankAccountType = {
  SAVINGS: "SAVINGS",
  CURRENT: "CURRENT",
} as const;

export const initiateBankLinkSchema = z.object({
  // Zod v4 syntax: just use 'message'
  bankName: z.nativeEnum(BankName, {
    message: "Please select a supported bank",
  }),
  accountNumber: z
    .string()
    .trim()
    .regex(/^\d+$/, "Account number must contain only digits")
    .min(10, "Account number cant be less than 10 digits")
    .max(20, "Account number cant be exceed 20 digits"),
  ifscCode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code"),
  accountHolder: z
    .string()
    .trim()
    .min(2, "Account holder name is required"),
  accountType: z.nativeEnum(BankAccountType, {
    message: "Account type must be SAVINGS or CURRENT",
  }),
});

export const verifyPinBankLinkSchema = z.object({
  linkToken: z.string().trim().min(1, "linkToken is required"),
  pin: z
    .string()
    .length(4, "PIN must be exactly 4 digits")
    .regex(/^\d{4}$/, "PIN can only contain numbers"),
});

export const confirmBankLinkSchema = z.object({
  linkToken: z.string().trim().min(1, "linkToken is required"),
  otp: z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d{6}$/, "OTP can only contain numbers"),
});

export const createBankAccountSchema = z.object({
  bankName: z.nativeEnum(BankName, {
    message: "Invalid Bank Name",
  }),
  accountHolder: z.string().trim().min(2).max(100),
  email: z.string().email("Invalid email format"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Invalid Indian phone number"),
  initialBalance: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format")
    .refine((val) => parseFloat(val) >= 0, "Initial balance must be positive")
    .refine(
      (val) => parseFloat(val) <= 1000000,
      "Initial balance cannot exceed ₹10,00,000",
    ),
  accountType: z.nativeEnum(BankAccountType, {
    message: "Invalid Account Type",
  }),
});

export type InitiateBankLinkInput = z.infer<typeof initiateBankLinkSchema>;
export type VerifyPinBankLinkInput = z.infer<typeof verifyPinBankLinkSchema>;
export type ConfirmBankLinkInput = z.infer<typeof confirmBankLinkSchema>;
export type CreateBankAccountInput = z.infer<typeof createBankAccountSchema>;
