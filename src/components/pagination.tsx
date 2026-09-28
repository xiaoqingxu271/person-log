import Link from 'next/link'

interface PaginationProps {
  current: number
  totalPages: number
  basePath?: string
  /** 附加查询参数（如搜索页的 q），page 会自动覆盖 */
  query?: Record<string, string>
}

function buildHref(basePath: string, page: number, query?: Record<string, string>) {
  const params = new URLSearchParams(query ?? {})
  if (page > 1) params.set('page', String(page))
  const qs = params.toString()
  return qs ? `${basePath}?${qs}` : basePath
}

function pageClass(active: boolean) {
  return active
    ? 'flex h-9 w-9 items-center justify-center rounded-full bg-stone-900 text-white dark:bg-white dark:text-stone-900'
    : 'flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 text-stone-600 transition-colors hover:border-stone-900 hover:text-stone-900 dark:border-stone-700 dark:text-stone-300 dark:hover:border-stone-100 dark:hover:text-white'
}

/** 圆形数字分页 */
export function Pagination({ current, totalPages, basePath = '/', query }: PaginationProps) {
  if (totalPages <= 1) return null
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  const arrow =
    'flex h-9 items-center rounded-full border border-stone-200 px-4 text-sm text-stone-600 transition-colors hover:border-stone-900 hover:text-stone-900 dark:border-stone-700 dark:text-stone-300 dark:hover:border-stone-100 dark:hover:text-white'

  return (
    <nav className="flex flex-wrap items-center justify-center gap-2 pt-6 text-sm">
      {current > 1 && (
        <Link href={buildHref(basePath, current - 1, query)} className={arrow}>
          上一页
        </Link>
      )}
      {pages.map((page) => (
        <Link key={page} href={buildHref(basePath, page, query)} className={pageClass(page === current)}>
          {page}
        </Link>
      ))}
      {current < totalPages && (
        <Link href={buildHref(basePath, current + 1, query)} className={arrow}>
          下一页
        </Link>
      )}
    </nav>
  )
}
