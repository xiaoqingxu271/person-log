import { listPublishedPosts } from '@/lib/posts'
import { PostCard } from '@/components/post-card'
import { Pagination } from '@/components/pagination'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{ page?: string }>
}

export default async function HomePage({ searchParams }: Props) {
  const { page } = await searchParams
  const current = Math.max(1, Number(page) || 1)
  const { posts, totalPages } = await listPublishedPosts(current)

  return (
    <div className="space-y-8">
      {posts.length === 0 && (
        <p className="py-16 text-center text-neutral-500">
          还没有发布任何文章，登录 <code>/admin</code> 发布第一篇吧。
        </p>
      )}
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
      <Pagination current={current} totalPages={totalPages} />
    </div>
  )
}
