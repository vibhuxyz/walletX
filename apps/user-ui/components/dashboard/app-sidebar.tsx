"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Settings,
  LogOut,
  Send,
  ArrowDownLeft,
  Plus,
  Loader2,
} from "lucide-react";
import { customerNavItems } from "@/lib/constants";
import { useAuth } from "@/lib/auth-context";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const pathname = usePathname();
  const { logout, isLoggingOut } = useAuth();

  // Active state helpers
  const isSendActive = pathname === "/dashboard/send-money";
  const isTopUpActive = pathname === "/dashboard/top-up";
  const isRequestActive = pathname === "/dashboard/request-money";
  const isSettingsActive = pathname === "/dashboard/settings";

  return (
    <Sidebar className="border-none bg-white w-[240px]">
      <SidebarHeader className="pt-10 px-6 bg-white">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="text-[#25d366]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3.5 3L5 5.5L11 3L13.5 8L16.5 3L19 5.5L14 13L21 21H16.5L13.5 16.5L11 21H3.5L8.5 13L3.5 3Z" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-[#373d48]">
            WalletX
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-4 mt-8 bg-white">
        {/* Quick Action Buttons */}
        <div className="flex flex-col gap-2 mb-6">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className={`rounded-full py-6 px-4 transition-all ${
                  isSendActive
                    ? "bg-[#20bd5b] !text-white hover:!bg-[#20bd5b] hover:!text-white shadow-sm"
                    : "bg-[#25d366] !text-white hover:bg-[#20bd5b]"
                }`}
              >
                <Link
                  href="/dashboard/send-money"
                  className="flex items-center gap-3"
                >
                  <div className="bg-white/20 p-1.5 rounded-full">
                    <Send className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-bold text-[14px]">Send Money</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem className="mt-1">
              <SidebarMenuButton
                asChild
                className={`rounded-full py-6 px-4 border transition-all ${
                  isTopUpActive
                    ? "bg-gray-100 border-gray-300 !text-[#373d48] hover:!bg-gray-100"
                    : "border-gray-200 !text-[#373d48] hover:bg-gray-50"
                }`}
              >
                <Link
                  href="/dashboard/top-up"
                  className="flex items-center gap-3"
                >
                  <div className="bg-blue-50 p-1.5 rounded-full text-blue-600">
                    <Plus className="h-4 w-4" />
                  </div>
                  <span className="font-bold text-[14px]">Top up</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem className="mt-1">
              <SidebarMenuButton
                asChild
                className={`rounded-full py-6 px-4 border transition-all ${
                  isRequestActive
                    ? "bg-gray-100 border-gray-300 !text-[#373d48] hover:!bg-gray-100"
                    : "border-gray-200 !text-[#373d48] hover:bg-gray-50"
                }`}
              >
                <Link
                  href="/dashboard/request-money"
                  className="flex items-center gap-3"
                >
                  <div className="bg-orange-50 p-1.5 rounded-full text-orange-600">
                    <ArrowDownLeft className="h-4 w-4" />
                  </div>
                  <span className="font-bold text-[14px]">Request</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>

        <div className="h-px bg-gray-100 mb-6 mx-2" />

        {/* Regular Nav Items */}
        <SidebarMenu className="gap-1">
          {customerNavItems
            .filter((item) => item.title !== "Settings")
            .map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    className={`rounded-full py-5 px-4 transition-all duration-200 group ${
                      isActive
                        ? "bg-[#e2f3e8] !text-[#1b4b36] hover:bg-[#e2f3e8] hover:!text-[#1b4b36]"
                        : "bg-transparent !text-[#373d48] hover:bg-gray-100 hover:!text-[#373d48]"
                    }`}
                  >
                    <Link href={item.href} className="flex items-center gap-3">
                      <item.icon
                        className={`h-5 w-5 transition-colors ${
                          isActive
                            ? "text-[#25d366]"
                            : "text-gray-400 group-hover:text-[#373d48]"
                        }`}
                      />
                      <span className="font-bold text-[14px]">
                        {item.title}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="px-4 pb-10 bg-white">
        <SidebarMenu className="gap-1">
          {/* Settings Button */}
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className={`rounded-full py-5 px-4 transition-all duration-200 group ${
                isSettingsActive
                  ? "bg-[#e2f3e8] !text-[#1b4b36] hover:bg-[#e2f3e8] hover:!text-[#1b4b36]"
                  : "bg-transparent !text-[#373d48] hover:bg-gray-100 hover:!text-[#373d48]"
              }`}
            >
              <Link
                href="/dashboard/settings"
                className="flex items-center gap-3"
              >
                <Settings
                  className={`h-5 w-5 transition-colors ${
                    isSettingsActive
                      ? "text-[#25d366]"
                      : "text-gray-400 group-hover:text-[#373d48]"
                  }`}
                />
                <span className="font-bold text-[14px]">Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Logout Button */}
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={logout}
              disabled={isLoggingOut}
              className="rounded-full py-5 px-4 !text-[#373d48] hover:bg-gray-100 hover:!text-[#373d48] transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-3">
                {isLoggingOut ? (
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                ) : (
                  <LogOut className="h-5 w-5 text-gray-400 group-hover:text-[#373d48]" />
                )}
                <span className="font-bold text-[14px]">
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
