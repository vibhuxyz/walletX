import { Card, CardContent, CardHeader } from "../ui/card";

// ── Skeleton ──────────────────────────────────────────────────────────────────
export default function TransactionsSkeleton() {
  return (
    <Card className="border-border/30 bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="h-5 w-36 rounded skeleton-shimmer" />
        <div className="h-4 w-16 rounded skeleton-shimmer" />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg px-2 py-3"
            >
              <div className="h-10 w-10 rounded-full skeleton-shimmer" />
              <div className="flex-1">
                <div className="h-4 w-28 rounded skeleton-shimmer" />
                <div className="mt-1.5 h-3 w-20 rounded skeleton-shimmer" />
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <div className="h-4 w-16 rounded skeleton-shimmer" />
                <div className="h-3 w-14 rounded skeleton-shimmer" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
