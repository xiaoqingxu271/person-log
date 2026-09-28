import Link from 'next/link'
import { listCategoriesWithCount } from '@/lib/posts'
import { PageCard, PageHeader } from '@/components/page-card'
import { FolderIcon } from '@/components/icons'

export const dynamic = 'force-dynamic'

export const metadata = { title: '分类' }

export default async function CategoriesPage() {
  const categories = await listCategoriesWithCount()

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <PageCard>
        <PageHeader eyebrow="Categories" title="分类" description={`共 ${categories.length} 个分类`} />
        {categories.length === 0 ? (
          <p className="text-stone-500 dark:text-stone-400">还没有分类。</p>
        ) : (
          <ul className="space-y-2">
            {categories.map((cat) => (
              <li key={cat.id}>
                <Link
                  href={`/categories/${encodeURIComponent(cat.slug)}`}
                  className="group flex items-center gap-4 rounded-2xl border border-transparent px-4 py-3.5 transition-colors hover:border-stone-200 hover:bg-stone-50 dark:hover:border-stone-700 dark:hover:bg-stone-800/60"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500 dark:bg-orange-950 dark:text-orange-400">
                    <FolderIcon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-stone-900 transition-colors group-hover:text-orange-600 dark:text-white dark:group-hover:text-orange-400">
                      {cat.name}
                    </span>
                    {cat.description && (
                      <span className="block truncate text-sm text-stone-400 dark:text-stone-500">
                        {cat.description}
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-500 dark:bg-stone-800 dark:text-stone-400">
                    {cat._count.posts} 篇
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </PageCard>
    </div>
  )
}
