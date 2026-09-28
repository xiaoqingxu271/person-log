import Link from 'next/link'
import { listTagsWithCount } from '@/lib/posts'

export const dynamic = 'force-dynamic'

export const metadata = { title: '标签' }

export default async function TagsPage() {
  const tags = await listTagsWithCount()

  return (
    <div>
      <h1 className="text-2xl font-bold">标签</h1>
      {tags.length === 0 ? (
        <p className="mt-6 text-neutral-500">还没有标签。</p>
      ) : (
        <div className="mt-6 flex flex-wrap gap-3">
          {tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/tags/${encodeURIComponent(tag.slug)}`}
              className="rounded-full border border-neutral-200 px-4 py-1.5 text-sm transition-colors hover:border-neutral-400 dark:border-neutral-700 dark:hover:border-neutral-500"
            >
              {tag.name} <span className="text-neutral-400 dark:text-neutral-500">{tag._count.posts}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
