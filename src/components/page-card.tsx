/**
 * 浮层内容卡片：全站统一的「浮起的大圆角卡片」容器，
 * 参考杂志式布局，让内容与页面背景形成层次。
 */
export function PageCard({
  children,
  wide = false,
  className = '',
}: {
  children: React.ReactNode
  wide?: boolean
  className?: string
}) {
  return (
    <div className={`mx-auto w-full ${wide ? 'max-w-5xl' : 'max-w-4xl'} px-4`}>
      <div
        className={
          'relative z-10 rounded-3xl border border-stone-200/70 bg-white p-6 shadow-xl shadow-stone-900/[0.06] sm:p-10 ' +
          'dark:border-stone-800 dark:bg-stone-900 dark:shadow-black/30 ' +
          className
        }
      >
        {children}
      </div>
    </div>
  )
}

/** 内容区页头：小标签 + 大标题 + 可选说明 */
export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string
  title: React.ReactNode
  description?: React.ReactNode
}) {
  return (
    <header className="mb-8 border-b border-stone-100 pb-6 dark:border-stone-800">
      {eyebrow && (
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-orange-500 dark:text-orange-400">
          {eyebrow}
        </p>
      )}
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-stone-900 dark:text-white sm:text-3xl">
        {title}
      </h1>
      {description && (
        <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">{description}</p>
      )}
    </header>
  )
}
