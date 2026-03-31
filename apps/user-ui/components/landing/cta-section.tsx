import Link from "next/link";
import {
  Wallet,
  Facebook,
  Instagram,
  Youtube,
  Linkedin,
  Twitter,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { CtaActions } from "@/components/landing/cta-actions";

const SOCIALS = [
  { label: "Facebook", href: "https://facebook.com", Icon: Facebook },
  { label: "X", href: "https://x.com", Icon: Twitter },
  { label: "Instagram", href: "https://instagram.com", Icon: Instagram },
  { label: "YouTube", href: "https://youtube.com", Icon: Youtube },
  { label: "LinkedIn", href: "https://linkedin.com", Icon: Linkedin },
];

const FOOTER_LINKS = {
  Personal: [
    { label: "Send Money", href: "/dashboard/send" },
    { label: "Top Up Wallet", href: "/dashboard/topup" },
    { label: "Transactions", href: "/dashboard/transactions" },
    { label: "KYC Verification", href: "/private/kyc" },
  ],
  Business: [
    { label: "Merchant Portal", href: "/merchant" },
    { label: "Sales Analytics", href: "/merchant/analytics" },
    { label: "Settlements", href: "/merchant/settlements" },
  ],
  Resources: [
    { label: "Help Centre", href: "/footer/help" },
    { label: "Transfer Fees", href: "/footer/fees" },
    { label: "Security Info", href: "/footer/security" },
    { label: "API Docs", href: "/footer/docs" },
  ],
  Company: [
    { label: "About Us", href: "/footer/about" },
    { label: "Blog", href: "/footer/blog" },
  ],
};

const LEGAL_LINKS = [
  { label: "Legal", href: "/legal" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Cookie Policy", href: "/cookies" },
  { label: "Accessibility", href: "/accessibility" },
  { label: "Complaints", href: "/complaints" },
  { label: "Service Status", href: "/status" },
];

export function CtaSection() {
  return (
    <section className="bg-[#f0fdf4] px-6 py-16 md:py-24">
      <div className="mx-auto max-w-7xl text-center">
        <h2 className="text-4xl font-black uppercase leading-[0.9] tracking-tighter text-[#0f1c17] md:text-5xl lg:text-6xl">
          One smart wallet,
          <br />
          unlimited possibilities
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-[#4a6657] text-pretty">
          Join thousands of users who trust FineWallet for fast, secure, and
          easy money transfers. Your wallet is just a signup away.
        </p>
        <div className="mt-8 flex justify-center">
          <CtaActions />
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer style={{ backgroundColor: "#dde8db" }} className="px-6 pt-14 pb-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0f1c17] transition-colors group-hover:bg-[#1b3a28]">
              <Wallet className="h-5 w-5 text-[#dde8db]" />
            </div>
            <span className="text-xl font-black tracking-tight text-[#0f1c17]">
              FineWallet
            </span>
          </Link>

          <div className="flex items-center gap-5">
            {SOCIALS.map(({ label, href, Icon }) => (
              <Link
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="text-[#0f1c17] opacity-70 transition-opacity hover:opacity-100"
              >
                <Icon className="h-5 w-5" strokeWidth={1.8} />
              </Link>
            ))}
          </div>
        </div>

        <Separator className="mb-10 bg-[#0f1c17]/10" />

        <div className="mb-12 grid grid-cols-2 gap-8 sm:grid-cols-4">
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h4 className="mb-5 text-xs font-bold uppercase tracking-widest text-[#0f1c17]/50">
                {category}
              </h4>
              <ul className="flex flex-col gap-3.5">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm font-medium text-[#0f1c17] opacity-80 transition-opacity hover:opacity-100"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="mb-8 bg-[#0f1c17]/10" />

        <div className="mb-8 flex flex-wrap gap-x-8 gap-y-3">
          {LEGAL_LINKS.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="text-sm text-[#0f1c17] opacity-55 transition-opacity hover:opacity-90"
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="space-y-3">
          <p className="max-w-3xl text-xs leading-relaxed text-[#0f1c17]/45">
            © FineWallet Payments Limited 2026. All rights reserved. FineWallet
            is authorised and regulated for the issuance of electronic money
            under applicable financial regulations.
          </p>
          <p className="max-w-3xl text-xs leading-relaxed text-[#0f1c17]/35">
            FineWallet operates in compliance with the Reserve Bank of India
            (RBI) guidelines for prepaid payment instruments and digital
            wallets. Funds held in your FineWallet are safeguarded in accordance
            with applicable e-money regulations.
          </p>
        </div>
      </div>
    </footer>
  );
}
