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

export function Pagination({ current, totalPages, basePath = '/', query }: PaginationProps) {
  if (totalPages <= 1) return null
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  const idle =
    'rounded border border-neutral-200 px-3 py-1 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800'

  return (
    <nav className="flex justify-center gap-2 pt-2 text-sm">
      {current > 1 && (
        <Link href={buildHref(basePath, current - 1, query)} className={idle}>
          上一页
        </Link>
      )}
      {pages.map((page) => (
        <Link
          key={page}
          href={buildHref(basePath, page, query)}
          className={
            page === current
              ? 'rounded bg-neutral-900 px-3 py-1 text-white dark:bg-neutral-100 dark:text-neutral-900'
              : idle
          }
        >
          {page}
        </Link>
      ))}
      {current < totalPages && (
        <Link href={buildHref(basePath, current + 1, query)} className={idle}>
          下一页
        </Link>
      )}
    </nav>
  )
}
