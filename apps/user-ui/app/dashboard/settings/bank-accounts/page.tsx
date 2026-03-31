"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { fetchLinkedAccounts } from "@/lib/api/bankApi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Star, CheckCircle, Landmark } from "lucide-react";

export default function SettingsBankAccountsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["settings", "linked-accounts"],
    queryFn: fetchLinkedAccounts,
    staleTime: 1000 * 30,
  });

  const accounts = data?.accounts ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {accounts.length} bank account{accounts.length !== 1 ? "s" : ""} linked
          </p>
        </div>
        <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Link href="/dashboard/add-bank-account">
            <Plus className="mr-2 h-4 w-4" />
            Add Bank Account
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <Card className="border-border/50">
          <CardContent className="p-5 text-sm text-muted-foreground">
            Loading linked bank accounts...
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {accounts.map((account) => (
            <Card key={account.linkId} className="border-border/50">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
                  {account.bankName.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground">{account.bankName}</p>
                    {account.isDefault && (
                      <Badge variant="secondary" className="gap-1 text-xs">
                        <Star className="h-3 w-3" />
                        Primary
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {account.accountType} Account {account.accountNumber}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Balance: {account.balance}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {account.status === "ACTIVE" ? (
                    <Badge className="gap-1 bg-success/10 text-success text-xs">
                      <CheckCircle className="h-3 w-3" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      {account.status}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && accounts.length === 0 && (
        <Card className="border-dashed border-border">
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <Landmark className="h-7 w-7 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">No bank accounts linked</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Link a bank account to start sending and receiving money
              </p>
            </div>
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/dashboard/add-bank-account">
                <Plus className="mr-2 h-4 w-4" />
                Add Bank Account
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
