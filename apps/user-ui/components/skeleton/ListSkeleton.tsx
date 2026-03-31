export default function ListSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {[1, 2].map((g) => (
        <div key={g}>
          <div className="mb-3 h-4 w-36 rounded skeleton-shimmer" />
          <div className="flex flex-col gap-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 rounded-xl p-4">
                <div className="h-11 w-11 rounded-full skeleton-shimmer" />
                <div className="flex-1">
                  <div className="h-4 w-32 rounded skeleton-shimmer" />
                  <div className="mt-2 h-3 w-20 rounded skeleton-shimmer" />
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="h-4 w-20 rounded skeleton-shimmer" />
                  <div className="h-3 w-14 rounded skeleton-shimmer" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
