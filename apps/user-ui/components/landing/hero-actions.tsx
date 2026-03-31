"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

export function HeroActions() {
  const { auth } = useAuth();
  const isLoggedIn = auth.isAuthenticated;

  if (isLoggedIn) {
    return (
      <>
        <Button
          size="lg"
          asChild
          className="rounded-full bg-primary px-8 py-6 text-base font-semibold text-primary-foreground shadow-lg hover:bg-primary/90"
        >
          <Link href="/dashboard">
            Go to dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>

        <Button
          size="lg"
          variant="outline"
          asChild
          className="rounded-full border-primary px-8 py-6 text-base font-semibold text-primary hover:bg-primary hover:text-primary-foreground"
        >
          <Link href="/dashboard/send-money">Start sending →</Link>
        </Button>
      </>
    );
  }

  return (
    <Button
      size="lg"
      asChild
      className="rounded-full bg-primary px-8 py-6 text-base font-semibold text-primary-foreground shadow-lg hover:bg-primary/90"
    >
      <Link href="/auth/register">
        Sign up in minutes
        <ArrowRight className="ml-2 h-4 w-4" />
      </Link>
    </Button>
  );
}
