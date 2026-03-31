"use client";

import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  FileText,
  Shield,
  Cookie,
  Building2,
  Briefcase,
  Newspaper,
  BookOpen,
  HelpCircle,
  Receipt,
  Activity,
  Megaphone,
  Scale,
  Accessibility,
  MessageSquareWarning,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

const PAGE_META: Record<
  string,
  { label: string; icon: React.ElementType; message: string }
> = {
  legal: {
    label: "Legal",
    icon: Scale,
    message: "Our legal documents are being reviewed and updated.",
  },
  privacy: {
    label: "Privacy Policy",
    icon: Shield,
    message: "Our privacy policy page is being prepared.",
  },
  cookies: {
    label: "Cookie Policy",
    icon: Cookie,
    message: "Cookie policy documentation is on its way.",
  },
  about: {
    label: "About Us",
    icon: Building2,
    message: "We're putting together our story. Check back soon.",
  },
  careers: {
    label: "Careers",
    icon: Briefcase,
    message: "Job listings and career info are coming soon.",
  },
  press: {
    label: "Press",
    icon: Newspaper,
    message: "Press kit and media resources are being prepared.",
  },
  blog: {
    label: "Blog",
    icon: BookOpen,
    message: "Our blog is launching soon. Stay tuned.",
  },
  help: {
    label: "Help Centre",
    icon: HelpCircle,
    message: "Our support hub is being built.",
  },
  fees: {
    label: "Transfer Fees",
    icon: Receipt,
    message: "Our fee schedule page is being drafted.",
  },
  security: {
    label: "Security Info",
    icon: Shield,
    message: "Security documentation is being prepared.",
  },
  docs: {
    label: "API Docs",
    icon: FileText,
    message: "Developer documentation is on its way.",
  },
  status: {
    label: "Service Status",
    icon: Activity,
    message: "Our status page is being set up.",
  },
  complaints: {
    label: "Complaints",
    icon: MessageSquareWarning,
    message: "The complaints process page is being prepared.",
  },
  accessibility: {
    label: "Accessibility",
    icon: Accessibility,
    message: "Our accessibility statement is being written.",
  },
  announcements: {
    label: "Announcements",
    icon: Megaphone,
    message: "Announcements page is coming soon.",
  },
};

function getPageMeta(pathname: string | null) {
  if (!pathname) return null;
  const segment = pathname.split("/").filter(Boolean).pop() ?? "";
  return PAGE_META[segment] ?? null;
}

const QUICK_LINKS = [
  { label: "Dashboard", href: "/dashboard", icon: Wallet },
  { label: "Send Money", href: "/dashboard/send-money", icon: Receipt },
  { label: "Transactions", href: "/dashboard/transactions", icon: FileText },
  { label: "Help Centre", href: "/footer/help", icon: HelpCircle },
];

export default function FooterPageNotFound() {
  const router = useRouter();
  const pathname = usePathname();
  const meta = getPageMeta(pathname);

  const Icon = meta?.icon ?? FileText;
  const label = meta?.label ?? "This Page";
  const message =
    meta?.message ??
    "This page is currently being built and will be available soon.";

  return (
    <div className="relative min-h-screen w-full bg-white flex flex-col">
      {/* Green top bar */}
      <div className="h-1 w-full bg-[#25d366]" />

      {/* Navbar */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#25d366] group-hover:bg-[#20bd5b] transition-colors shadow-sm">
            <Wallet className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-black tracking-tight text-[#0f1c17]">
            FineWallet
          </span>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-1.5 text-gray-500 hover:text-gray-900 rounded-full"
        >
          <ArrowLeft className="h-4 w-4" />
          Go back
        </Button>
      </header>

      {/* Main */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-2xl flex flex-col items-center gap-10 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Badge
              variant="outline"
              className="gap-2 border-[#25d366]/35 bg-[#f0fdf4] text-[#16a34a] py-1.5 px-4 text-[10px] font-bold uppercase tracking-widest rounded-full"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25d366] opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#25d366]" />
              </span>
              Coming Soon
            </Badge>
          </motion.div>

          {/* Icon */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: 0.1,
              type: "spring",
              stiffness: 180,
              damping: 14,
            }}
            className="relative"
          >
            {/* Spinning dashed ring */}
            <div className="absolute -inset-4 rounded-[36px] border-2 border-dashed border-[#25d366]/20 animate-[spin_18s_linear_infinite]" />
            <div className="flex h-24 w-24 items-center justify-center rounded-[24px] bg-[#f0fdf4] border border-[#25d366]/25 shadow-sm">
              <Icon className="h-11 w-11 text-[#25d366]" strokeWidth={1.4} />
            </div>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.45 }}
            className="flex flex-col gap-3"
          >
            <h1 className="text-4xl font-black tracking-tighter text-[#0f1c17] sm:text-5xl leading-[1.05]">
              {label}
              <br />
              <span className="text-[#25d366]">Is On Its Way</span>
            </h1>
            <p className="mx-auto max-w-md text-[15px] leading-relaxed text-[#5a7a6a]">
              {message} We're working hard to get everything ready for you. In
              the meantime, feel free to explore the rest of FineWallet.
            </p>
          </motion.div>

          {/* Divider */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.42 }}
            className="flex w-full items-center gap-4"
          >
            <Separator className="flex-1 bg-gray-100" />
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400 whitespace-nowrap">
              While You Wait
            </span>
            <Separator className="flex-1 bg-gray-100" />
          </motion.div>

          {/* Quick links grid */}
          <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
            {QUICK_LINKS.map(({ label: ql, href, icon: QIcon }, i) => (
              <motion.div
                key={ql}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.07 }}
                whileHover={{ y: -3, transition: { duration: 0.15 } }}
              >
                <Link
                  href={href}
                  className="group flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50/80 p-5 text-center hover:border-[#25d366]/30 hover:bg-[#f0fdf4]/70 transition-all duration-200"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white group-hover:border-[#25d366]/30 group-hover:bg-[#f0fdf4] transition-colors shadow-sm">
                    <QIcon
                      className="h-5 w-5 text-[#25d366]"
                      strokeWidth={1.8}
                    />
                  </div>
                  <span className="text-xs font-semibold text-[#0f1c17]">
                    {ql}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.88 }}
            className="flex flex-col items-center gap-3 sm:flex-row"
          >
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="group gap-2 rounded-full border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900 px-6 h-11"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              Back to Home
            </Button>
            <Button
              onClick={() => router.push("/dashboard")}
              className="gap-2 rounded-full bg-[#25d366] text-white font-bold hover:bg-[#20bd5b] shadow-md hover:shadow-[0_6px_20px_rgba(37,211,102,0.3)] active:scale-95 transition-all px-8 h-11"
            >
              Open Dashboard
            </Button>
          </motion.div>

          {/* Notify */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.05 }}
            className="text-[11px] text-gray-400"
          >
            Want to be notified when this page is ready?{" "}
            <a
              href="mailto:support@finewallet.in"
              className="text-[#25d366] hover:underline underline-offset-2 transition-colors"
            >
              support@finewallet.in
            </a>
          </motion.p>
        </div>
      </main>

      {/* Footer bar */}
      <div className="border-t border-gray-100 py-4 text-center">
        <p className="text-[11px] font-medium tracking-widest uppercase text-gray-300">
          Page Not Found · FineWallet
        </p>
      </div>
    </div>
  );
}
