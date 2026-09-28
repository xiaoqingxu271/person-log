import { searchPosts } from '@/lib/posts'
import { PostCard } from '@/components/post-card'
import { Pagination } from '@/components/pagination'

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
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">搜索</h1>
      <form action="/search" method="get" className="flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="输入关键词，匹配标题 / 摘要 / 正文"
          className="w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900"
          aria-label="搜索关键词"
        />
        <button
          type="submit"
          className="shrink-0 rounded bg-neutral-900 px-4 py-2 text-sm text-white transition-colors hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
        >
          搜索
        </button>
      </form>

      {result && (
        <>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            「{query}」共 {result.total} 条结果
          </p>
          {result.posts.length === 0 ? (
            <p className="text-neutral-500 dark:text-neutral-400">没有找到相关文章。</p>
          ) : (
            result.posts.map((post) => (
              <PostCard
                key={post.id}
                title={post.title}
                slug={post.slug}
                summary={post.summary}
                publishedAt={post.publishedAt}
                isPinned={post.isPinned}
                categoryName={post.category?.name}
                categorySlug={post.category?.slug}
                tags={post.tags.map((t) => ({ name: t.tag.name, slug: t.tag.slug }))}
              />
            ))
          )}
          <Pagination current={current} totalPages={result.totalPages} basePath="/search" query={{ q: query }} />
        </>
      )}
    </div>
  )
}
