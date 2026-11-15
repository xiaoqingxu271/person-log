import Link from 'next/link'
import Image from 'next/image'
import { formatDate, formatCount } from '@/lib/format'
import { CalendarIcon, EyeIcon } from '@/components/icons'

export interface PostGridProps {
  title: string
  slug: string
  summary: string
  coverUrl: string
  publishedAt: Date | null
  categoryName?: string | null
  categorySlug?: string | null
  views: number
}

/** 搜索页双列玻璃卡：左方形封面 + 分类胶囊 + 标题 + 三行摘要 + 日期/阅读 */
export function PostGridCard({
  title,
  slug,
  summary,
  coverUrl,
  publishedAt,
  categoryName,
  categorySlug,
  views,
}: PostGridProps) {
  return (
    <article className="glass-panel group flex gap-4 rounded-2xl p-4 transition-all duration-300 hover:-translate-y-1 hover:border-nebula-400/35 hover:shadow-[0_16px_44px_rgba(139,92,246,0.2)]">
      <Link
        href={`/posts/${slug}`}
        className="relative block h-32 w-28 shrink-0 overflow-hidden rounded-xl border border-white/10 sm:h-36 sm:w-32"
        aria-label={title}
      >
        <Image
          src={coverUrl || '/images/aurora-lake.jpg'}
          alt={title}
          fill
          sizes="(max-width: 640px) 112px, 128px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        {categoryName && categorySlug && (
          <Link
            href={`/categories/${encodeURIComponent(categorySlug)}`}
            className="self-start rounded-full border border-nebula-400/30 bg-nebula-400/15 px-2.5 py-0.5 text-[11px] text-nebula-200 transition-colors hover:bg-nebula-400/25"
          >
            {categoryName}
          </Link>
        )}
        <h3 className="mt-2 line-clamp-2 text-base font-bold leading-snug text-white transition-colors group-hover:text-aurora-300">
          <Link href={`/posts/${slug}`}>{title}</Link>
        </h3>
        {summary && (
          <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-slate-400">{summary}</p>
        )}
        <div className="mt-auto flex items-center justify-between gap-3 pt-2.5 text-xs text-slate-500">
          {publishedAt && (
            <span className="inline-flex items-center gap-1.5">
              <CalendarIcon className="h-3.5 w-3.5" />
              <time dateTime={publishedAt.toISOString()}>{formatDate(publishedAt)}</time>
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <EyeIcon className="h-3.5 w-3.5" />
            {formatCount(views)}
          </span>
        </div>
      </div>
    </article>
  )
}