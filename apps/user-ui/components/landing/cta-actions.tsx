"use client";

import Link from "next/link";
import { ArrowRight, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

export function CtaActions() {
  const { auth } = useAuth();

  if (auth.isAuthenticated) {
    return (
      <Button
        size="lg"
        asChild
        className="rounded-full bg-[#25d366] px-8 py-6 text-base font-semibold text-white shadow-lg gap-2 hover:bg-[#20bd5b]"
      >
        <Link href="/dashboard">
          <LayoutDashboard className="h-4 w-4" />
          Visit Dashboard
        </Link>
      </Button>
    );
  }

  return (
    <Button
      size="lg"
      asChild
      className="rounded-full bg-[#25d366] px-8 py-6 text-base font-semibold text-white shadow-lg hover:bg-[#20bd5b]"
    >
      <Link href="/auth/register">
        Create free account
        <ArrowRight className="ml-2 h-4 w-4" />
      </Link>
    </Button>
  );
}
