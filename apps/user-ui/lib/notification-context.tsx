"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { paymentRequests as initialRequests } from "@/lib/mock-data"
import type { PaymentRequest } from "@/lib/types"

export interface Notification {
  id: string
  type: "payment_request" | "payment_received" | "kyc_update" | "system"
  title: string
  message: string
  read: boolean
  createdAt: string
  paymentRequestId?: string
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  addNotification: (n: Omit<Notification, "id" | "read" | "createdAt">) => void
  paymentRequests: PaymentRequest[]
  handlePayRequest: (id: string) => void
  handleDeclineRequest: (id: string) => void
}

const NotificationContext = createContext<NotificationContextType | null>(null)

function requestsToNotifications(requests: PaymentRequest[]): Notification[] {
  return requests
    .filter((r) => r.status === "pending")
    .map((r) => ({
      id: `notif_${r.id}`,
      type: "payment_request" as const,
      title: "Payment Request",
      message: `${r.fromName} requested $${r.amount.toFixed(2)}${r.note ? ` - "${r.note}"` : ""}`,
      read: false,
      createdAt: r.createdAt,
      paymentRequestId: r.id,
    }))
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>(initialRequests)
  const [extraNotifications, setExtraNotifications] = useState<Notification[]>([])

  const paymentNotifications = requestsToNotifications(paymentRequests)
  const notifications = [...paymentNotifications, ...extraNotifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = useCallback((id: string) => {
    setExtraNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }, [])

  const markAllAsRead = useCallback(() => {
    setExtraNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  const removeNotification = useCallback((id: string) => {
    setExtraNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const addNotification = useCallback(
    (n: Omit<Notification, "id" | "read" | "createdAt">) => {
      setExtraNotifications((prev) => [
        {
          ...n,
          id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          read: false,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ])
    },
    []
  )

  const handlePayRequest = useCallback((id: string) => {
    setPaymentRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "paid" as const } : r))
    )
    setExtraNotifications((prev) => [
      {
        id: `notif_paid_${id}`,
        type: "payment_received",
        title: "Payment Sent",
        message: `Payment completed successfully`,
        read: false,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ])
  }, [])

  const handleDeclineRequest = useCallback((id: string) => {
    setPaymentRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "declined" as const } : r))
    )
  }, [])

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        removeNotification,
        addNotification,
        paymentRequests,
        handlePayRequest,
        handleDeclineRequest,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider")
  return ctx
}
