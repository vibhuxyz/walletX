"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, Check, DollarSign, X, Info, ShieldCheck, Ban } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useWalletStore } from "@/lib/store"
import { formatCurrency } from "@/lib/constants"

const typeIcons: Record<string, typeof Bell> = {
  payment_request: DollarSign,
  payment_received: Check,
  payment_declined: Ban,
  kyc_update: ShieldCheck,
  system: Info,
}

const typeColors: Record<string, string> = {
  payment_request: "bg-primary/10 text-primary",
  payment_received: "bg-success/10 text-success",
  payment_declined: "bg-destructive/10 text-destructive",
  kyc_update: "bg-chart-2/10 text-chart-2",
  system: "bg-muted text-muted-foreground",
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const notifications = useWalletStore((s) => s.notifications)
  const paymentRequests = useWalletStore((s) => s.paymentRequests)
  const unreadCount = useWalletStore((s) => s.unreadCount)()
  const markAllAsRead = useWalletStore((s) => s.markAllAsRead)
  const payRequest = useWalletStore((s) => s.payRequest)
  const declineRequest = useWalletStore((s) => s.declineRequest)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const pendingRequests = paymentRequests.filter((r) => r.status === "pending")

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        aria-label="Notifications"
      >
        <Bell className="h-4.5 w-4.5" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-border bg-card shadow-lg sm:w-96"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
                {unreadCount > 0 && (
                  <Badge className="h-5 bg-primary/10 text-primary border-0 text-[10px]">
                    {unreadCount}
                  </Badge>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs font-medium text-primary hover:text-primary/80"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Pending Payment Requests */}
            {pendingRequests.length > 0 && (
              <div className="border-b border-border">
                <div className="px-4 pb-1 pt-3">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Payment Requests
                  </p>
                </div>
                <div className="max-h-52 overflow-y-auto">
                  {pendingRequests.map((req) => (
                    <motion.div
                      key={req.id}
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-secondary/30"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <DollarSign className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-foreground">{req.fromName}</p>
                        <p className="text-sm font-bold text-primary">{formatCurrency(req.amount)}</p>
                        {req.note && (
                          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{req.note}</p>
                        )}
                        <div className="mt-2 flex gap-1.5">
                          <Button
                            size="sm"
                            onClick={() => payRequest(req.id)}
                            className="h-6 gap-1 bg-primary px-3 text-[10px] text-primary-foreground hover:bg-primary/90"
                          >
                            <Check className="h-3 w-3" /> Pay
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => declineRequest(req.id)}
                            className="h-6 gap-1 border-border/50 px-3 text-[10px] text-muted-foreground hover:border-destructive/30 hover:text-destructive"
                          >
                            <X className="h-3 w-3" /> Decline
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Other Notifications */}
            <div className="max-h-52 overflow-y-auto">
              {notifications.filter((n) => n.type !== "payment_request").length === 0 &&
                pendingRequests.length === 0 && (
                  <div className="flex flex-col items-center gap-2 py-8 text-center">
                    <Bell className="h-6 w-6 text-muted-foreground/30" />
                    <p className="text-xs text-muted-foreground">No notifications</p>
                  </div>
                )}
              {notifications
                .filter((n) => n.type !== "payment_request")
                .slice(0, 8)
                .map((notif) => {
                  const Icon = typeIcons[notif.type] || Info
                  const color = typeColors[notif.type] || "bg-muted text-muted-foreground"
                  return (
                    <div
                      key={notif.id}
                      className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-secondary/30 ${
                        !notif.read ? "bg-primary/3" : ""
                      }`}
                    >
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-foreground">{notif.title}</p>
                        <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{notif.message}</p>
                      </div>
                      {!notif.read && <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                    </div>
                  )
                })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
