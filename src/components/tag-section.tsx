import Link from 'next/link'
import { PostRowCard } from '@/components/post-row-card'
import { Pagination } from '@/components/pagination'
import { tagPoem } from '@/components/tag-cloud'
import { ArrowRightIcon } from '@/components/icons'
import type { PostWithRelations } from '@/lib/posts'

/** 选中标签的文章列表面板：头部 + 横向文章卡 + 分页 */
export function TagSection({
  name,
  slug,
  posts,
  total,
  current,
  totalPages,
  showMore = false,
}: {
  name: string
  slug: string
  posts: PostWithRelations[]
  total: number
  current: number
  totalPages: number
  showMore?: boolean
}) {
  return (
    <section className="glass-panel animate-fade-up mt-6 rounded-3xl p-5 sm:p-7" style={{ animationDelay: '120ms' }}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
        <h2 className="flex items-center gap-2.5 text-lg font-bold text-white">
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-ice-300" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
          </svg>
          {name}
          <span className="text-sm font-normal text-slate-400">- {tagPoem(name)}</span>
        </h2>
        {showMore ? (
          <Link
            href={`/tags/${encodeURIComponent(slug)}`}
            className="glass-chip inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs text-slate-200 transition-colors hover:border-ice-400/40 hover:text-ice-300"
          >
            查看全部
            <ArrowRightIcon className="h-3 w-3" />
          </Link>
        ) : (
          <span className="text-xs text-slate-500">共 {total} 篇</span>
        )}
      </div>

      {posts.length === 0 ? (
        <p className="py-12 text-center text-sm text-slate-400">该标签下还没有文章。</p>
      ) : (
        <div className="mt-5 space-y-4">
          {posts.map((post) => (
            <PostRowCard
              key={post.id}
              title={post.title}
              slug={post.slug}
              summary={post.summary}
              coverUrl={post.coverUrl}
              publishedAt={post.publishedAt}
              tags={post.tags.map((t) => ({ name: t.tag.name, slug: t.tag.slug }))}
              views={post.views}
            />
          ))}
        </div>
      )}
      <Pagination current={current} totalPages={totalPages} basePath={`/tags/${encodeURIComponent(slug)}`} />
    </section>
  )
}