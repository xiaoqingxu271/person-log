import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  getCategoryBySlug,
  listPostsByCategory,
  listCategoriesWithMeta,
} from '@/lib/posts'
import { PostRowCard } from '@/components/post-row-card'
import { Pagination } from '@/components/pagination'
import { CategoryIcon, metaFor } from '@/components/category-card'
import { Flourish } from '@/components/flourish'

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
  const [{ posts, totalPages }, all] = await Promise.all([
    listPostsByCategory(category.slug, current),
    listCategoriesWithMeta(),
  ])
  const index = Math.max(0, all.findIndex((c) => c.id === category.id))
  const meta = metaFor(index, category.name)

  return (
    <div className="mx-auto w-full max-w-4xl px-3 py-8 sm:px-4">
      <header
        className="glass-panel animate-fade-up rounded-3xl p-6 sm:p-8"
        style={{ background: `linear-gradient(150deg, ${meta.tint}, rgba(9,13,32,0.66))` }}
      >
        <div className="flex items-center gap-4">
          <span
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-white shadow-[0_6px_18px_rgba(2,6,23,0.4)]"
            style={{ background: `linear-gradient(135deg, ${meta.hue[0]}, ${meta.hue[1]})` }}
          >
            <CategoryIcon icon={meta.icon} className="h-6 w-6" />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="font-serif-cn text-glow truncate text-2xl font-bold text-white sm:text-3xl">
              {category.name}
            </h1>
            <p className="mt-1 text-xs tracking-wider text-slate-400">{meta.en}</p>
          </div>
          <p className="shrink-0 text-sm text-slate-300">
            <span className="text-lg font-bold text-white">{all[index]?._count.posts ?? posts.length}</span>
            <span className="ml-1 text-xs text-slate-500">篇</span>
          </p>
        </div>
        {category.description && (
          <p className="mt-4 text-sm leading-relaxed text-slate-300">{category.description}</p>
        )}
      </header>

      <div className="mt-6">
        {posts.length === 0 ? (
          <div className="glass-panel rounded-2xl py-16 text-center text-sm text-slate-400">
            该分类下还没有文章。
          </div>
        ) : (
          <div className="space-y-5">
            {posts.map((post) => (
              <PostRowCard
                key={post.id}
                title={post.title}
                slug={post.slug}
                summary={post.summary}
                coverUrl={post.coverUrl}
                publishedAt={post.publishedAt}
                tags={post.tags.map((t) => ({ name: t.tag.name, slug: t.tag.slug }))}
                views={post.views}
              />
            ))}
          </div>
        )}
        <Pagination
          current={current}
          totalPages={totalPages}
          basePath={`/categories/${encodeURIComponent(category.slug)}`}
        />
      </div>

      <div className="mt-10 flex items-center justify-center gap-4">
        <Flourish className="h-4 w-24" />
        <p className="text-xs tracking-wider text-slate-500">思想有书架，生活有索引</p>
        <Flourish className="h-4 w-24" flip />
      </div>
    </div>
  )
}