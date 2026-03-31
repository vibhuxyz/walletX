"use client";

import Link from "next/link";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { useAuth } from "@/lib/auth-context";
import { useCurrentUser } from "@/lib/wallet/useWalletQuery";
import { getInitials } from "@/lib/constants";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, Home } from "lucide-react";
import { ConnectionStatusIndicator } from "@/components/shared/connection-status";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { auth, wsStatus } = useAuth();
  const { data: user, isLoading } = useCurrentUser();

  const displayName = auth.name || user?.fullName || "User";
  const selfieUrl = user?.kycProfile?.selfieUrl;

  return (
    <SidebarProvider>
      {/* WS status is already "connected" by the time this renders */}
      <ConnectionStatusIndicator status={wsStatus} />

      <div className="flex min-h-screen w-full bg-white">
        <div className="mx-auto flex w-full max-w-[1440px]">
          <AppSidebar />
          <SidebarInset className="bg-white border-none flex-1">
            <header className="flex h-20 items-center justify-between px-8 gap-6 bg-white">
              {/* Home button */}
              <Link
                href="/"
                className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-[#373d48] transition-all hover:border-[#25d366] hover:text-[#25d366] hover:shadow-sm"
              >
                <Home className="h-4 w-4" />
                Home
              </Link>

              {isLoading ? (
                <div className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4" />
                </div>
              ) : (
                <Link
                  href="/dashboard/settings"
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                  <Avatar className="h-9 w-9">
                    {selfieUrl && (
                      <AvatarImage
                        src={selfieUrl}
                        alt={displayName}
                        className="object-cover"
                      />
                    )}
                    <AvatarFallback className="bg-[#e2f3e8] text-[#1b4b36] font-semibold text-xs">
                      {getInitials(displayName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-bold">{displayName}</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Link>
              )}
            </header>
            <main className="w-full px-8 pb-20">
              <div className="max-w-[1100px]">{children}</div>
            </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
