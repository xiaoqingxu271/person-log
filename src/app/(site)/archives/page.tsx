import Link from 'next/link'
import { listArchivePosts } from '@/lib/posts'
import { formatDate } from '@/lib/format'

export const dynamic = 'force-dynamic'

export const metadata = { title: '归档' }

export default async function ArchivesPage() {
  const posts = await listArchivePosts()
  const years = [...new Set(posts.map((p) => p.publishedAt?.getFullYear() ?? 0))]

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-bold">
        归档 <span className="ml-1 text-base font-normal text-neutral-400">共 {posts.length} 篇</span>
      </h1>
      {posts.length === 0 && <p className="text-neutral-500">还没有文章。</p>}
      {years.map((year) => (
        <section key={year}>
          <h2 className="border-b border-neutral-100 pb-2 text-lg font-semibold dark:border-neutral-800">{year}</h2>
          <ul className="mt-3 space-y-2.5">
            {posts
              .filter((p) => (p.publishedAt?.getFullYear() ?? 0) === year)
              .map((post) => (
                <li key={post.slug} className="flex items-baseline gap-4 text-sm">
                  <span className="shrink-0 text-neutral-400 dark:text-neutral-500">{formatDate(post.publishedAt ?? new Date(0)).slice(5)}</span>
                  <Link href={`/posts/${post.slug}`} className="hover:underline">
                    {post.title}
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
