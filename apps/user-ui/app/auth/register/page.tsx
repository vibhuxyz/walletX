import type { Metadata } from "next";
import RegisterForm from "./RegisterForm";

export const metadata: Metadata = {
  title: "Create Account | WalletX",
  description:
    "Sign up for WalletX and start sending money in minutes. Secure, fast, and easy digital wallet for everyone.",
  robots: { index: true, follow: true },
  openGraph: {
    title: "Create your WalletX account",
    description: "Start sending money in minutes with WalletX.",
    type: "website",
  },
};

export default function RegisterPage() {
  return <RegisterForm />;
}
