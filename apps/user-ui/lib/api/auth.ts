import axios from "axios";
import type {
  ActivateWalletInput,
  ChangePinInput,
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  ResetPinWithOtpInput,
  SetPinInput,
  VerifyEmailInput,
} from "@repo/zod-schema";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export function getDeviceHeaders() {
  if (typeof window === "undefined") return {};
  let deviceId = localStorage.getItem("fw_device_id");
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem("fw_device_id", deviceId);
  }
  return {
    "X-Device-Id": deviceId,
    "X-Device-Name": navigator.userAgent.includes("Mobile")
      ? "Mobile"
      : "Desktop",
  };
}

function authRequest<T>(url: string, data: T) {
  return axios.post(`${BASE}${url}`, data, {
    headers: { "Content-Type": "application/json", ...getDeviceHeaders() },
    withCredentials: true,
  });
}

export async function uploadImage(
  blobUrl: string | undefined,
  fieldName: "idFront" | "idBack" | "selfie" | "profile",
   ): Promise<string | undefined> {
  // If no blob URL or already a real URL, return as-is
  if (!blobUrl || !blobUrl.startsWith("blob:")) {
    return blobUrl || undefined;
  }

  try {
    // Convert blob URL to File
    const res = await fetch(blobUrl);
    const blob = await res.blob();
    const file = new File([blob], `${fieldName}.jpg`, {
      type: blob.type || "image/jpeg",
    });

    // Create FormData
    const formData = new FormData();
    formData.append("file", file);

    // Map field names to upload endpoints
    const endpointMap: Record<typeof fieldName, string> = {
      idFront: "/api/v0/auth/upload/id-front",
      idBack: "/api/v0/auth/upload/id-back",
      selfie: "/api/v0/auth/upload/selfie",
      profile: "/api/v0/auth/upload/profile",
    };

    // Upload to backend
    const uploadRes = await axios.post(
      `${BASE}${endpointMap[fieldName]}`,
      formData,
      {
        headers: {
          ...getDeviceHeaders(),
          
        },
        withCredentials: true,
      },
    );

    // Return Cloudinary URL
    return uploadRes.data.data.url as string;
  } catch (error: any) {
    console.error("Upload error:", error);
    throw new Error(error.response?.data?.error || "Failed to upload image");
  }
}

export const authApi = {
  register: (data: RegisterInput) =>
    authRequest("/api/v0/auth/register-user", data),
  verifyEmail: (data: VerifyEmailInput) =>
    authRequest("/api/v0/auth/verify-email", data),
  resendOtp: (email: string) =>
    authRequest("/api/v0/auth/resend-otp", { email }),
  setupPin: (data: SetPinInput) => authRequest("/api/v0/auth/set-pin", data),
  changePin: (data: ChangePinInput) =>
    authRequest("/api/v0/auth/change-pin", data),
  loginUser: (data: LoginInput) => authRequest("/api/v0/auth/login-user", data),
  verifyLoginOtp: (data: { email: string; otp: string }) =>
    authRequest("/api/v0/auth/user-verify-otp", data),
  resendLoginOtp: (email: string) =>
    authRequest("/api/v0/auth/resend-login-otp", { email }),
  forgotPassword: (data: ForgotPasswordInput) =>
    authRequest("/api/v0/auth/forgot-password", data),
  resendForgotPasswordOtp: (email: string) =>
    authRequest("/api/v0/auth/resend-forgot-password-otp", { email }),
  resetPassword: (data: ResetPasswordInput) =>
    authRequest("/api/v0/auth/reset-password", data),
  forgotPinOtp: () => authRequest("/api/v0/auth/forgot-pin", {}),
  resendForgotPinOtp: () =>
    authRequest("/api/v0/auth/resend-forgot-pin-otp", {}),
  resetPinWithOtp: (data: ResetPinWithOtpInput) =>
    authRequest("/api/v0/auth/reset-pin", data),
  requestDeleteAccountOtp: () =>
    authRequest("/api/v0/auth/delete-account/request-otp", {}),
  resendDeleteAccountOtp: () =>
    authRequest("/api/v0/auth/delete-account/resend-otp", {}),
  confirmDeleteAccountOtp: (otp: string) =>
    authRequest("/api/v0/auth/delete-account/confirm", { otp }),
  submitKyc: (data: ActivateWalletInput) =>
    authRequest("/api/v0/wallet/kyc-submit", data),
  logout: (role: string = "user") =>
    axios.post(
      `${BASE}/api/v0/auth/logout/${role.toLowerCase()}`,
      {},
      {
        headers: { "Content-Type": "application/json", ...getDeviceHeaders() },
        withCredentials: true,
      },
    ),
};

export const pendingEmail = {
  set: (email: string) => sessionStorage.setItem("fw_pending_email", email),
  get: () => sessionStorage.getItem("fw_pending_email") ?? "",
  clear: () => sessionStorage.removeItem("fw_pending_email"),
};
