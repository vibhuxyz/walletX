// app/auth/kyc/page.tsx  — Server Component for SEO metadata
import type { Metadata } from "next";
import KycForm from "./KycForm";

export const metadata: Metadata = {
  title: "Verify Identity | FineWallet",
  description:
    "Complete your KYC verification to activate your FineWallet and unlock all features.",
  robots: { index: false, follow: false },
};

export default function KycPage() {
  return <KycForm />;
}
