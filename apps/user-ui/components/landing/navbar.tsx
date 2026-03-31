"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import {
  Wallet,
  Menu,
  X,
  ChevronDown,
  UserCircle2,
  Store,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

// ── Signup dropdown ────────────────────────────────────────────────
function SignupDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <Button
        size="sm"
        className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-5 flex items-center gap-1"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
      >
        Sign up
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-border/60 bg-card shadow-lg overflow-hidden z-50">
          <Link
            href="/auth/register"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <UserCircle2 className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-semibold">Sign up as User</p>
              <p className="text-xs text-muted-foreground">Personal wallet</p>
            </div>
          </Link>
          <div className="h-px bg-border/40 mx-3" />
          <Link
            href="/merchant/auth/signup"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Store className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-semibold">Sign up as Merchant</p>
              <p className="text-xs text-muted-foreground">Business payments</p>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}

// ── Mobile signup options ──────────────────────────────────────────
function MobileSignupOptions({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground px-1">
        Create account
      </p>
      <Link
        href="/auth/register"
        onClick={onClose}
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
      >
        <UserCircle2 className="h-4 w-4 text-primary" />
        Sign up as User
      </Link>
      <Link
        href="/merchant/auth/signup"
        onClick={onClose}
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
      >
        <Store className="h-4 w-4 text-primary" />
        Sign up as Merchant
      </Link>
    </div>
  );
}

// ── Navbar ─────────────────────────────────────────────────────────
export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  // ✅ Fixed: AuthContextType exposes `auth`, not `user` directly
  const { auth } = useAuth();
  const isLoggedIn = auth.isAuthenticated;

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-card/95 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Wallet className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            FineWallet
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden items-center gap-8 md:flex">
          <Link
            href="#features"
            className="text-sm font-medium text-foreground transition-colors hover:text-muted-foreground"
          >
            Personal
          </Link>
          <Link
            href="#how-it-works"
            className="text-sm font-medium text-foreground transition-colors hover:text-muted-foreground"
          >
            Business
          </Link>
          <Link
            href="#security"
            className="text-sm font-medium text-foreground transition-colors hover:text-muted-foreground"
          >
            Platform
          </Link>
        </div>

        {/* Desktop auth buttons */}
        <div className="hidden items-center gap-4 md:flex">
          {isLoggedIn ? (
            <Button
              asChild
              size="sm"
              className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-5 gap-2"
            >
              <Link href="/dashboard">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
            </Button>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm font-medium text-foreground hover:text-muted-foreground transition-colors"
              >
                Log in
              </Link>
              <SignupDropdown />
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border/40 bg-card px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            <Link
              href="#features"
              className="text-sm font-medium text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              Personal
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm font-medium text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              Business
            </Link>
            <Link
              href="#security"
              className="text-sm font-medium text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              Platform
            </Link>

            <div className="border-t border-border/40 pt-3">
              {isLoggedIn ? (
                <Button
                  asChild
                  className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                >
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                </Button>
              ) : (
                <div className="flex flex-col gap-3">
                  <Button variant="ghost" asChild className="w-full">
                    <Link
                      href="/auth/login"
                      onClick={() => setMobileOpen(false)}
                    >
                      Log in
                    </Link>
                  </Button>
                  <MobileSignupOptions onClose={() => setMobileOpen(false)} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
