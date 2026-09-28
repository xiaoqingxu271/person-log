import Link from 'next/link'
import Image from 'next/image'
import { formatDate } from '@/lib/format'
import { ArrowRightIcon, CalendarIcon, EyeIcon, FolderIcon, HeartIcon, MessageIcon } from '@/components/icons'

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
  commentCount: number
}

/** 文章列表项：大卡片内的分隔线式条目（参考杂志排版） */
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
  commentCount,
}: PostCardProps) {
  const meta = [
    publishedAt && {
      key: 'date',
      icon: <CalendarIcon className="h-3.5 w-3.5" />,
      node: <time dateTime={publishedAt.toISOString()}>{formatDate(publishedAt)}</time>,
    },
    categoryName &&
      categorySlug && {
        key: 'category',
        icon: <FolderIcon className="h-3.5 w-3.5" />,
        node: (
          <Link
            href={`/categories/${encodeURIComponent(categorySlug)}`}
            className="transition-colors hover:text-orange-600 dark:hover:text-orange-400"
          >
            {categoryName}
          </Link>
        ),
      },
    { key: 'views', icon: <EyeIcon className="h-3.5 w-3.5" />, node: <span>{views} 阅读</span> },
    { key: 'comments', icon: <MessageIcon className="h-3.5 w-3.5" />, node: <span>{commentCount} 评论</span> },
    { key: 'likes', icon: <HeartIcon className="h-3.5 w-3.5" />, node: <span>{likes} 赞</span> },
  ].filter(Boolean) as { key: string; icon: React.ReactNode; node: React.ReactNode }[]

  return (
    <article className="group py-8 first:pt-0 last:pb-0">
      {coverUrl && (
        <Link href={`/posts/${slug}`} className="mb-5 block">
          <span className="relative block aspect-[21/9] overflow-hidden rounded-2xl">
            <Image
              src={coverUrl}
              alt={title}
              fill
              sizes="(max-width: 896px) 100vw, 832px"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
          </span>
        </Link>
      )}
      <div className="flex items-center gap-2 text-xs text-stone-400 dark:text-stone-500">
        {isPinned && (
          <span className="rounded-full bg-red-50 px-2 py-0.5 font-medium text-red-600 dark:bg-red-950 dark:text-red-400">
            置顶
          </span>
        )}
        {tags.slice(0, 3).map((tag) => (
          <Link
            key={tag.slug}
            href={`/tags/${encodeURIComponent(tag.slug)}`}
            className="transition-colors hover:text-orange-600 dark:hover:text-orange-400"
          >
            #{tag.name}
          </Link>
        ))}
      </div>
      <h2 className="mt-2 text-xl font-bold tracking-tight text-stone-900 transition-colors group-hover:text-orange-600 dark:text-white dark:group-hover:text-orange-400 sm:text-2xl">
        <Link href={`/posts/${slug}`}>{title}</Link>
      </h2>
      {summary && (
        <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-stone-500 dark:text-stone-400">
          {summary}
        </p>
      )}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-400 dark:text-stone-500">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          {meta.map((item, index) => (
            <span key={item.key} className="inline-flex items-center gap-1.5">
              {index > 0 && <span className="mr-1 h-0.5 w-0.5 rounded-full bg-stone-300 dark:bg-stone-600" />}
              {item.icon}
              {item.node}
            </span>
          ))}
        </div>
        <Link
          href={`/posts/${slug}`}
          className="inline-flex items-center gap-1 font-medium text-stone-500 transition-colors group-hover:text-orange-600 dark:text-stone-400 dark:group-hover:text-orange-400"
        >
          阅读全文
          <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </article>
  )
}
