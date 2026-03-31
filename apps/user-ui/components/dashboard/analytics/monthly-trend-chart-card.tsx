"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/constants";

interface MonthlyTrendPoint {
  month: string;
  income: number;
  expense: number;
  net?: number;
}

interface MonthlyTrendChartCardProps {
  data: MonthlyTrendPoint[];
  className?: string;
}

export function MonthlyTrendChartCard({
  data,
  className = "",
}: MonthlyTrendChartCardProps) {
  return (
    <Card className={`border-border/40 bg-card ${className}`.trim()}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Monthly Trend</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
            No trend data available yet.
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="monthly-income-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="oklch(0.45 0.18 260)"
                      stopOpacity={0.2}
                    />
                    <stop
                      offset="100%"
                      stopColor="oklch(0.45 0.18 260)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                  <linearGradient id="monthly-expense-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="oklch(0.55 0.20 160)"
                      stopOpacity={0.2}
                    />
                    <stop
                      offset="100%"
                      stopColor="oklch(0.55 0.20 160)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

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

                <Area
                  type="monotone"
                  dataKey="income"
                  name="Income"
                  stroke="oklch(0.45 0.18 260)"
                  fill="url(#monthly-income-gradient)"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "oklch(0.45 0.18 260)" }}
                />

                <Area
                  type="monotone"
                  dataKey="expense"
                  name="Expense"
                  stroke="oklch(0.55 0.20 160)"
                  fill="url(#monthly-expense-gradient)"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "oklch(0.55 0.20 160)" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default MonthlyTrendChartCard;
