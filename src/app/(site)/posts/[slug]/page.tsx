import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { after } from 'next/server'
import { notFound } from 'next/navigation'
import { getPostBySlug, incrementPostViews, listRelatedPosts, getAdjacentPosts } from '@/lib/posts'
import { listCommentsForPost } from '@/lib/comments'
import { getSessionUser } from '@/lib/session'
import { getSiteConfig, getOwnerProfile } from '@/lib/site-config'
import { getBlogStats } from '@/lib/stats'
import { isPostPublic } from '@/lib/post-visibility'
import { extractToc } from '@/lib/toc'
import { MarkdownView } from '@/lib/markdown'
import { formatDate, formatDateTime, formatCount } from '@/lib/format'
import { Toc } from '@/components/toc'
import { LikeButton } from '@/components/like-button'
import { CommentSection } from '@/components/comments/comment-section'
import { ReadingProgress } from '@/components/reading-progress'
import { PostNav } from '@/components/post-nav'
import { AuthorCard } from '@/components/author-card'
import { RelatedCard } from '@/components/related-card'
import { PostShare } from '@/components/post-share'
import { CalendarIcon, EyeIcon, HeartIcon } from '@/components/icons'
import { SITE } from '@/lib/site'

const SITE_URL = SITE.url

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const decoded = decodeURIComponent(slug)
  const [post, user] = await Promise.all([getPostBySlug(decoded), getSessionUser()])
  // 在 metadata 阶段抛 404，流式响应才会带上 404 状态码（否则只是 noindex 的软 404）
  if (!post || (!isPostPublic(post) && !user)) notFound()
  const image = post.coverUrl || '/images/og-default.jpg'
  return {
    title: post.title,
    description: post.summary || undefined,
    openGraph: {
      title: post.title,
      description: post.summary,
      type: 'article',
      publishedTime: post.publishedAt?.toISOString(),
      images: [{ url: image, alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      images: [image],
    },
  }
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPostBySlug(decodeURIComponent(slug))
  const user = await getSessionUser()
  const isPublic = post ? isPostPublic(post) : false
  if (!post || (!isPublic && !user)) notFound()

  // F-22 浏览量：详情页每次访问 +1（草稿/定时预览不计）；响应发出后再写库，不阻塞首屏
  if (isPublic) {
    after(() => incrementPostViews(post.id))
  }
  const [comments, toc, cfg, related, adjacent, stats, owner] = await Promise.all([
    listCommentsForPost(post.id, Boolean(user)),
    extractToc(post.contentMd),
    getSiteConfig(),
    listRelatedPosts(
      post.id,
      post.tags.map((t) => t.tag.slug),
    ),
    getAdjacentPosts(post.id, post.publishedAt?.toISOString() ?? null),
    getBlogStats(),
    getOwnerProfile(),
  ])

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

  const ownerName = owner?.displayName || cfg.siteName
  const ownerAvatar = owner?.avatarUrl || '/images/avatar.jpg'
  const shareUrl = `${SITE_URL}/posts/${encodeURIComponent(post.slug)}`

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto w-full max-w-[1280px] px-3 py-6 sm:px-4 sm:py-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <article className="glass-panel animate-fade-up min-w-0 rounded-3xl p-5 sm:p-8">
            {!isPublic && (
              <p className="mb-6 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-2.5 text-sm text-amber-300">
                {post.status === 'draft'
                  ? '草稿预览：本页仅登录用户可见，游客访问会得到 404。'
                  : `定时发布预览：将于 ${post.publishedAt ? formatDateTime(post.publishedAt) : '指定时间'} 自动上线，当前仅登录用户可见。`}
              </p>
            )}

            <div className="relative aspect-[16/7] overflow-hidden rounded-2xl border border-white/10">
              <Image
                src={post.coverUrl || '/images/aurora-lake.jpg'}
                alt={post.title}
                fill
                preload
                sizes="(max-width: 1024px) 100vw, 860px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-night-900/60 via-transparent to-night-900/20" />
              <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                {post.category && (
                  <Link
                    href={`/categories/${encodeURIComponent(post.category.slug)}`}
                    className="glass-chip inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs text-ice-200 transition-colors hover:border-ice-400/50"
                  >
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="m8 6-6 6 6 6M16 6l6 6-6 6" />
                    </svg>
                    {post.category.name}
                  </Link>
                )}
                {post.tags.slice(0, 2).map((t) => (
                  <Link
                    key={t.tag.slug}
                    href={`/tags/${encodeURIComponent(t.tag.slug)}`}
                    className="glass-chip inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs text-slate-200 transition-colors hover:border-nebula-400/50"
                  >
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                      <circle cx="12" cy="12" r="1.8" fill="currentColor" stroke="none" />
                      <ellipse cx="12" cy="12" rx="10" ry="4.2" />
                      <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(60 12 12)" />
                      <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(120 12 12)" />
                    </svg>
                    {t.tag.name}
                  </Link>
                ))}
              </div>
            </div>

            <header className="mt-6">
              <h1 className="font-serif-cn text-glow text-3xl font-bold leading-snug tracking-tight text-white sm:text-4xl">
                {post.title}
              </h1>
              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-slate-400">
                <span className="inline-flex items-center gap-2">
                  <Image
                    src={ownerAvatar}
                    alt={`${ownerName}的头像`}
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full object-cover ring-2 ring-ice-400/40"
                  />
                  <span className="font-medium text-slate-200">{ownerName}</span>
                </span>
                {post.publishedAt && (
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarIcon className="h-4 w-4" />
                    <time dateTime={post.publishedAt.toISOString()}>{formatDate(post.publishedAt)}</time>
                  </span>
                )}
                {post.status === 'published' && (
                  <>
                    <span className="inline-flex items-center gap-1.5">
                      <EyeIcon className="h-4 w-4" />
                      {formatCount(post.views + 1)}
                      <span className="sr-only">次阅读</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <HeartIcon className="h-4 w-4" />
                      {post.likes}
                      <span className="sr-only">次点赞</span>
                    </span>
                  </>
                )}
                <span className="ml-auto">
                  <LikeButton postId={post.id} initialLikes={post.likes} variant="pill" />
                </span>
              </div>
              <ReadingProgress />
            </header>

            {post.summary && (
              <p className="mt-6 text-[15px] leading-relaxed text-slate-300">{post.summary}</p>
            )}

            <div className="mt-6">
              <MarkdownView content={post.contentMd} />
            </div>

            {post.tags.length > 0 && (
              <div className="mt-10 flex flex-wrap gap-2 border-t border-white/10 pt-6">
                {post.tags.map((t) => (
                  <Link
                    key={t.tag.slug}
                    href={`/tags/${encodeURIComponent(t.tag.slug)}`}
                    className="glass-chip rounded-full px-3 py-1 text-xs text-slate-300 transition-colors hover:border-nebula-400/40 hover:text-nebula-300"
                  >
                    #{t.tag.name}
                  </Link>
                ))}
              </div>
            )}

            <div className="mt-10 flex flex-col gap-5 border-t border-white/10 pt-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="max-w-md">
                <p className="text-xs font-medium text-slate-300">版权声明</p>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
                  本文由{' '}
                  <Link href="/about" className="text-slate-300 underline-offset-2 hover:text-ice-300 hover:underline">
                    {ownerName}
                  </Link>{' '}
                  创作，采用{' '}
                  <a
                    href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh"
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-300 underline-offset-2 hover:text-ice-300 hover:underline"
                  >
                    CC BY-NC-SA 4.0
                  </a>{' '}
                  许可协议。转载请注明出处与原文链接。
                </p>
              </div>
              <PostShare url={shareUrl} title={post.title} />
            </div>

            <PostNav prev={adjacent.prev} next={adjacent.next} />

            <CommentSection postId={post.id} comments={comments} loggedIn={Boolean(user)} />
          </article>

          <aside className="space-y-6 self-start">
            {toc.length >= 2 && (
              <div className="animate-fade-up" style={{ animationDelay: '80ms' }}>
                <Toc items={toc} />
              </div>
            )}
            <div className="animate-fade-up" style={{ animationDelay: '140ms' }}>
              <AuthorCard
                name={ownerName}
                avatar={ownerAvatar}
                tagline={cfg.tagline}
                email={cfg.email}
                stats={{ posts: stats.posts, likes: stats.likes, tags: stats.tags }}
              />
            </div>
            <div className="animate-fade-up" style={{ animationDelay: '200ms' }}>
              <RelatedCard title="相关文章" items={related} moreHref="/archives" />
            </div>
          </aside>
        </div>
      </div>
    </>
  )
}