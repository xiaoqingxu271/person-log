import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCategoryBySlug, listPostsByCategory } from '@/lib/posts'
import { PostCard } from '@/components/post-card'
import { Pagination } from '@/components/pagination'
import { PageCard, PageHeader } from '@/components/page-card'
import { FolderIcon } from '@/components/icons'

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
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <PageCard>
        <PageHeader
          eyebrow="Category"
          title={
            <span className="inline-flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-500 dark:bg-orange-950 dark:text-orange-400">
                <FolderIcon className="h-5 w-5" />
              </span>
              {category.name}
            </span>
          }
          description={category.description || `该分类下共 ${posts.length} 篇文章`}
        />
        {posts.length === 0 ? (
          <p className="text-stone-500 dark:text-stone-400">该分类下还没有文章。</p>
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
          basePath={`/categories/${encodeURIComponent(category.slug)}`}
        />
      </PageCard>
    </div>
  )
}
