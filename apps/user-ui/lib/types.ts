export type KYCStatus = "not_started" | "pending" | "approved" | "rejected"

export type TransactionType = "send" | "receive" | "top_up" | "withdrawal"
export type TransactionStatus = "completed" | "pending" | "failed"
export type AccountType = "savings" | "checking"

export interface User {
  id: string
  name: string
  email: string
  phone: string
  avatar: string
  kycStatus: KYCStatus
  pinSet: boolean
  createdAt: string
}

export interface Wallet {
  id: string
  userId: string
  balance: number
  isActive: boolean
  currency: string
}

export interface BankAccount {
  id: string
  userId: string
  bankName: string
  accountNumber: string
  routingNumber: string
  holderName: string
  accountType: AccountType
  last4: string
  isVerified: boolean
  isPrimary: boolean
  bankLogo: string
}

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  currency: string
  senderEmail: string
  recipientEmail: string
  recipientName: string
  senderName: string
  bankAccountId?: string
  category: string
  status: TransactionStatus
  note?: string
  createdAt: string
  requiresPin: boolean
}

export interface Contact {
  id: string
  name: string
  email: string
  avatar: string
  lastTransactionDate?: string
}

export interface MerchantUser {
  id: string
  businessName: string
  email: string
  status: "active" | "pending" | "suspended"
  totalRevenue: number
  qrCode: string
  createdAt: string
}

export interface AdminApproval {
  id: string
  type: "kyc" | "merchant" | "bank_account" | "large_transfer"
  userName: string
  userEmail: string
  details: string
  status: "pending" | "approved" | "rejected"
  createdAt: string
}

export interface PaymentRequest {
  id: string
  fromName: string
  fromEmail: string
  amount: number
  currency: string
  note?: string
  status: "pending" | "paid" | "declined"
  createdAt: string
}

export interface SpendingCategory {
  name: string
  amount: number
  color: string
  percentage: number
}

export interface MonthlyData {
  month: string
  income: number
  expense: number
}
