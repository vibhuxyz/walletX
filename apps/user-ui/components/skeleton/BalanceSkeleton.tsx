export default function BalanceSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#172054] via-[#2d2165] to-[#592686] p-6 md:p-8">
      <div className="flex flex-col gap-4">
        <div className="h-4 w-28 rounded-lg bg-white/10 animate-pulse" />
        <div className="h-12 w-56 rounded-lg bg-white/10 animate-pulse" />
        <div className="h-3 w-20 rounded bg-white/10 animate-pulse" />
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="h-20 rounded-xl bg-white/10 animate-pulse" />
          <div className="h-20 rounded-xl bg-white/10 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
