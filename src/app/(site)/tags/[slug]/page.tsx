import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTagBySlug, listPostsByTag } from '@/lib/posts'
import { PostCard } from '@/components/post-card'
import { Pagination } from '@/components/pagination'
import { PageCard, PageHeader } from '@/components/page-card'
import { TagIcon } from '@/components/icons'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const tag = await getTagBySlug(decodeURIComponent(slug))
  return { title: tag ? `标签：${tag.name}` : '标签不存在' }
}

export default async function TagPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { page } = await searchParams
  const tag = await getTagBySlug(decodeURIComponent(slug))
  if (!tag) notFound()

  const current = Math.max(1, Number(page) || 1)
  const { posts, totalPages } = await listPostsByTag(tag.slug, current)

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <PageCard>
        <PageHeader
          eyebrow="Tag"
          title={
            <span className="inline-flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-500 dark:bg-orange-950 dark:text-orange-400">
                <TagIcon className="h-5 w-5" />
              </span>
              {tag.name}
            </span>
          }
          description={`该标签下共 ${posts.length} 篇文章`}
        />
        {posts.length === 0 ? (
          <p className="text-stone-500 dark:text-stone-400">该标签下还没有文章。</p>
        ) : (
          <div className="divide-y divide-stone-100 dark:divide-stone-800">
            {posts.map((post) => (
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
        <Pagination
          current={current}
          totalPages={totalPages}
          basePath={`/tags/${encodeURIComponent(tag.slug)}`}
        />
      </PageCard>
    </div>
  )
}
