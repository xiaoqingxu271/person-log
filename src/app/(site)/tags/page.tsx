import Link from 'next/link'
import { listTagsWithCount } from '@/lib/posts'
import { PageCard, PageHeader } from '@/components/page-card'
import { TagIcon } from '@/components/icons'

export const dynamic = 'force-dynamic'

export const metadata = { title: '标签' }

export default async function TagsPage() {
  const tags = await listTagsWithCount()

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <PageCard>
        <PageHeader eyebrow="Tags" title="标签" description={`共 ${tags.length} 个标签`} />
        {tags.length === 0 ? (
          <p className="text-stone-500 dark:text-stone-400">还没有标签。</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/tags/${encodeURIComponent(tag.slug)}`}
                className="group inline-flex items-center gap-2 rounded-full border border-stone-200 px-4 py-2 text-sm text-stone-600 transition-all hover:-translate-y-0.5 hover:border-orange-400 hover:text-orange-600 dark:border-stone-700 dark:text-stone-300 dark:hover:border-orange-500 dark:hover:text-orange-400"
              >
                <TagIcon className="h-3.5 w-3.5 text-stone-400 transition-colors group-hover:text-orange-500 dark:group-hover:text-orange-400" />
                {tag.name}
                <span className="text-xs text-stone-400 dark:text-stone-500">{tag._count.posts}</span>
              </Link>
            ))}
          </div>
        )}
      </PageCard>
    </div>
  )
}
