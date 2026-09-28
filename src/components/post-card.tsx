import Link from 'next/link'
import { formatDate } from '@/lib/format'

interface PostCardProps {
  title: string
  slug: string
  summary: string
  publishedAt: Date | null
  isPinned: boolean
  categoryName?: string | null
  categorySlug?: string | null
  tags: { name: string; slug: string }[]
}

export function PostCard({
  title,
  slug,
  summary,
  publishedAt,
  isPinned,
  categoryName,
  categorySlug,
  tags,
}: PostCardProps) {
  return (
    <article className="border-b border-neutral-100 pb-6 dark:border-neutral-800">
      <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
        {isPinned && <span className="font-medium text-red-600 dark:text-red-500">置顶</span>}
        {publishedAt && <time dateTime={publishedAt.toISOString()}>{formatDate(publishedAt)}</time>}
        {categoryName && categorySlug && (
          <Link
            href={`/categories/${encodeURIComponent(categorySlug)}`}
            className="transition-colors hover:text-neutral-800 dark:hover:text-neutral-200"
          >
            {categoryName}
          </Link>
        )}
      </div>
      <h2 className="mt-1.5 text-xl font-semibold">
        <Link href={`/posts/${slug}`} className="hover:underline">
          {title}
        </Link>
      </h2>
      {summary && (
        <p className="mt-2 line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400">{summary}</p>
      )}
      {tags.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Link
              key={tag.slug}
              href={`/tags/${encodeURIComponent(tag.slug)}`}
              className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-500 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
            >
              #{tag.name}
            </Link>
          ))}
        </div>
      )}
    </article>
  )
}
