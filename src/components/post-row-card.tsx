import Link from 'next/link'
import Image from 'next/image'
import { formatDate, formatCount } from '@/lib/format'
import { CalendarIcon, EyeIcon } from '@/components/icons'
import { MountainLine } from '@/components/mountain-line'

export interface PostRowProps {
  title: string
  slug: string
  summary: string
  coverUrl: string
  publishedAt: Date | null
  tags: { name: string; slug: string }[]
  views: number
}

/** 横向文章玻璃卡：左封面 + 标题摘要 + 日期/标签/阅读 + 右侧雪山装饰 */
export function PostRowCard({ title, slug, summary, coverUrl, publishedAt, tags, views }: PostRowProps) {
  return (
    <article className="glass-panel group relative overflow-hidden rounded-2xl p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-ice-400/30 hover:shadow-[0_14px_40px_rgba(14,165,233,0.16)]">
      <div className="flex gap-4">
        <Link
          href={`/posts/${slug}`}
          className="relative block h-24 w-36 shrink-0 overflow-hidden rounded-xl border border-white/10 sm:h-28 sm:w-44"
          aria-label={title}
        >
          <Image
            src={coverUrl || '/images/aurora-lake.jpg'}
            alt={title}
            fill
            sizes="(max-width: 640px) 144px, 176px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-1 text-base font-bold text-white transition-colors group-hover:text-aurora-300 sm:text-lg">
            <Link href={`/posts/${slug}`}>{title}</Link>
          </h3>
          {summary && (
            <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-slate-400">{summary}</p>
          )}
          <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
            {publishedAt && (
              <span className="inline-flex items-center gap-1.5">
                <CalendarIcon className="h-3.5 w-3.5" />
                <time dateTime={publishedAt.toISOString()}>{formatDate(publishedAt)}</time>
              </span>
            )}
            {tags.slice(0, 3).map((tag) => (
              <Link
                key={tag.slug}
                href={`/tags/${encodeURIComponent(tag.slug)}`}
                className="glass-chip rounded-full px-2 py-0.5 text-[11px] text-slate-300 transition-colors hover:border-nebula-400/40 hover:text-nebula-300"
              >
                {tag.name}
              </Link>
            ))}
            <span className="inline-flex items-center gap-1.5">
              <EyeIcon className="h-3.5 w-3.5" />
              {formatCount(views)}
            </span>
          </div>
        </div>
        <MountainLine className="hidden h-14 w-28 shrink-0 self-center opacity-70 transition-opacity group-hover:opacity-100 md:block" />
      </div>
    </article>
  )
}