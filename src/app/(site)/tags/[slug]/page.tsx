import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTagBySlug, listPostsByTag } from '@/lib/posts'
import { PostCard } from '@/components/post-card'
import { Pagination } from '@/components/pagination'

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
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">标签：{tag.name}</h1>
      {posts.length === 0 && <p className="text-neutral-500">该标签下还没有文章。</p>}
      {posts.map((post) => (
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
      ))}
      <Pagination current={current} totalPages={totalPages} basePath={`/tags/${encodeURIComponent(tag.slug)}`} />
    </div>
  )
}
