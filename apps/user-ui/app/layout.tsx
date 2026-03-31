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


export const metadata: Metadata = {
  title: "FineWallet - Send & Manage Money Instantly",
  description:
    "Send money instantly, link bank accounts, and manage your finances with FineWallet.",
  metadataBase: new URL("https://wallet.vibhugupta.me"),
  keywords: [
    "wallet",
    "payments",
    "upi",
    "digital wallet",
    "finewallet",
    "money transfer",
  ],

  openGraph: {
    title: "FineWallet - Send & Manage Money Instantly",
    description: "Send money instantly, link bank accounts, and manage your finances with FineWallet.",
    url: "https://wallet.vibhugupta.me",
    siteName: "FineWallet",
    type: "website",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "FineWallet - Send & Manage Money Instantly",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FineWallet - Send & Manage Money Instantly",
    description:
      "Send money instantly, link bank accounts, and manage your finances with FineWallet.",
    images: ["/og-image.svg"],
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
      <body className="font-sans antialiased bg-background text-foreground ml-3 mr-3">
        <Providers>
          <AuthProvider>{children}</AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
