import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { getPostForEdit } from '@/lib/posts'
import { PostEditor } from '@/components/admin/post-editor'

export const dynamic = 'force-dynamic'

export const metadata = { title: '编辑文章' }

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const post = await getPostForEdit(Number(id))
  if (!post) notFound()

  const categories = await prisma.category.findMany({ orderBy: { id: 'asc' }, select: { name: true } })

  return (
    <PostEditor
      categories={categories.map((c) => c.name)}
      post={{
        id: post.id,
        title: post.title,
        slug: post.slug,
        summary: post.summary,
        contentMd: post.contentMd,
        coverUrl: post.coverUrl,
        status: post.status,
        isPinned: post.isPinned,
        categoryName: post.category?.name ?? '',
        tagNames: post.tags.map((t) => t.tag.name).join('、'),
      }}
    />
  )
}
