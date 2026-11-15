import { listTagsWithCount, listPostsByTag } from '@/lib/posts'
import { TagCloud } from '@/components/tag-cloud'
import { TagSection } from '@/components/tag-section'
import { Flourish } from '@/components/flourish'

export const dynamic = 'force-dynamic'

export const metadata = { title: '标签' }

export default async function TagsPage() {
  const tags = await listTagsWithCount()
  const cloud = tags.map((t) => ({ id: t.id, name: t.name, slug: t.slug, count: t._count.posts }))
  const hottest = [...cloud].sort((a, b) => b.count - a.count)[0]
  const featured = hottest
    ? await listPostsByTag(hottest.slug, 1, 3)
    : { posts: [], total: 0, totalPages: 1 }

  return (
    <div className="mx-auto w-full max-w-5xl px-3 py-8 sm:px-4">
      {cloud.length === 0 ? (
        <div className="glass-panel rounded-2xl py-16 text-center text-sm text-slate-400">还没有标签。</div>
      ) : (
        <>
          <TagCloud tags={cloud} activeSlug={hottest?.slug} />
          {hottest && (
            <TagSection
              name={hottest.name}
              slug={hottest.slug}
              posts={featured.posts}
              total={featured.total}
              current={1}
              totalPages={1}
              showMore
            />
          )}
        </>
      )}
      <div className="mt-10 flex items-center justify-center gap-4">
        <Flourish className="h-4 w-24" />
        <p className="text-xs tracking-wider text-slate-500">去看更大的世界，也去遇见更好的自己</p>
        <Flourish className="h-4 w-24" flip />
      </div>
    </div>
  )
}