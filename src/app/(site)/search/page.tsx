import Link from 'next/link'
import { searchPosts, listCategoriesWithCount, getRecommendedPosts } from '@/lib/posts'
import { PostGridCard } from '@/components/post-grid-card'
import { Pagination } from '@/components/pagination'
import { RelatedCard } from '@/components/related-card'
import { SearchIcon, ArrowRightIcon } from '@/components/icons'
import { Reveal } from '@/components/reveal'

export const dynamic = 'force-dynamic'

export const metadata = { title: '搜索' }

interface Props {
  searchParams: Promise<{ q?: string; page?: string; cat?: string }>
}

function chipHref(q: string, cat?: string) {
  const params = new URLSearchParams()
  if (q) params.set('q', q)
  if (cat) params.set('cat', cat)
  const qs = params.toString()
  return qs ? `/search?${qs}` : '/search'
}

export default async function SearchPage({ searchParams }: Props) {
  const { q, page, cat } = await searchParams
  const query = (q ?? '').trim().slice(0, 100)
  const categorySlug = (cat ?? '').trim().slice(0, 50) || undefined
  const current = Math.max(1, Number(page) || 1)

  const [result, categories, recommended] = await Promise.all([
    searchPosts(query, current, 6, categorySlug),
    listCategoriesWithCount(),
    getRecommendedPosts(4),
  ])
  const activeCategory = categories.find((c) => c.slug === categorySlug)

  return (
    <div className="mx-auto w-full max-w-[1280px] px-3 py-8 sm:px-4">
      {/* 大搜索 bar */}
      <form
        action="/search"
        method="get"
        className="glass-bar animate-fade-up mx-auto flex w-full max-w-3xl items-center gap-3 rounded-2xl p-2.5 pl-5"
      >
        <SearchIcon className="h-5 w-5 shrink-0 text-slate-400" />
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="输入关键词..."
          aria-label="搜索关键词"
          className="min-w-0 flex-1 bg-transparent text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none"
        />
        {categorySlug && <input type="hidden" name="cat" value={categorySlug} />}
        <button
          type="submit"
          className="aurora-btn inline-flex shrink-0 items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-medium"
        >
          搜索
          <ArrowRightIcon className="h-4 w-4" />
        </button>
      </form>

      {/* 分类过滤 chips */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
        <Link
          href={chipHref(query)}
          className={
            'rounded-full px-4 py-1.5 text-sm transition-all ' +
            (!categorySlug
              ? 'aurora-btn font-medium'
              : 'glass-chip text-slate-300 hover:border-ice-400/40 hover:text-ice-300')
          }
        >
          全部
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={chipHref(query, c.slug)}
            className={
              'rounded-full px-4 py-1.5 text-sm transition-all ' +
              (categorySlug === c.slug
                ? 'aurora-btn font-medium'
                : 'glass-chip text-slate-300 hover:border-ice-400/40 hover:text-ice-300')
            }
          >
            {c.name}
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <section className="min-w-0">
          <p className="mb-4 text-sm text-slate-400">
            {query ? `「${query}」` : activeCategory ? `分类「${activeCategory.name}」` : '全部文章'}
            共 {result.total} 条结果
          </p>
          {result.posts.length === 0 ? (
            <div className="glass-panel rounded-2xl py-16 text-center text-sm text-slate-400">
              没有找到相关文章，换个关键词试试？
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              {result.posts.map((post, index) => (
                <Reveal key={post.id} delay={(index % 2) * 80}>
                  <PostGridCard
                    title={post.title}
                    slug={post.slug}
                    summary={post.summary}
                    coverUrl={post.coverUrl}
                    publishedAt={post.publishedAt}
                    categoryName={post.category?.name}
                    categorySlug={post.category?.slug}
                    views={post.views}
                  />
                </Reveal>
              ))}
            </div>
          )}
          <Pagination
            current={current}
            totalPages={result.totalPages}
            basePath="/search"
            query={{ ...(query ? { q: query } : {}), ...(categorySlug ? { cat: categorySlug } : {}) }}
          />
        </section>

        <aside className="space-y-6 self-start">
          <div className="animate-fade-up" style={{ animationDelay: '120ms' }}>
            <RelatedCard title="推荐阅读" items={recommended} showViews={false} bookmark />
          </div>
        </aside>
      </div>

      {/* 底部装饰：左衬线宣言 + 右毛笔句 */}
      <div className="mt-14 flex flex-wrap items-end justify-between gap-8">
        <div className="max-w-md">
          <p className="font-serif-cn text-glow text-4xl leading-tight text-slate-100 sm:text-5xl">
            Explore
            <br />
            a Better Self
          </p>
          <p className="mt-4 text-sm leading-relaxed text-slate-400">
            记录生活，探索世界，
            <br />
            在文字中遇见更好的自己。
          </p>
          <p className="mt-4 text-xs tracking-[0.35em] text-slate-500">
            TRAVEL · THINK · WRITE · GROW
          </p>
        </div>
        <div className="relative pb-2 pr-2 text-right">
          <p className="font-brush text-2xl leading-snug text-slate-100 sm:text-3xl">
            保持热爱，
            <br />
            奔赴下一场山海。
          </p>
          <svg viewBox="0 0 200 24" className="ml-auto mt-1 h-5 w-44" fill="none" aria-hidden>
            <path d="M4 14c40-10 96-12 192-6" stroke="url(#sr-g)" strokeWidth="2" strokeLinecap="round" />
            <defs>
              <linearGradient id="sr-g" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#38bdf8" stopOpacity="0.2" />
                <stop offset="0.6" stopColor="#7dd3fc" />
                <stop offset="1" stopColor="#a78bfa" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  )
}