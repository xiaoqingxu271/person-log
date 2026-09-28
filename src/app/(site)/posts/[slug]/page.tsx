import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPostBySlug, incrementPostViews, listRelatedPosts } from '@/lib/posts'
import { listCommentsForPost } from '@/lib/comments'
import { getSessionUser } from '@/lib/session'
import { getSiteConfig } from '@/lib/site-config'
import { extractToc } from '@/lib/toc'
import { MarkdownView } from '@/lib/markdown'
import { formatDate } from '@/lib/format'
import { Toc } from '@/components/toc'
import { LikeButton } from '@/components/like-button'
import { CommentSection } from '@/components/comments/comment-section'
import { ReadingProgress } from '@/components/reading-progress'
import { PageCard } from '@/components/page-card'
import { CalendarIcon, EyeIcon } from '@/components/icons'
import { SITE } from '@/lib/site'

const SITE_URL = SITE.url

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(decodeURIComponent(slug))
  if (!post || post.status !== 'published') return { title: '文章不存在' }
  return {
    title: post.title,
    description: post.summary || undefined,
    openGraph: {
      title: post.title,
      description: post.summary,
      type: 'article',
      publishedTime: post.publishedAt?.toISOString(),
    },
  }
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPostBySlug(decodeURIComponent(slug))
  const user = await getSessionUser()
  if (!post || (post.status === 'draft' && !user)) notFound()

  // F-22 浏览量：详情页每次访问 +1（草稿预览不计）
  if (post.status === 'published') {
    await incrementPostViews(post.id)
  }
  const comments = await listCommentsForPost(post.id, Boolean(user))
  const toc = await extractToc(post.contentMd)
  const cfg = await getSiteConfig()
  const related = await listRelatedPosts(
    post.id,
    post.tags.map((t) => t.tag.slug),
  )

  // F-41 结构化数据：BlogPosting JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.summary || undefined,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: { '@type': 'Person', name: cfg.siteName, url: cfg.githubUrl || undefined },
    image: post.coverUrl || undefined,
    mainEntityOfPage: `${SITE_URL}/posts/${post.slug}`,
  }

  return (
    <>
      <ReadingProgress />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto w-full max-w-5xl px-4 py-10">
        <PageCard wide>
          <div className="flex gap-10">
            <article className="min-w-0 flex-1">
              {post.status === 'draft' && (
                <p className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-400">
                  草稿预览：本页仅登录用户可见，游客访问会得到 404。
                </p>
              )}
              <header>
                {post.category && (
                  <Link
                    href={`/categories/${encodeURIComponent(post.category.slug)}`}
                    className="text-xs font-medium uppercase tracking-[0.3em] text-orange-500 transition-colors hover:text-orange-400 dark:text-orange-400"
                  >
                    {post.category.name}
                  </Link>
                )}
                <h1 className="mt-3 text-3xl font-bold leading-snug tracking-tight text-stone-900 dark:text-white sm:text-4xl">
                  {post.title}
                </h1>
                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-stone-400 dark:text-stone-500">
                  {post.publishedAt && (
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarIcon className="h-4 w-4" />
                      <time dateTime={post.publishedAt.toISOString()}>{formatDate(post.publishedAt)}</time>
                    </span>
                  )}
                  {post.status === 'published' && (
                    <span className="inline-flex items-center gap-1.5">
                      <EyeIcon className="h-4 w-4" />
                      {post.views + 1} 次阅读
                    </span>
                  )}
                </div>
              </header>

              <div className="mt-8">
                <MarkdownView content={post.contentMd} />
              </div>

              <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-stone-100 pt-6 dark:border-stone-800">
                {post.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((t) => (
                      <Link
                        key={t.tag.slug}
                        href={`/tags/${encodeURIComponent(t.tag.slug)}`}
                        className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-500 transition-colors hover:bg-stone-200 hover:text-stone-800 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700 dark:hover:text-stone-200"
                      >
                        #{t.tag.name}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <span />
                )}
                <LikeButton postId={post.id} initialLikes={post.likes} />
              </div>

              {related.length > 0 && (
                <section className="mt-8 rounded-2xl bg-stone-50 p-5 dark:bg-stone-800/50">
                  <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100">相关文章</h2>
                  <ul className="mt-3 space-y-2.5">
                    {related.map((item) => (
                      <li key={item.slug} className="flex items-baseline justify-between gap-4 text-sm">
                        <Link
                          href={`/posts/${item.slug}`}
                          className="min-w-0 truncate text-stone-600 transition-colors hover:text-orange-600 dark:text-stone-400 dark:hover:text-orange-400"
                        >
                          {item.title}
                        </Link>
                        <span className="shrink-0 text-xs text-stone-400">
                          {item.views} 阅读
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <CommentSection postId={post.id} comments={comments} loggedIn={Boolean(user)} />
            </article>
            <aside className="hidden w-56 shrink-0 xl:block">
              {toc.length >= 2 && <Toc items={toc} />}
            </aside>
          </div>
        </PageCard>
      </div>
    </>
  )
}
