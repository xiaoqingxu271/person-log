/** 全站统一的玻璃浮层容器（极光主题） */
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
    <div className={`mx-auto w-full ${wide ? 'max-w-5xl' : 'max-w-4xl'} px-3 sm:px-4`}>
      <div
        className={
          'glass-panel animate-fade-up relative z-10 rounded-3xl p-5 sm:p-9 ' + className
        }
      >
        {children}
      </div>
    </div>
  )
}

/** 内容区页头：手写体眉标 + 大标题 + 可选说明 */
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
    <header className="mb-8 border-b border-white/10 pb-6">
      {eyebrow && (
        <p className="font-script aurora-text text-xl leading-none">{eyebrow}</p>
      )}
      <h1 className="text-glow mt-2.5 flex items-center gap-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
        {title}
      </h1>
      {description && (
        <p className="mt-2.5 text-sm text-slate-400">{description}</p>
      )}
    </header>
  )
}