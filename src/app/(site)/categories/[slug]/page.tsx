import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCategoryBySlug, listPostsByCategory } from '@/lib/posts'
import { PostCard } from '@/components/post-card'
import { Pagination } from '@/components/pagination'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategoryBySlug(decodeURIComponent(slug))
  return { title: category ? `分类：${category.name}` : '分类不存在' }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { page } = await searchParams
  const category = await getCategoryBySlug(decodeURIComponent(slug))
  if (!category) notFound()

  const current = Math.max(1, Number(page) || 1)
  const { posts, totalPages } = await listPostsByCategory(category.slug, current)

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">分类：{category.name}</h1>
      {posts.length === 0 && <p className="text-neutral-500">该分类下还没有文章。</p>}
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
      <Pagination current={current} totalPages={totalPages} basePath={`/categories/${encodeURIComponent(category.slug)}`} />
    </div>
  )
}
