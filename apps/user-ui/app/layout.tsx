import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";
import Providers from "./Provider";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
});

type ConnectionHint = {
  origin: string;
  dnsPrefetchHref: string;
};

function getConnectionHint(rawUrl?: string): ConnectionHint | null {
  if (!rawUrl) return null;

  try {
    const parsed = new URL(rawUrl);
    const protocol =
      parsed.protocol === "ws:"
        ? "http:"
        : parsed.protocol === "wss:"
          ? "https:"
          : parsed.protocol;

    return {
      origin: `${protocol}//${parsed.host}`,
      dnsPrefetchHref: `//${parsed.host}`,
    };
  } catch {
    return null;
  }
}

const connectionHints = Array.from(
  new Map(
    [
      getConnectionHint(process.env.NEXT_PUBLIC_API_URL),
      getConnectionHint(process.env.NEXT_PUBLIC_WS_URL),
    ]
      .filter((hint): hint is ConnectionHint => Boolean(hint))
      .map((hint) => [hint.origin, hint]),
  ).values(),
);

export const metadata: Metadata = {
  title: "WalletX - Send & Manage Money Instantly",
  description:
    "Send money instantly, top up from your bank, request payments, and track spending analytics — all in one secure INR wallet with WalletX.",
  metadataBase: new URL("https://walletxx.vercel.app"),
  keywords: [
    "walletx",
    "digital wallet",
    "money transfer",
    "p2p transfer",
    "send money",
    "top up",
    "bank account",
    "spending analytics",
    "inr wallet",
    "upi",
    "payments",
    "kyc",
    "request money",
  ],

  openGraph: {
    title: "WalletX - Send & Manage Money Instantly",
    description:
      "Send money instantly, top up from your bank, request payments, and track spending analytics — all in one secure INR wallet with WalletX.",
    url: "https://walletxx.vercel.app",
    siteName: "WalletX",
    type: "website",
    // OG image is auto-generated as PNG by app/opengraph-image.tsx
    // Next.js injects it automatically — no manual images[] needed
  },
  twitter: {
    card: "summary_large_image",
    title: "WalletX - Send & Manage Money Instantly",
    description:
      "Send money instantly, top up from your bank, request payments, and track spending analytics — all in one secure INR wallet with WalletX.",
    // twitter image is resolved from app/opengraph-image.tsx automatically
  },
};

export const viewport: Viewport = {
  themeColor: "#0d1117",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} font-sans`}>
      <head>
        {connectionHints.map((hint) => (
          <link
            key={`dns-prefetch-${hint.origin}`}
            rel="dns-prefetch"
            href={hint.dnsPrefetchHref}
          />
        ))}
        {connectionHints.map((hint) => (
          <link
            key={`preconnect-${hint.origin}`}
            rel="preconnect"
            href={hint.origin}
            crossOrigin="anonymous"
          />
        ))}
      </head>
      <body className="font-sans antialiased bg-background text-foreground ml-3 mr-3">
        <Providers>
          <AuthProvider>{children}</AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
