import Link from 'next/link'
import Image from 'next/image'
import { formatDate, formatCount } from '@/lib/format'
import { ArrowRightIcon, CalendarIcon, EyeIcon, HeartIcon } from '@/components/icons'

export interface PostCardProps {
  title: string
  slug: string
  summary: string
  coverUrl: string
  publishedAt: Date | null
  isPinned: boolean
  categoryName?: string | null
  categorySlug?: string | null
  tags: { name: string; slug: string }[]
  views: number
  likes: number
}

/** 文章列表项：左图右文的横向玻璃卡片（极光主题） */
export function PostCard({
  title,
  slug,
  summary,
  coverUrl,
  publishedAt,
  isPinned,
  categoryName,
  categorySlug,
  tags,
  views,
  likes,
}: PostCardProps) {
  const cover = coverUrl || '/images/aurora-lake.jpg'

  return (
    <article className="glass-panel group rounded-2xl p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-ice-400/30 hover:shadow-[0_14px_44px_rgba(14,165,233,0.16)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:gap-5">
        <Link
          href={`/posts/${slug}`}
          className="relative block aspect-[16/9] w-full shrink-0 overflow-hidden rounded-xl sm:aspect-[4/3] sm:w-[218px]"
          aria-label={title}
        >
          <Image
            src={cover}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, 218px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
          />
        </Link>

        <div className="flex min-w-0 flex-1 flex-col py-0.5">
          <div className="flex flex-wrap items-center gap-2">
            {isPinned && (
              <span className="rounded-full border border-flare-400/30 bg-flare-400/15 px-2.5 py-0.5 text-[11px] font-medium text-flare-300">
                置顶
              </span>
            )}
            {categoryName && categorySlug && (
              <Link
                href={`/categories/${encodeURIComponent(categorySlug)}`}
                className="rounded-full border border-ice-400/25 bg-ice-400/12 px-2.5 py-0.5 text-[11px] text-ice-300 transition-colors hover:bg-ice-400/20"
              >
                {categoryName}
              </Link>
            )}
            {tags.slice(0, 3).map((tag) => (
              <Link
                key={tag.slug}
                href={`/tags/${encodeURIComponent(tag.slug)}`}
                className="glass-chip rounded-full px-2.5 py-0.5 text-[11px] text-slate-300 transition-colors hover:border-nebula-400/40 hover:text-nebula-300"
              >
                {tag.name}
              </Link>
            ))}
          </div>

          <h2 className="mt-2.5 line-clamp-2 text-lg font-bold leading-snug tracking-tight text-white transition-colors group-hover:text-aurora-300">
            <Link href={`/posts/${slug}`}>{title}</Link>
          </h2>

          {summary && (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-400">{summary}</p>
          )}

          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3.5 text-xs text-slate-500">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
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
              <span className="inline-flex items-center gap-1.5">
                <HeartIcon className="h-3.5 w-3.5" />
                {likes}
              </span>
            </div>
            <Link
              href={`/posts/${slug}`}
              className="inline-flex items-center gap-1 font-medium text-slate-400 transition-colors group-hover:text-ice-300"
            >
              阅读全文
              <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}