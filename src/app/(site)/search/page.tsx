import { searchPosts } from '@/lib/posts'
import { PostCard } from '@/components/post-card'
import { Pagination } from '@/components/pagination'
import { PageCard, PageHeader } from '@/components/page-card'
import { SearchIcon } from '@/components/icons'

export const dynamic = 'force-dynamic'

export const metadata = { title: '搜索' }

interface Props {
  searchParams: Promise<{ q?: string; page?: string }>
}

export default async function SearchPage({ searchParams }: Props) {
  const { q, page } = await searchParams
  const query = (q ?? '').trim().slice(0, 100)
  const current = Math.max(1, Number(page) || 1)
  const result = query ? await searchPosts(query, current) : null

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <PageCard>
        <PageHeader eyebrow="Search" title="搜索" description="匹配标题 / 摘要 / 正文" />

        <form action="/search" method="get" className="flex gap-2">
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="输入关键词…"
              className="w-full rounded-full border border-stone-300 bg-white py-2.5 pl-11 pr-4 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-stone-700 dark:bg-stone-900"
              aria-label="搜索关键词"
            />
          </div>
          <button
            type="submit"
            className="shrink-0 rounded-full bg-stone-900 px-6 py-2.5 text-sm text-white transition-colors hover:bg-stone-700 dark:bg-white dark:text-stone-900 dark:hover:bg-stone-200"
          >
            搜索
          </button>
        </form>

        {result && (
          <div className="mt-8">
            <p className="text-sm text-stone-500 dark:text-stone-400">
              「{query}」共 {result.total} 条结果
            </p>
            {result.posts.length === 0 ? (
              <p className="py-10 text-center text-stone-500 dark:text-stone-400">
                没有找到相关文章，换个关键词试试？
              </p>
            ) : (
              <div className="mt-4 divide-y divide-stone-100 dark:divide-stone-800">
                {result.posts.map((post) => (
                  <PostCard
                    key={post.id}
                    title={post.title}
                    slug={post.slug}
                    summary={post.summary}
                    coverUrl={post.coverUrl}
                    publishedAt={post.publishedAt}
                    isPinned={post.isPinned}
                    categoryName={post.category?.name}
                    categorySlug={post.category?.slug}
                    tags={post.tags.map((t) => ({ name: t.tag.name, slug: t.tag.slug }))}
                    views={post.views}
                    likes={post.likes}
                    commentCount={post._count.comments}
                  />
                ))}
              </div>
            )}
            <Pagination current={current} totalPages={result.totalPages} basePath="/search" query={{ q: query }} />
          </div>
        )}
      </PageCard>
    </div>
  )
}
