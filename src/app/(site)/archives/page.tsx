import Link from 'next/link'
import { listArchivePosts } from '@/lib/posts'
import { formatDate } from '@/lib/format'
import { PageCard, PageHeader } from '@/components/page-card'

export const dynamic = 'force-dynamic'

export const metadata = { title: '归档' }

export default async function ArchivesPage() {
  const posts = await listArchivePosts()
  const years = [...new Set(posts.map((p) => p.publishedAt?.getFullYear() ?? 0))]

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <PageCard>
        <PageHeader
          eyebrow="Timeline"
          title="归档"
          description={`共 ${posts.length} 篇文章，按时间倒序`}
        />
        {posts.length === 0 ? (
          <p className="text-stone-500 dark:text-stone-400">还没有文章。</p>
        ) : (
          <div className="ml-2 border-l border-stone-200 dark:border-stone-800">
            {years.map((year) => (
              <section key={year} className="relative pb-10 pl-8 last:pb-0">
                <span
                  aria-hidden
                  className="absolute -left-[7px] top-1 h-3.5 w-3.5 rounded-full border-[3px] border-white bg-orange-500 dark:border-stone-900"
                />
                <h2 className="text-xl font-bold tracking-tight text-stone-900 dark:text-white">
                  {year}
                  <span className="ml-2 text-sm font-normal text-stone-400">
                    {posts.filter((p) => (p.publishedAt?.getFullYear() ?? 0) === year).length} 篇
                  </span>
                </h2>
                <ul className="mt-4 space-y-3">
                  {posts
                    .filter((p) => (p.publishedAt?.getFullYear() ?? 0) === year)
                    .map((post) => (
                      <li key={post.slug} className="flex items-baseline gap-4 text-sm">
                        <span className="shrink-0 font-mono text-xs text-stone-400 dark:text-stone-500">
                          {formatDate(post.publishedAt ?? new Date(0)).slice(5)}
                        </span>
                        <Link
                          href={`/posts/${post.slug}`}
                          className="text-stone-700 transition-colors hover:text-orange-600 dark:text-stone-300 dark:hover:text-orange-400"
                        >
                          {post.title}
                        </Link>
                      </li>
                    ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </PageCard>
    </div>
  )
}
