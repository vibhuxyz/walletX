import type { Metadata } from "next";
import VerifyOtpForm from "./VerifyOtpForm";

export const metadata: Metadata = {
  title: "Verify Email | FineWallet",
  description:
    "Enter the 6-digit code sent to your email to verify your FineWallet account.",
  robots: { index: false, follow: false },
};

export default function VerifyOtpPage() {
  return <VerifyOtpForm />;
}
