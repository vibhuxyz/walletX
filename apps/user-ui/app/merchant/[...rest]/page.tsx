// app/merchant/[...rest]/page.tsx
import { notFound } from "next/navigation";

export default function MerchantCatchAll() {
  notFound();

  return null;
}
