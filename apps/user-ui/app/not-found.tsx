"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Wallet, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";


function getPageLabel(url: string): string {
  try {
    const path = new URL(url).pathname;
    if (path === "/" || path === "") return "Home";
    const segments = path.split("/").filter(Boolean);
    const last = segments[segments.length - 1];
    return last.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  } catch {
    return "Previous Page";
  }
}

export default function NotFound() {
  const router = useRouter();
  const [prevLabel, setPrevLabel] = useState<string | null>(null);
  const [prevUrl, setPrevUrl] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const referrer = document.referrer;
    if (referrer && new URL(referrer).origin === window.location.origin) {
      setPrevUrl(referrer);
      setPrevLabel(getPageLabel(referrer));
    } else if (window.history.length > 1) {
      setPrevLabel("Previous Page");
      setPrevUrl(null);
    }
  }, []);

  function handleBack() {
    if (prevUrl) router.push(prevUrl);
    else router.back();
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-white">
      {/* ── Top green accent bar ── */}
      <div className="h-1 w-full bg-[#25d366]" />

      {/* ── Navbar ── */}
      <header
        className="flex items-center px-8 py-5 opacity-0"
        style={{
          animation: mounted ? "fadeDown .45s ease forwards .05s" : "none",
        }}
      >
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#25d366] shadow-sm group-hover:bg-[#20bd5b] transition-colors">
            <Wallet className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-black tracking-tight text-[#0f1c17]">
            FineWallet
          </span>
        </Link>
      </header>

      {/* ── Main ── */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-10">
        <div className="flex w-full max-w-lg flex-col items-center gap-8 text-center">
          {/* 404 giant number */}
          <div
            className="opacity-0 select-none"
            style={{
              animation: mounted ? "fadeUp .55s ease forwards .15s" : "none",
            }}
          >
            <p
              className="font-black leading-none tracking-tighter"
              style={{
                fontSize: "clamp(7rem, 20vw, 14rem)",
                color: "transparent",
                WebkitTextStroke: "3px #d1fae5",
                background: "linear-gradient(160deg, #f0fdf4 0%, #bbf7d0 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
              }}
            >
              404
            </p>
          </div>

          {/* Thin green rule */}
          <div
            className="h-0.5 w-12 rounded-full bg-[#25d366] opacity-0"
            style={{
              animation: mounted ? "scaleIn .35s ease forwards .38s" : "none",
            }}
          />

          {/* Text */}
          <div
            className="flex flex-col gap-2 opacity-0"
            style={{
              animation: mounted ? "fadeUp .5s ease forwards .42s" : "none",
            }}
          >
            <h1 className="text-3xl font-black tracking-tight text-[#0f1c17] sm:text-4xl">
              Page Not Found
            </h1>
            <p className="text-sm leading-relaxed text-gray-500 max-w-xs mx-auto">
              The page you're looking for doesn't exist or may have been moved.
            </p>
          </div>

          {/* Buttons */}
          <div
            className="flex flex-col items-center gap-3 sm:flex-row opacity-0"
            style={{
              animation: mounted ? "fadeUp .5s ease forwards .55s" : "none",
            }}
          >
            {prevLabel && (
              <Button
                variant="outline"
                onClick={handleBack}
                className="group gap-2 rounded-full border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900 px-6 h-11"
              >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                Back to{" "}
                <span className="text-[#25d366] font-semibold">
                  {prevLabel}
                </span>
              </Button>
            )}

            <Button
              asChild
              className="gap-2 rounded-full bg-[#25d366] text-white font-bold hover:bg-[#20bd5b] shadow-md hover:shadow-[0_6px_20px_rgba(37,211,102,0.3)] active:scale-95 transition-all px-6 h-11"
            >
              <Link href="/">
                <Home className="h-4 w-4" />
                Go to Home
              </Link>
            </Button>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer
        className="border-t border-gray-100 py-4 text-center opacity-0"
        style={{ animation: mounted ? "fadeUp .4s ease forwards .7s" : "none" }}
      >
        <p className="text-[11px] font-medium tracking-widest uppercase text-gray-300">
          Error 404 · FineWallet
        </p>
      </footer>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scaleX(0); }
          to   { opacity: 1; transform: scaleX(1); }
        }
      `}</style>
    </div>
  );
}
