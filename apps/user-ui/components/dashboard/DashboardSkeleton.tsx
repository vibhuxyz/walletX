function DashboardSkeleton() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      {/* Fake Header */}
      <div className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
      </div>

      <div className="flex flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        {/* Fake Sidebar (hidden on mobile) */}
        <div className="hidden w-[220px] shrink-0 flex-col gap-2 lg:flex">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-10 w-full animate-pulse rounded-md bg-muted/50"
            />
          ))}
        </div>

        {/* Fake Main Content */}
        <div className="grid flex-1 items-start gap-4 md:gap-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-xl bg-muted/80"
              />
            ))}
          </div>
          <div className="h-[400px] w-full animate-pulse rounded-xl bg-muted/60" />
        </div>
      </div>
    </div>
  );
}
