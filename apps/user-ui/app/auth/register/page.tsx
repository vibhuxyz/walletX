import type { Metadata } from "next";
import RegisterForm from "./RegisterForm";

export const metadata: Metadata = {
  title: "Create Account | FineWallet",
  description:
    "Sign up for FineWallet and start sending money in minutes. Secure, fast, and easy digital wallet for everyone.",
  robots: { index: true, follow: true },
  openGraph: {
    title: "Create your FineWallet account",
    description: "Start sending money in minutes with FineWallet.",
    type: "website",
  },
};

export default function RegisterPage() {
  return <RegisterForm />;
}
