import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function DashboardWidgetSkeleton({
  className = "",
}: {
  className?: string;
}) {
  return (
    <Card className={`border-border/30 bg-card ${className}`.trim()}>
      <CardHeader className="pb-3">
        <Skeleton className="h-5 w-36" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-4 w-20" />
      </CardContent>
    </Card>
  );
}

export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <Skeleton className="h-7 w-24 rounded-full" />
      </div>

      <div className="mb-6">
        <DashboardWidgetSkeleton />
      </div>

      <div className="mt-6 flex flex-col gap-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="border-border/30 bg-card">
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-9 w-24" />
                </div>
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent className="space-y-5">
                <Skeleton className="h-16 w-full" />
                <div className="grid gap-4 sm:grid-cols-3">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <DashboardWidgetSkeleton />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <DashboardWidgetSkeleton />
          </div>
          <div className="lg:col-span-3">
            <Card className="border-border/30 bg-card">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 rounded-xl px-2 py-3"
                    >
                      <Skeleton className="h-11 w-11 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <div className="space-y-2 text-right">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
