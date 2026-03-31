"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Send, Plus, ArrowUpFromLine } from "lucide-react";

const actions = [
  {
    title: "Send Money",
    description: "Transfer to anyone",
    href: "/dashboard/send-money",
    icon: Send,
    iconBg: "bg-primary/15",
    iconColor: "text-primary",
  },
  {
    title: "Add Bank",
    description: "Link a new account",
    href: "/dashboard/add-bank-account",
    icon: Plus,
    iconBg: "bg-chart-2/15",
    iconColor: "text-chart-2",
  },

  {
    title: "Withdraw",
    description: "Move to bank",
    href: "/dashboard/withdraw",
    icon: ArrowUpFromLine,
    iconBg: "bg-destructive/15",
    iconColor: "text-destructive",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export function QuickActions() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 gap-3 md:grid-cols-3"
    >
      {actions.map((action) => (
        <motion.div key={action.href} variants={item}>
          <Link
            href={action.href}
            className="group flex flex-col items-center gap-3 rounded-2xl border border-border/40 bg-card p-5 text-center transition-all duration-300 hover:border-primary/30 hover:bg-secondary/50"
          >
            <motion.div
              whileHover={{ scale: 1.15, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className={`flex h-12 w-12 items-center justify-center rounded-2xl ${action.iconBg}`}
            >
              <action.icon className={`h-5 w-5 ${action.iconColor}`} />
            </motion.div>
            <div>
              <span className="text-sm font-semibold text-foreground">
                {action.title}
              </span>
              <span className="mt-0.5 block text-[10px] text-muted-foreground">
                {action.description}
              </span>
            </div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}
