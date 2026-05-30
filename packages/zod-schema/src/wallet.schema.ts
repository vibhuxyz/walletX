import { z } from "zod";
export const idTypeEnum = z.enum(["PAN", "AADHAAR", "PASSPORT"]);
export type IdType = z.infer<typeof idTypeEnum>;

export const ID_PATTERNS: Record<IdType, RegExp> = {
  PAN: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
  AADHAAR: /^\d{12}$/,
  PASSPORT: /^[A-Z][0-9]{7}$/,
};

export const activateWalletSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(100),
    dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
    address: z.object({
      line1: z.string().min(5, "Address must be at least 5 characters"),
      city: z.string().min(2, "City required"),
      state: z.string().min(2, "State required"),
      pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits"),
    }),
    idType: idTypeEnum,
    idNumber: z.string().optional(),

    idFrontUrl: z.string().url("Invalid idFrontUrl").optional(),
    idBackUrl: z.string().url("Invalid idBackUrl").optional(),
    selfieUrl: z.string().url("Invalid selfieUrl").optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.idNumber && !data.idFrontUrl) {
      ctx.addIssue({
        code: "custom",
        message: "Provide an ID number or upload the front image",
        path: ["idNumber"],
      });
    }

    if (data.idNumber && !ID_PATTERNS[data.idType].test(data.idNumber)) {
      // ✅ Uses the exported pattern — no duplication even inside the schema itself
      ctx.addIssue({
        code: "custom",
        message: `Invalid ${data.idType} format`,
        path: ["idNumber"],
      });
    }
  });

export const validateTransferSchema = z.object({
  recipient: z.string().trim().min(3, "email, phone, or walletId"),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format"),
  note: z.string().trim().max(140, "Note can be up to 140 characters").optional(),
});

export const confirmTransferSchema = z.object({
  transferId: z.string().min(6),
  pin: z
    .string()
    .regex(/^\d{4}$/)
    .optional(),
});


export const initiateTopupSchema = z.object({
  linkedAccountId: z.string().min(1, "Linked account ID required"),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format"),
});

export const verifyPinTopupSchema = z.object({
  orderId: z.string(),
  pin: z
    .string()
    .length(4)
    .regex(/^\d{4}$/, "PIN must be 4 digits"),
});

export const confirmTopupSchema = z.object({
  orderId: z.string(),
  otp: z
    .string()
    .length(6)
    .regex(/^\d{6}$/, "OTP must be 6 digits"),
});

export const createPaymentRequestSchema = z.object({
  recipientIdentifier: z.string().trim().min(3, "Recipient identifier required"), // email, phone, or wallet QR
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format"),
  reason: z.string().trim().max(200).optional(),
});

export const payRequestSchema = z.object({
  pin: z
    .string()
    .length(4)
    .regex(/^\d{4}$/, "PIN must be 4 digits"),
});

export const withdrawToBankSchema = z.object({
  linkedAccountId: z.string().min(1, "Linked account ID required"),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format"),
  pin: z
    .string()
    .length(4)
    .regex(/^\d{4}$/, "PIN must be 4 digits"),
  note: z.string().trim().max(140, "Note can be up to 140 characters").optional(),
});

export const createConnectPartnerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  redirectUris: z.array(z.string().url()).min(1),
  scopes: z
    .array(
      z.enum([
        "wallet:read",
        "wallet:hold",
        "wallet:capture",
        "wallet:credit",
      ]),
    )
    .default(["wallet:read", "wallet:hold", "wallet:capture", "wallet:credit"]),
});

export const createOnboardingSessionSchema = z.object({
  partnerUserId: z.string().trim().min(1).max(120),
  email: z.string().trim().email(),
  phone: z.string().trim().min(8).max(20).optional(),
  fullName: z.string().trim().min(2).max(100).optional(),
  redirectUrl: z.string().url(),
});

export const exchangeConnectTokenSchema = z.object({
  code: z.string().trim().min(20),
});

export const createWalletHoldSchema = z.object({
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format"),
  currency: z.literal("INR").default("INR"),
  reason: z.string().trim().min(3).max(120),
  referenceId: z.string().trim().min(1).max(160),
});

export const partnerWalletCreditSchema = z.object({
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format"),
  currency: z.literal("INR").default("INR"),
  reason: z.string().trim().min(3).max(120),
  referenceId: z.string().trim().min(1).max(160),
});

export type ActivateWalletInput = z.infer<typeof activateWalletSchema>;
export type WithdrawToBankInput = z.infer<typeof withdrawToBankSchema>;
export type CreateConnectPartnerInput = z.infer<
  typeof createConnectPartnerSchema
>;
export type CreateOnboardingSessionInput = z.infer<
  typeof createOnboardingSessionSchema
>;
export type CreateWalletHoldInput = z.infer<typeof createWalletHoldSchema>;
export type PartnerWalletCreditInput = z.infer<
  typeof partnerWalletCreditSchema
>;
