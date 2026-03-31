export default function DashboardSkeleton() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <div className="hidden w-64 flex-col border-r bg-muted/10 lg:flex">
        <div className="flex h-14 items-center border-b px-6">
          <div className="h-6 w-24 animate-pulse rounded bg-muted" />
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-10 w-full animate-pulse rounded-md bg-muted"
            />
          ))}
        </div>
      </div>
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/10 px-6">
          <div className="h-8 w-8 animate-pulse rounded-full bg-muted lg:hidden" />
          <div className="ml-auto h-8 w-8 animate-pulse rounded-full bg-muted" />
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-xl border bg-card text-card-foreground shadow-sm"
              />
            ))}
          </div>
          <div className="flex-1 animate-pulse rounded-xl border bg-card text-card-foreground shadow-sm" />
        </main>
      </div>
    </div>
  );
}
