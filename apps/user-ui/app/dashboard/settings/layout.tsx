"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { settingsNavItems } from "@/lib/constants"
import { cn } from "@/lib/utils"

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account preferences and security
        </p>
      </div>

      <div className="flex gap-2 border-b border-border">
        {settingsNavItems.map((item) => {
          const isActive =
            item.href === "/dashboard/settings"
              ? pathname === "/dashboard/settings"
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          )
        })}
      </div>

      {children}
    </div>
  )
}
