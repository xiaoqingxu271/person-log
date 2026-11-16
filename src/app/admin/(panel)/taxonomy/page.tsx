import { prisma } from '@/lib/db'
import { TaxonomyManager } from '@/components/admin/taxonomy-manager'

export const dynamic = 'force-dynamic'

export const metadata = { title: '分类与标签' }

export default async function TaxonomyPage() {
  const [categories, tags] = await Promise.all([
    prisma.category.findMany({
      orderBy: { id: 'asc' },
      include: { _count: { select: { posts: true } } },
    }),
    prisma.tag.findMany({
      orderBy: { id: 'asc' },
      include: { _count: { select: { posts: true } } },
    }),
  ])

  return (
    <div className="mx-auto max-w-5xl">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-orange-500">Taxonomy</p>
        <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-stone-900 dark:text-white">
          分类与标签
        </h1>
        <p className="mt-1 text-sm text-stone-400">
          支持新增、改名、改 slug、删除与合并；合并会把文章或标签关联迁移到目标项。
        </p>
      </div>
      <div className="mt-8">
        <TaxonomyManager
          initialCategories={categories.map((category) => ({
            id: category.id,
            name: category.name,
            slug: category.slug,
            description: category.description,
            count: category._count.posts,
          }))}
          initialTags={tags.map((tag) => ({
            id: tag.id,
            name: tag.name,
            slug: tag.slug,
            count: tag._count.posts,
          }))}
        />
      </div>
    </div>
  )
}
