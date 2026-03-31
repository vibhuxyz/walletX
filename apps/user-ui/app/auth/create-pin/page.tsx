import type { Metadata } from "next";
import CreatePinForm from "./CreatePinForm";

export const metadata: Metadata = {
  title: "Set Up PIN | FineWallet",
  description:
    "Create a secure 4-digit PIN to protect your FineWallet transactions.",
  robots: { index: false, follow: false },
};

export default function CreatePinPage() {
  return <CreatePinForm />;
}
