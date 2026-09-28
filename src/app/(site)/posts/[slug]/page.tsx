import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPostBySlug, incrementPostViews } from '@/lib/posts'
import { listCommentsForPost } from '@/lib/comments'
import { getSessionUser } from '@/lib/session'
import { extractToc } from '@/lib/toc'
import { MarkdownView } from '@/lib/markdown'
import { formatDate } from '@/lib/format'
import { Toc } from '@/components/toc'
import { LikeButton } from '@/components/like-button'
import { CommentSection } from '@/components/comments/comment-section'

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

  return (
    <div className="flex gap-10">
      <article className="min-w-0 flex-1">
        {post.status === 'draft' && (
          <p className="mb-6 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-400">
            草稿预览：本页仅登录用户可见，游客访问会得到 404。
          </p>
        )}
        <header>
          <h1 className="text-3xl font-bold leading-snug">{post.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
            {post.publishedAt && (
              <time dateTime={post.publishedAt.toISOString()}>{formatDate(post.publishedAt)}</time>
            )}
            {post.category && (
              <Link
                href={`/categories/${encodeURIComponent(post.category.slug)}`}
                className="transition-colors hover:text-neutral-800 dark:hover:text-neutral-200"
              >
                {post.category.name}
              </Link>
            )}
            {post.status === 'published' && <span>{post.views + 1} 次阅读</span>}
          </div>
        </header>
        <div className="mt-8">
          <MarkdownView content={post.contentMd} />
        </div>
        <div className="mt-10 flex flex-wrap items-center gap-4 border-t border-neutral-100 pt-6 dark:border-neutral-800">
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((t) => (
                <Link
                  key={t.tag.slug}
                  href={`/tags/${encodeURIComponent(t.tag.slug)}`}
                  className="rounded bg-neutral-100 px-2 py-1 text-xs text-neutral-500 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
                >
                  #{t.tag.name}
                </Link>
              ))}
            </div>
          )}
          <LikeButton postId={post.id} initialLikes={post.likes} />
        </div>
        <CommentSection postId={post.id} comments={comments} loggedIn={Boolean(user)} />
      </article>
      <aside className="hidden w-56 shrink-0 xl:block">
        {toc.length >= 2 && <Toc items={toc} />}
      </aside>
    </div>
  )
}
