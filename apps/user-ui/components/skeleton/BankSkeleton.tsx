import { Card, CardContent, CardHeader } from "../ui/card";

export default function BankSkeleton() {
  return (
    <Card className="border-border/30 bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="h-5 w-28 rounded skeleton-shimmer" />
        <div className="h-4 w-12 rounded skeleton-shimmer" />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl p-3">
              <div className="h-10 w-10 rounded-xl skeleton-shimmer" />
              <div className="flex-1">
                <div className="h-4 w-24 rounded skeleton-shimmer" />
                <div className="mt-1.5 h-3 w-32 rounded skeleton-shimmer" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
