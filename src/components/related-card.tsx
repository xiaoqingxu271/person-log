import Link from 'next/link'
import Image from 'next/image'
import { formatDate, formatCount } from '@/lib/format'
import { ArrowRightIcon, EyeIcon } from '@/components/icons'

export interface RelatedItem {
  title: string
  slug: string
  publishedAt: Date | null
  views: number
  coverUrl: string
}

/** 侧栏相关文章 / 推荐阅读：缩略图 + 标题 + 日期 + 阅读量 */
export function RelatedCard({
  title,
  items,
  moreHref,
  showViews = true,
  bookmark = false,
}: {
  title: string
  items: RelatedItem[]
  moreHref?: string
  showViews?: boolean
  bookmark?: boolean
}) {
  if (items.length === 0) return null
  return (
    <section className="glass-panel rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-ice-300" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M2 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H2ZM22 4h-7a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h8Z" />
          </svg>
          {title}
        </h2>
        {bookmark ? (
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        ) : moreHref ? (
          <Link
            href={moreHref}
            className="inline-flex items-center gap-1 text-xs text-slate-400 transition-colors hover:text-ice-300"
          >
            查看更多
            <ArrowRightIcon className="h-3 w-3" />
          </Link>
        ) : null}
      </div>
      <ul className="mt-4 space-y-3.5">
        {items.map((item) => (
          <li key={item.slug}>
            <Link href={`/posts/${item.slug}`} className="group flex items-center gap-3">
              <span className="relative block h-12 w-16 shrink-0 overflow-hidden rounded-lg border border-white/10">
                <Image
                  src={item.coverUrl || '/images/aurora-lake.jpg'}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </span>
              <span className="min-w-0 flex-1">
                <span className="line-clamp-2 text-sm leading-snug text-slate-200 transition-colors group-hover:text-aurora-300">
                  {item.title}
                </span>
                <span className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                  {item.publishedAt && <time dateTime={item.publishedAt.toISOString()}>{formatDate(item.publishedAt)}</time>}
                  {showViews && (
                    <span className="inline-flex items-center gap-1">
                      <EyeIcon className="h-3 w-3" />
                      {formatCount(item.views)}
                    </span>
                  )}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}