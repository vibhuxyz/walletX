"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/constants";

export interface IncomeExpenseChartDatum {
  month: string;
  income: number;
  expense: number;
  net?: number;
}

interface IncomeExpenseChartCardProps {
  data: IncomeExpenseChartDatum[];
}

export function IncomeExpenseChartCard({
  data,
}: IncomeExpenseChartCardProps) {
  return (
    <Card className="border-border/40 bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Income vs Expenses</CardTitle>
      </CardHeader>

      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-72 items-center justify-center text-sm text-muted-foreground">
            No income or expense data available yet.
          </div>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0.90 0.005 260)"
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: "oklch(0.50 0.02 260)" }}
                  axisLine={{ stroke: "oklch(0.88 0.005 260)" }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "oklch(0.50 0.02 260)" }}
                  axisLine={{ stroke: "oklch(0.88 0.005 260)" }}
                />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid oklch(0.90 0.005 260)",
                    backgroundColor: "oklch(1.00 0 0)",
                    color: "oklch(0.20 0.02 260)",
                    boxShadow: "0 4px 12px oklch(0.50 0 0 / 0.1)",
                  }}
                  labelStyle={{ color: "oklch(0.50 0.02 260)" }}
                />
                <Bar
                  dataKey="income"
                  name="Income"
                  fill="oklch(0.45 0.18 260)"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="expense"
                  name="Expense"
                  fill="oklch(0.55 0.20 160)"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
