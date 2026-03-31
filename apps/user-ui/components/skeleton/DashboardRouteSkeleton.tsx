import StatsSkeleton from "./StatsSkeleton";
import ListSkeleton from "./ListSkeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface AnalyticsChartCardSkeletonProps {
  title?: string;
  className?: string;
}

export function AnalyticsChartCardSkeleton({
  title = "Loading chart",
  className = "",
}: AnalyticsChartCardSkeletonProps) {
  return (
    <Card className={`border-border/40 bg-card ${className}`.trim()}>
      <CardHeader className="pb-2">
        <div className="space-y-2">
          <p className="text-base font-semibold text-foreground">{title}</p>
          <Skeleton className="h-3 w-28" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-72 rounded-xl border border-border/30 bg-secondary/20 p-4">
          <div className="flex h-full items-end gap-3">
            {[40, 62, 48, 72, 55, 68].map((height, index) => (
              <div key={index} className="flex flex-1 items-end gap-2">
                <Skeleton className={`w-full rounded-t-md`} style={{ height }} />
                <Skeleton
                  className={`w-full rounded-t-md opacity-70`}
                  style={{ height: Math.max(28, height - 14) }}
                />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardRouteSkeleton() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="space-y-3">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <Skeleton className="h-7 w-24 rounded-full" />
      </div>

      <div className="mb-6">
        <Card className="border-border/30 bg-card">
          <CardContent className="flex min-h-28 items-center justify-between gap-4 p-6">
            <div className="space-y-3">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-72 max-w-full" />
            </div>
            <Skeleton className="h-10 w-28 rounded-md" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-border/30 bg-card lg:col-span-2">
          <CardHeader className="pb-3">
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent className="space-y-5">
            <Skeleton className="h-24 w-full rounded-xl" />
            <div className="grid gap-3 sm:grid-cols-3">
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/30 bg-card">
          <CardHeader className="pb-3">
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center justify-between gap-3">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-8 w-16 rounded-md" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <Card className="border-border/30 bg-card lg:col-span-2">
          <CardHeader className="pb-3">
            <Skeleton className="h-5 w-36" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <Skeleton className="h-11 w-11 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-9 w-20 rounded-md" />
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="lg:col-span-3">
          <ListSkeleton />
        </div>
      </div>
    </div>
  );
}

export function AnalyticsRouteSkeleton() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 space-y-3">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>

      <StatsSkeleton />

      <div className="grid gap-6 lg:grid-cols-2">
        <AnalyticsChartCardSkeleton title="Income vs Expenses" />
        <AnalyticsChartCardSkeleton title="Spending by Category" />
        <AnalyticsChartCardSkeleton
          title="Monthly Trend"
          className="lg:col-span-2"
        />
      </div>
    </div>
  );
}

export function TransactionsRouteSkeleton() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>

        <div className="flex gap-2">
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>
      </div>

      <StatsSkeleton />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <Skeleton className="h-10 flex-1 rounded-md" />
        <Skeleton className="h-10 w-full rounded-md sm:w-40" />
        <Skeleton className="h-10 w-full rounded-md sm:w-40" />
      </div>

      <ListSkeleton />
    </div>
  );
}
