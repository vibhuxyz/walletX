import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password too long")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^a-zA-Z0-9]/,
    "Password must contain at least one special character",
  );

const emailSchema = z.string().email("Invalid email format");

const phoneSchema = z
  .string()
  .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit mobile number");

export const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name is too long"),
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
});

export const verifyEmailSchema = z.object({
  email: emailSchema,
  otp: z.string().regex(/^\d{6}$/, "OTP must be 6 digits"),
});

export const resendOtpSchema = z.object({
  email: emailSchema,
});

export const setPinSchema = z
  .object({
    pin: z.string().regex(/^\d{4}$/, "PIN must be 4 digits"),
    confirmPin: z.string().regex(/^\d{4}$/),
  })
  .refine((data) => data.pin === data.confirmPin, {
    message: "PINs do not match",
    path: ["confirmPin"],
  });

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const verifyLoginOtpSchema = z.object({
  email: emailSchema,
  otp: z.string().regex(/^\d{6}$/, "OTP must be 6 digits"),
  trustDevice: z.boolean().default(false),
});

export const resendLoginOtpSchema = z.object({
  email: emailSchema,
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    email: emailSchema,
    otp: z.string().regex(/^\d{6}$/, "OTP must be 6 digits"),
    newPassword: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const pinField = z.string().regex(/^\d{4}$/, "PIN must be 4 digits");

export const changePinSchema = z
  .object({
    currentPin: pinField,
    newPin: pinField,
    confirmNewPin: pinField,
  })
  .refine((data) => data.newPin === data.confirmNewPin, {
    message: "PINs do not match",
    path: ["confirmNewPin"],
  })
  .refine((data) => data.currentPin !== data.newPin, {
    message: "New PIN must be different from current PIN",
    path: ["newPin"],
  });

export const resetPinWithOtpSchema = z
  .object({
    otp: z.string().regex(/^\d{6}$/, "OTP must be 6 digits"),
    newPin: pinField,
    confirmNewPin: pinField,
  })
  .refine((data) => data.newPin === data.confirmNewPin, {
    message: "PINs do not match",
    path: ["confirmNewPin"],
  });

export const deleteAccountOtpSchema = z.object({
  otp: z.string().regex(/^\d{6}$/, "OTP must be 6 digits"),
});

export type registerSchemaInput = z.infer<typeof registerSchema>;
export type verifyRegisterInput = z.infer<typeof verifyEmailSchema>;

export type RegisterInput = z.infer<typeof registerSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type ResendOtpInput = z.infer<typeof resendOtpSchema>;
export type SetPinInput = z.infer<typeof setPinSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VerifyLoginOtpInput = z.infer<typeof verifyLoginOtpSchema>;
export type ResendLoginOtpInput = z.infer<typeof resendLoginOtpSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePinInput = z.infer<typeof changePinSchema>;
export type ResetPinWithOtpInput = z.infer<typeof resetPinWithOtpSchema>;
export type DeleteAccountOtpInput = z.infer<typeof deleteAccountOtpSchema>;
