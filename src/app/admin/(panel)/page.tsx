import Link from 'next/link'
import { prisma } from '@/lib/db'
import { getDashboardStats, getDailyPvSeries } from '@/lib/stats'
import { formatDate } from '@/lib/format'

export const dynamic = 'force-dynamic'

export const metadata = { title: '总览' }

export default async function AdminDashboardPage() {
  const [stats, series, topPosts, recentComments] = await Promise.all([
    getDashboardStats(),
    getDailyPvSeries(14),
    prisma.post.findMany({
      orderBy: { views: 'desc' },
      take: 10,
      select: { id: true, title: true, slug: true, views: true, likes: true, status: true },
    }),
    prisma.comment.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { post: { select: { title: true, slug: true } } },
    }),
  ])

  const maxPv = Math.max(...series.map((s) => s.pv), 1)
  const totalPv14 = series.reduce((n, s) => n + s.pv, 0)

  const cards = [
    { label: '文章', value: `${stats.publishedTotal}`, sub: `共 ${stats.postTotal} 篇（含草稿）` },
    { label: '总浏览量', value: `${stats.totalViews}`, sub: '所有文章累计 PV' },
    { label: '总点赞', value: `${stats.totalLikes}`, sub: '所有文章累计' },
    {
      label: '评论',
      value: `${stats.commentTotal}`,
      sub: stats.pendingComments > 0 ? `${stats.pendingComments} 条待审` : '暂无待审',
    },
  ]

  return (
    <div className="mx-auto max-w-5xl">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-orange-500">Dashboard</p>
        <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-stone-900 dark:text-white">总览</h1>
        <p className="mt-1 text-sm text-stone-400">
          说说 {stats.momentTotal} 条 · 友链 {stats.friendTotal} 个
        </p>
      </div>

      {/* 总览卡片 */}
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900"
          >
            <p className="text-xs text-stone-400">{card.label}</p>
            <p className="mt-1.5 text-2xl font-bold tracking-tight text-stone-900 dark:text-white">
              {card.value}
            </p>
            <p className="mt-1 text-xs text-stone-400">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* 14 日 PV 趋势 */}
      <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
        <div className="flex items-baseline justify-between">
          <h2 className="font-semibold text-stone-900 dark:text-white">最近 14 天浏览</h2>
          <span className="text-sm text-stone-400">共 {totalPv14} PV</span>
        </div>
        <div className="mt-6 flex h-32 items-end gap-1.5">
          {series.map((point) => (
            <div key={point.date} className="flex h-full flex-1 items-end" title={`${point.date} · ${point.pv} PV`}>
              <div
                className="w-full rounded-t bg-orange-400/70 transition-colors hover:bg-orange-500 dark:bg-orange-500/60"
                style={{ height: `${Math.max((point.pv / maxPv) * 100, 2)}%` }}
              />
            </div>
          ))}
        </div>
        <div className="mt-2 flex gap-1.5 text-[10px] text-stone-400">
          {series.map((point, index) => (
            <span key={point.date} className="flex-1 text-center">
              {index % 3 === 0 ? point.date.slice(5) : ''}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 热门文章 */}
        <div className="rounded-2xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
          <h2 className="font-semibold text-stone-900 dark:text-white">热门文章 TOP10</h2>
          {topPosts.length === 0 ? (
            <p className="mt-4 text-sm text-stone-400">还没有文章。</p>
          ) : (
            <ol className="mt-4 space-y-3">
              {topPosts.map((post, index) => (
                <li key={post.id} className="flex items-baseline gap-3 text-sm">
                  <span
                    className={
                      'w-5 shrink-0 text-center font-bold ' +
                      (index < 3 ? 'text-orange-500' : 'text-stone-300 dark:text-stone-600')
                    }
                  >
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate">
                    {post.status === 'published' ? (
                      <Link
                        href={`/posts/${post.slug}`}
                        target="_blank"
                        className="text-stone-700 transition-colors hover:text-orange-600 dark:text-stone-300 dark:hover:text-orange-400"
                      >
                        {post.title}
                      </Link>
                    ) : (
                      <span className="text-stone-400">{post.title}（草稿）</span>
                    )}
                  </span>
                  <span className="shrink-0 text-xs text-stone-400">
                    {post.views} 阅读 · {post.likes} 赞
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>

        {/* 最近评论 */}
        <div className="rounded-2xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
          <div className="flex items-baseline justify-between">
            <h2 className="font-semibold text-stone-900 dark:text-white">最近评论</h2>
            <Link href="/admin/comments" className="text-xs text-orange-600 hover:underline dark:text-orange-400">
              全部 →
            </Link>
          </div>
          {recentComments.length === 0 ? (
            <p className="mt-4 text-sm text-stone-400">还没有评论。</p>
          ) : (
            <ul className="mt-4 space-y-3.5">
              {recentComments.map((comment) => (
                <li key={comment.id} className="text-sm">
                  <p className="text-stone-700 dark:text-stone-300">
                    <span className="font-medium">{comment.authorName}</span>
                    <span className="text-stone-400"> 在「{comment.post.title}」</span>
                  </p>
                  <p className="mt-0.5 truncate text-stone-500 dark:text-stone-400">{comment.content}</p>
                  <p className="mt-0.5 text-xs text-stone-400">{formatDate(comment.createdAt)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
