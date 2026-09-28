import { prisma } from '@/lib/db'
import { getSiteConfig } from '@/lib/site-config'
import { listPublishedPosts } from '@/lib/posts'
import { PostCard } from '@/components/post-card'
import { Pagination } from '@/components/pagination'
import { SiteHero } from '@/components/site-hero'
import { PageCard } from '@/components/page-card'

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
  const [postCount, categoryCount, tagCount] = await Promise.all([
    prisma.post.count({ where: { status: 'published' } }),
    prisma.category.count(),
    prisma.tag.count(),
  ])

  return (
    <>
      <SiteHero
        siteName={cfg.siteName}
        tagline={cfg.tagline}
        description={cfg.description}
        bannerUrl={cfg.bannerUrl}
        stats={{ posts: postCount, categories: categoryCount, tags: tagCount }}
      />

      <PageCard className="-mt-16 animate-fade-up">
        <div id="content" className="scroll-mt-24">
          {posts.length === 0 ? (
            <p className="py-16 text-center text-stone-500 dark:text-stone-400">
              还没有发布任何文章，登录 <code>/admin</code> 发布第一篇吧。
            </p>
          ) : (
            <div className="divide-y divide-stone-100 dark:divide-stone-800">
              {posts.map((post, index) => (
                <div key={post.id} className="animate-fade-up" style={{ animationDelay: `${Math.min(index, 6) * 70}ms` }}>
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
                    commentCount={post._count.comments}
                  />
                </div>
              ))}
            </div>
          )}
          <div className="mt-4">
            <Pagination current={current} totalPages={totalPages} />
          </div>
        </div>
      </PageCard>
      <div className="h-16" />
    </>
  )
}
