import { Card, CardContent } from "../ui/card";

export default function StatsSkeleton() {
  return (
    <div className="mb-6 grid gap-3 sm:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="border-border/30 bg-card">
          <CardContent className="p-5">
            <div className="h-3 w-24 rounded skeleton-shimmer" />
            <div className="mt-3 h-7 w-28 rounded skeleton-shimmer" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
