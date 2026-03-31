"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Area,
  AreaChart,
} from "recharts";

import { getLedgerAnalytics } from "@/lib/api/ledgerApi";
import { formatCurrency } from "@/lib/constants";
import { qk } from "@/lib/wallet/useWalletQuery";
import { TrendingUp, TrendingDown, DollarSign, Loader2 } from "lucide-react";

const ANALYTICS_MONTHS = 6;
const ANALYTICS_QUERY_KEY = qk.ledgerAnalytics(ANALYTICS_MONTHS);

const PIE_COLORS = [
  "oklch(0.45 0.18 260)",
  "oklch(0.55 0.20 160)",
  "oklch(0.65 0.16 50)",
  "oklch(0.58 0.22 310)",
  "oklch(0.62 0.18 30)",
  "oklch(0.50 0.15 200)",
];

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const toAmount = (value?: string) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

const percentageChange = (current: number, previous: number) => {
  if (previous === 0) {
    if (current === 0) return 0;
    return 100;
  }

  return ((current - previous) / Math.abs(previous)) * 100;
};

const formatTrend = (value: number) =>
  `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;

export default function AnalyticsPage() {
  const {
    data: analytics,
    isLoading,
    isError,
    isFetching,
  } = useQuery({
    queryKey: ANALYTICS_QUERY_KEY,
    queryFn: () => getLedgerAnalytics(ANALYTICS_MONTHS),
    staleTime: 1000 * 15,
    refetchInterval: 1000 * 30,
  });

  const monthlyData = useMemo(
    () =>
      (analytics?.monthly ?? []).map((item) => ({
        month: item.month,
        income: toAmount(item.income),
        expense: toAmount(item.expense),
        net: toAmount(item.net),
      })),
    [analytics],
  );

  const spendingCategories = useMemo(
    () =>
      (analytics?.categories ?? []).map((item) => ({
        name: item.name,
        amount: toAmount(item.amount),
        percentage: item.percentage,
        transactionCount: item.transactionCount,
      })),
    [analytics],
  );

  const totalSpending = toAmount(analytics?.summary.totalSpending);
  const totalIncome = toAmount(analytics?.summary.totalIncome);
  const totalExpenses = toAmount(analytics?.summary.totalExpenses);
  const netFlow = toAmount(analytics?.summary.netFlow);

  const lastMonth = monthlyData[monthlyData.length - 1];
  const previousMonth = monthlyData[monthlyData.length - 2];
  const incomeTrend = percentageChange(
    lastMonth?.income ?? 0,
    previousMonth?.income ?? 0,
  );
  const expenseTrend = percentageChange(
    lastMonth?.expense ?? 0,
    previousMonth?.expense ?? 0,
  );
  const netFlowTrend = totalIncome > 0 ? (netFlow / totalIncome) * 100 : 0;

  const stats = [
    {
      label: "6-Month Income",
      value: formatCurrency(totalIncome),
      icon: TrendingUp,
      trend: formatTrend(incomeTrend),
      trendUp: incomeTrend >= 0,
    },
    {
      label: "Total Spending",
      value: formatCurrency(totalExpenses),
      icon: TrendingDown,
      trend: formatTrend(expenseTrend),
      trendUp: expenseTrend <= 0,
    },
    {
      label: "Net Flow",
      value: formatCurrency(netFlow),
      icon: DollarSign,
      trend: formatTrend(netFlowTrend),
      trendUp: netFlow >= 0,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading analytics...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-3xl rounded-xl border border-destructive/40 bg-destructive/5 p-5">
        <h2 className="text-lg font-semibold text-foreground">
          Unable to load analytics
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Please refresh the page or try again in a moment.
        </p>
      </div>
    );
  }

  return (
    <motion.div className="mx-auto max-w-6xl" {...fadeUp}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Track your spending and income trends
          {isFetching ? " (updating...)" : ""}
        </p>
      </div>

      <motion.div
        className="mb-6 grid gap-4 sm:grid-cols-3"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        {stats.map((s) => (
          <motion.div key={s.label} variants={item}>
            <Card className="border-border/40 bg-card glow-card">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    {s.label}
                  </p>
                  <p className="mt-0.5 text-xl font-bold text-foreground">
                    {s.value}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    s.trendUp
                      ? "bg-primary/10 text-primary"
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {s.trend}
                </span>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Income vs Expense bar chart */}
        <motion.div {...fadeUp} transition={{ delay: 0.1 }}>
          <Card className="border-border/40 bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Income vs Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
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
            </CardContent>
          </Card>
        </motion.div>

        {/* Spending by category pie chart */}
        <motion.div {...fadeUp} transition={{ delay: 0.2 }}>
          <Card className="border-border/40 bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Spending by Category</CardTitle>
            </CardHeader>
            <CardContent>
              {spendingCategories.length === 0 || totalSpending <= 0 ? (
                <div className="flex h-72 items-center justify-center text-sm text-muted-foreground">
                  No expense data available yet.
                </div>
              ) : (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={spendingCategories}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        dataKey="amount"
                        nameKey="name"
                        paddingAngle={3}
                        strokeWidth={0}
                      >
                        {spendingCategories.map((_, i) => (
                          <Cell
                            key={i}
                            fill={PIE_COLORS[i % PIE_COLORS.length]}
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
        </motion.div>

        {/* Trend area chart */}
        <motion.div
          {...fadeUp}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card className="border-border/40 bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Monthly Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient
                        id="incomeGrad"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
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
                      <linearGradient
                        id="expenseGrad"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
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
                      fill="url(#incomeGrad)"
                      strokeWidth={2}
                      dot={{ r: 4, fill: "oklch(0.45 0.18 260)" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="expense"
                      name="Expense"
                      stroke="oklch(0.55 0.20 160)"
                      fill="url(#expenseGrad)"
                      strokeWidth={2}
                      dot={{ r: 4, fill: "oklch(0.55 0.20 160)" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
