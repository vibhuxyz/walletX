"use client";

import Link from "next/link";
import { Wallet } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      {/* Top nav */}
      <header className="flex items-center px-6 py-5">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <Wallet className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">
            WalletX
          </span>
        </Link>
      </header>

      {/* Centered content — max-w-5xl gives breathing room like the reference */}
      <main className="flex flex-1 items-center justify-center px-6 py-8">
        <div className="w-full max-w-5xl">
          {children}
        </div>
      </main>

      <footer className="py-5 text-center text-xs text-muted-foreground">
        By continuing you agree to our{" "}
        <span className="underline underline-offset-2 cursor-pointer hover:text-foreground">
          Terms of Service
        </span>{" "}
        and{" "}
        <span className="underline underline-offset-2 cursor-pointer hover:text-foreground">
          Privacy Policy
        </span>
        .
      </footer>
    </div>
  );
}

