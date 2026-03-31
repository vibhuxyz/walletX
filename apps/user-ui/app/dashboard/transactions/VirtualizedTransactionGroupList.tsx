"use client";

import { useMemo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { MessageSquareQuote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TxAvatar } from "@/components/dashboard/tx-avatar";
import type { LedgerEntry } from "@/lib/api/ledgerApi";

type GroupedTransactions = Array<[string, LedgerEntry[]]>;

type VirtualRow =
  | {
      kind: "header";
      key: string;
      date: string;
    }
  | {
      kind: "transaction";
      key: string;
      tx: LedgerEntry;
    };

interface VirtualizedTransactionGroupListProps {
  grouped: GroupedTransactions;
  onSelectTransaction: (transaction: LedgerEntry) => void;
  className?: string;
  heightClassName?: string;
}

function getAmountStyle(tx: LedgerEntry) {
  if (tx.status === "FAILED") {
    return {
      color: "text-red-600",
      prefix: "",
    };
  }

  if (tx.status === "PENDING") {
    return {
      color: "text-yellow-600",
      prefix: "",
    };
  }

  if (tx.isIncoming) {
    return {
      color: "text-green-600",
      prefix: "+",
    };
  }

  return {
    color: "text-foreground",
    prefix: "-",
  };
}

export default function VirtualizedTransactionGroupList({
  grouped,
  onSelectTransaction,
  className = "",
  heightClassName = "h-[70vh]",
}: VirtualizedTransactionGroupListProps) {
  const parentRef = useRef<HTMLDivElement | null>(null);

  const rows = useMemo<VirtualRow[]>(() => {
    const flat: VirtualRow[] = [];

    for (const [date, transactions] of grouped) {
      flat.push({
        kind: "header",
        key: `header-${date}`,
        date,
      });

      for (const tx of transactions) {
        flat.push({
          kind: "transaction",
          key: tx.transactionId,
          tx,
        });
      }
    }

    return flat;
  }, [grouped]);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => (rows[index]?.kind === "header" ? 40 : 92),
    overscan: 8,
    getItemKey: (index) => rows[index]?.key ?? index,
  });

  return (
    <div
      ref={parentRef}
      className={`${heightClassName} overflow-auto pr-1 ${className}`.trim()}
      style={{ contain: "strict" }}
    >
      <div
        className="relative w-full"
        style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const row = rows[virtualRow.index];
          if (!row) return null;

          return (
            <div
              key={row.key}
              className="absolute left-0 top-0 w-full"
              style={{
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {row.kind === "header" ? (
                <div className="mb-2 flex items-center gap-3 py-2">
                  <p className="whitespace-nowrap text-sm font-semibold text-muted-foreground">
                    {row.date}
                  </p>
                  <div className="h-px flex-1 bg-border/40" />
                </div>
              ) : (
                <TransactionRow
                  tx={row.tx}
                  onSelect={() => onSelectTransaction(row.tx)}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TransactionRow({
  tx,
  onSelect,
}: {
  tx: LedgerEntry;
  onSelect: () => void;
}) {
  const amountStyle = getAmountStyle(tx);

  return (
    <button
      type="button"
      onClick={onSelect}
      className="mb-1 flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-left transition-colors hover:bg-secondary/40"
    >
      <TxAvatar
        name={tx.title}
        size="md"
        isIncome={tx.isIncoming}
        status={tx.status}
      />

      <div className="min-w-0 flex-1 overflow-hidden">
        <p className="truncate text-sm font-semibold text-foreground">
          {tx.title}
        </p>

        <div className="mt-0.5 flex flex-col gap-0.5">
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <span className="truncate">{tx.subtitle}</span>
            <span className="hidden text-[10px] opacity-50 sm:inline-block">
              • Ref: {tx.referenceId.slice(-8)}
            </span>
          </p>

          {tx.note && (
            <p className="flex items-center gap-1.5 truncate text-xs italic text-muted-foreground/80">
              <MessageSquareQuote className="h-3 w-3 shrink-0 opacity-50" />
              <span className="truncate">{tx.note}</span>
            </p>
          )}
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1">
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className={`hidden h-5 text-[10px] uppercase sm:inline-flex
              ${tx.status === "SUCCESS" ? "bg-green-500/10 text-green-600 hover:bg-green-500/20" : ""}
              ${tx.status === "PENDING" ? "bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20" : ""}
              ${tx.status === "FAILED" ? "bg-red-500/10 text-red-600 hover:bg-red-500/20" : ""}
            `}
          >
            {tx.status}
          </Badge>

          <p className={`text-sm font-bold ${amountStyle.color}`}>
            {amountStyle.prefix}₹{tx.amount}
          </p>
        </div>

        <p className="text-[10px] text-muted-foreground">Bal: ₹{tx.balanceAfter}</p>
      </div>
    </button>
  );
}
