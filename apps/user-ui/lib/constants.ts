import {
  LayoutDashboard,
  ArrowUpDown,
  BarChart3,
  Settings,
  Send,
  Landmark,
  Plus,
  ArrowDownToLine,
  Users,
  ShieldCheck,
  QrCode,
  CreditCard,
  DollarSign,
  KeyRound,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

export const customerNavItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Transactions", href: "/dashboard/transactions", icon: ArrowUpDown },
  { title: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { title: "Settings", href: "/dashboard/settings", icon: Settings },
];

export const customerQuickActions: NavItem[] = [
  { title: "Send Money", href: "/dashboard/send-money", icon: Send },
  { title: "Add Bank", href: "/dashboard/add-bank-account", icon: Plus },
  { title: "Top Up", href: "/dashboard/top-up", icon: ArrowDownToLine },
  { title: "Request", href: "/dashboard/request-money", icon: DollarSign },
];

export const merchantNavItems: NavItem[] = [
  { title: "Dashboard", href: "/merchant/dashboard", icon: LayoutDashboard },
  { title: "Payments", href: "/merchant/payments", icon: CreditCard },
  { title: "Settlements", href: "/merchant/settlements", icon: Landmark },
  { title: "QR Code", href: "/merchant/qr-code", icon: QrCode },
  { title: "Settings", href: "/merchant/settings", icon: Settings },
];

export const adminNavItems: NavItem[] = [
  { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Connect", href: "/admin/connect/partners", icon: KeyRound },
  { title: "Approvals", href: "/admin/approvals", icon: ShieldCheck },
  { title: "Users", href: "/admin/users", icon: Users },
  { title: "Settings", href: "/admin/settings", icon: Settings },
];

export const settingsNavItems: NavItem[] = [
  { title: "General", href: "/dashboard/settings", icon: Settings },
  {
    title: "Security",
    href: "/dashboard/settings/security",
    icon: ShieldCheck,
  },
  {
    title: "Bank Accounts",
    href: "/dashboard/settings/bank-accounts",
    icon: Landmark,
  },
];

export const transactionStatusColors: Record<string, string> = {
  completed: "bg-success/10 text-success",
  pending: "bg-warning/10 text-warning-foreground",
  failed: "bg-destructive/10 text-destructive",
};

export const transactionTypeLabels: Record<string, string> = {
  send: "Sent",
  receive: "Received",
  top_up: "Top Up",
  withdrawal: "Withdrawal",
};

export const categoryIcons: Record<string, string> = {
  Transfer: "ArrowUpDown",
  Shopping: "ShoppingBag",
  Rent: "Home",
  Entertainment: "Film",
  "Food & Dining": "UtensilsCrossed",
  Utilities: "Zap",
  Salary: "Briefcase",
  "Top Up": "ArrowDownToLine",
  Withdrawal: "ArrowUpFromLine",
  "Health & Fitness": "Heart",
};

export function formatCurrency(amount: number, currency = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateInput: string | Date | number): string {
  return new Date(dateInput).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(dateInput: string | Date | number): string {
  return new Date(dateInput).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
