"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/constants";

type SpendingCategoryDatum = {
  name: string;
  amount: number;
  percentage: number;
  transactionCount: number;
};

interface SpendingCategoryChartCardProps {
  data: SpendingCategoryDatum[];
  totalSpending: number;
}

const PIE_COLORS = [
  "oklch(0.45 0.18 260)",
  "oklch(0.55 0.20 160)",
  "oklch(0.65 0.16 50)",
  "oklch(0.58 0.22 310)",
  "oklch(0.62 0.18 30)",
  "oklch(0.50 0.15 200)",
];

export function SpendingCategoryChartCard({
  data,
  totalSpending,
}: SpendingCategoryChartCardProps) {
  const hasData = data.length > 0 && totalSpending > 0;

  return (
    <Card className="border-border/40 bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Spending by Category</CardTitle>
      </CardHeader>

      <CardContent>
        {!hasData ? (
          <div className="flex h-72 items-center justify-center text-sm text-muted-foreground">
            No expense data available yet.
          </div>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  dataKey="amount"
                  nameKey="name"
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {data.map((_, index) => (
                    <Cell
                      key={`category-slice-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>

                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid oklch(0.90 0.005 260)",
                    backgroundColor: "oklch(1.00 0 0)",
                    color: "oklch(0.20 0.02 260)",
                    boxShadow: "0 4px 12px oklch(0.50 0 0 / 0.1)",
                  }}
                />

                <Legend
                  wrapperStyle={{ fontSize: "11px" }}
                  formatter={(value: string) => (
                    <span style={{ color: "oklch(0.45 0.02 260)" }}>
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default SpendingCategoryChartCard;
