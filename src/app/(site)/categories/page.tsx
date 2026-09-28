import Link from 'next/link'
import { listCategoriesWithCount } from '@/lib/posts'

export const dynamic = 'force-dynamic'

export const metadata = { title: '分类' }

export default async function CategoriesPage() {
  const categories = await listCategoriesWithCount()

  return (
    <div>
      <h1 className="text-2xl font-bold">分类</h1>
      {categories.length === 0 ? (
        <p className="mt-6 text-neutral-500">还没有分类。</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {categories.map((cat) => (
            <li key={cat.id}>
              <Link
                href={`/categories/${encodeURIComponent(cat.slug)}`}
                className="flex items-baseline justify-between border-b border-neutral-100 pb-3 transition-colors hover:underline dark:border-neutral-800"
              >
                <span>
                  <span className="font-medium">{cat.name}</span>
                  {cat.description && (
                    <span className="ml-3 text-sm text-neutral-500 dark:text-neutral-400">{cat.description}</span>
                  )}
                </span>
                <span className="text-sm text-neutral-400 dark:text-neutral-500">{cat._count.posts} 篇</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
