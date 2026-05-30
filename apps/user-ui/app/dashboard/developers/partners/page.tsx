"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DeprecatedConnectPartnersPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/connect/partners");
  }, [router]);

  return null;
}
