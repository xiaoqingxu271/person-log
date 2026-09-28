import { prisma } from '@/lib/db'
import { PostEditor } from '@/components/admin/post-editor'

export const dynamic = 'force-dynamic'

export const metadata = { title: '写文章' }

export default async function NewPostPage() {
  const categories = await prisma.category.findMany({ orderBy: { id: 'asc' }, select: { name: true } })
  return <PostEditor categories={categories.map((c) => c.name)} />
}
