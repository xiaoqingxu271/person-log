import Link from 'next/link'
import { ArrowRightIcon } from '@/components/icons'

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

/** 页码窗口：首尾 + 当前页 ±1，其余折叠为省略号 */
function pageWindow(current: number, totalPages: number): (number | 'gap')[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
  const pages = new Set<number>([1, totalPages, current - 1, current, current + 1])
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b)
  const out: (number | 'gap')[] = []
  let prev = 0
  for (const p of sorted) {
    if (prev && p - prev > 1) out.push('gap')
    out.push(p)
    prev = p
  }
  return out
}

/** 圆形数字分页（激活页极光渐变 + 省略号折叠） */
export function Pagination({ current, totalPages, basePath = '/', query }: PaginationProps) {
  if (totalPages <= 1) return null
  const circle =
    'glass-chip flex h-10 w-10 items-center justify-center rounded-full text-sm text-slate-300 transition-all hover:border-ice-400/40 hover:text-ice-300'

  return (
    <nav className="flex flex-wrap items-center justify-center gap-2.5 pt-8 text-sm" aria-label="分页">
      {current > 1 && (
        <Link href={buildHref(basePath, current - 1, query)} className={circle} aria-label="上一页">
          <ArrowRightIcon className="h-4 w-4 rotate-180" />
        </Link>
      )}
      {pageWindow(current, totalPages).map((page, i) =>
        page === 'gap' ? (
          <span key={`gap-${i}`} className="px-1 text-slate-500">
            …
          </span>
        ) : (
          <Link
            key={page}
            href={buildHref(basePath, page, query)}
            aria-current={page === current ? 'page' : undefined}
            className={
              page === current
                ? 'aurora-btn flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold'
                : circle
            }
          >
            {page}
          </Link>
        ),
      )}
      {current < totalPages && (
        <Link href={buildHref(basePath, current + 1, query)} className={circle} aria-label="下一页">
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      )}
    </nav>
  )
}