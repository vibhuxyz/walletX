"use client";

import { User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function getInitials(name?: string): string {
  if (!name) return "";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

interface TxAvatarProps {
  name?: string;
  avatarUrl?: string;
  size?: "sm" | "md";
  isIncome?: boolean;
  status?: "SUCCESS" | "FAILED" | "PENDING";
}

export function TxAvatar({
  name,
  avatarUrl,
  size = "md",
  isIncome = false,
  status = "SUCCESS",
}: TxAvatarProps) {
  const dim = size === "sm" ? "h-9 w-9" : "h-11 w-11";
  const initials = getInitials(name);

  // Determine colors based on status
  const getStatusColors = () => {
    if (status === "FAILED") {
      return {
        bg: "bg-red-50",
        text: "text-red-600",
      };
    }
    if (status === "PENDING") {
      return {
        bg: "bg-yellow-50",
        text: "text-yellow-600",
      };
    }
    // SUCCESS
    if (isIncome) {
      return {
        bg: "bg-primary/10",
        text: "text-primary",
      };
    }
    return {
      bg: "bg-secondary",
      text: "text-muted-foreground",
    };
  };

  const colors = getStatusColors();

  return (
    <Avatar className={`${dim} shrink-0`}>
      {avatarUrl && <AvatarImage src={avatarUrl} alt={name ?? "user"} />}

      <AvatarFallback
        className={
          initials
            ? `${colors.bg} ${colors.text} text-xs font-semibold`
            : `${colors.bg} ${colors.text}`
        }
      >
        {initials ? (
          initials
        ) : (
          <User className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
        )}
      </AvatarFallback>
    </Avatar>
  );
}
