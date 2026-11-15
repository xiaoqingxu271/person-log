import Link from 'next/link'
import { prisma } from '@/lib/db'
import { getSiteConfig } from '@/lib/site-config'
import { listPublishedPosts } from '@/lib/posts'
import { getDailyPvSeries } from '@/lib/stats'
import { PostCard } from '@/components/post-card'
import { Pagination } from '@/components/pagination'
import { SiteHero } from '@/components/site-hero'
import { StatsPanel } from '@/components/stats-panel'
import { QuoteCard } from '@/components/quote-card'
import { ArrowRightIcon } from '@/components/icons'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{ page?: string }>
}

export default async function HomePage({ searchParams }: Props) {
  const { page } = await searchParams
  const current = Math.max(1, Number(page) || 1)

  const [cfg, { posts, totalPages }] = await Promise.all([
    getSiteConfig(),
    listPublishedPosts(current),
  ])
  const [postCount, categoryCount, tagCount, viewsAgg, series] = await Promise.all([
    prisma.post.count({ where: { status: 'published' } }),
    prisma.category.count(),
    prisma.tag.count(),
    prisma.post.aggregate({ where: { status: 'published' }, _sum: { views: true } }),
    getDailyPvSeries(365),
  ])
  const stats = {
    posts: postCount,
    categories: categoryCount,
    tags: tagCount,
    views: viewsAgg._sum.views ?? 0,
  }

  return (
    <div className="mx-auto w-full max-w-[1280px] px-3 pt-4 sm:px-4">
      <SiteHero
        tagline={cfg.tagline}
        description={cfg.description}
        bannerUrl={cfg.bannerUrl}
        stats={stats}
      />

      <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_360px]">
        <section id="content" className="scroll-mt-28">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2.5 text-lg font-bold text-white">
              <span aria-hidden className="h-5 w-1 rounded-full bg-gradient-to-b from-aurora-400 to-ice-500" />
              最新文章
            </h2>
            <Link
              href="/archives"
              className="inline-flex items-center gap-1 text-xs text-slate-400 transition-colors hover:text-ice-300"
            >
              查看全部
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>

          {posts.length === 0 ? (
            <div className="glass-panel rounded-2xl py-16 text-center text-sm text-slate-400">
              还没有发布任何文章，登录 <code className="text-ice-300">/admin</code> 发布第一篇吧。
            </div>
          ) : (
            <div className="space-y-5">
              {posts.map((post, index) => (
                <div
                  key={post.id}
                  className="animate-fade-up"
                  style={{ animationDelay: `${Math.min(index, 6) * 70}ms` }}
                >
                  <PostCard
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
                  />
                </div>
              ))}
            </div>
          )}
          <Pagination current={current} totalPages={totalPages} />
        </section>

        <aside className="space-y-6 self-start lg:sticky lg:top-24">
          <div className="animate-fade-up" style={{ animationDelay: '120ms' }}>
            <StatsPanel stats={stats} series={series} />
          </div>
          <div className="animate-fade-up" style={{ animationDelay: '200ms' }}>
            <QuoteCard />
          </div>
        </aside>
      </div>
      <div className="h-10" />
    </div>
  )
}