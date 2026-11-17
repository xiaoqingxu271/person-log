import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTagBySlug, listPostsByTag, listTagsWithCount } from '@/lib/posts'
import { TagCloud } from '@/components/tag-cloud'
import { TagSection } from '@/components/tag-section'
import { Flourish } from '@/components/flourish'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const tag = await getTagBySlug(decodeURIComponent(slug))
  if (!tag) notFound()
  return { title: `标签：${tag.name}` }
}

export default async function TagPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { page } = await searchParams
  const tag = await getTagBySlug(decodeURIComponent(slug))
  if (!tag) notFound()

  const current = Math.max(1, Number(page) || 1)
  const [{ posts, total, totalPages }, tags] = await Promise.all([
    listPostsByTag(tag.slug, current),
    listTagsWithCount(),
  ])
  const cloud = tags.map((t) => ({ id: t.id, name: t.name, slug: t.slug, count: t._count.posts }))

  return (
    <div className="mx-auto w-full max-w-5xl px-3 py-8 sm:px-4">
      <TagCloud tags={cloud} activeSlug={tag.slug} />
      <TagSection
        name={tag.name}
        slug={tag.slug}
        posts={posts}
        total={total}
        current={current}
        totalPages={totalPages}
      />
      <div className="mt-10 flex items-center justify-center gap-4">
        <Flourish className="h-4 w-24" />
        <p className="text-xs tracking-wider text-slate-500">去看更大的世界，也去遇见更好的自己</p>
        <Flourish className="h-4 w-24" flip />
      </div>
    </div>
  )
}