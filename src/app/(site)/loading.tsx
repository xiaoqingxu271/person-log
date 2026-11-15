/** 路由切换时的玻璃骨架屏（极光主题） */
export default function SiteLoading() {
  return (
    <div className="mx-auto w-full max-w-4xl px-3 py-8 sm:px-4 sm:py-10">
      <div className="glass-panel rounded-3xl p-5 sm:p-9">
        <div className="skeleton-shimmer h-5 w-24 rounded-full" />
        <div className="skeleton-shimmer mt-4 h-9 w-2/3 rounded-xl" />
        <div className="skeleton-shimmer mt-3 h-4 w-1/2 rounded-full" />
        <div className="mt-8 space-y-5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="glass-chip flex flex-col gap-4 rounded-2xl p-4 sm:flex-row">
              <div className="skeleton-shimmer aspect-[16/9] w-full shrink-0 rounded-xl sm:aspect-[4/3] sm:w-[218px]" />
              <div className="flex-1 space-y-3 py-1">
                <div className="skeleton-shimmer h-4 w-2/5 rounded-full" />
                <div className="skeleton-shimmer h-6 w-4/5 rounded-lg" />
                <div className="skeleton-shimmer h-4 w-full rounded-full" />
                <div className="skeleton-shimmer h-4 w-3/5 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}