import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/db'
import { visiblePostWhere } from '@/lib/post-visibility'

const POSTS_TAG = 'posts'

/** 本地时区的今日日期（YYYY-MM-DD） */
export function localToday(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** 每日 PV 自增（随文章详情页访问调用） */
export async function recordDailyPv() {
  const date = localToday()
  await prisma.dailyStat.upsert({
    where: { date },
    update: { pv: { increment: 1 } },
    create: { date, pv: 1 },
  })
}

export interface PvSeriesPoint {
  date: string
  pv: number
}

/** 最近 N 天的 PV 序列（缺失日期补 0）；首页图表每次渲染都会读，缓存 1 分钟 */
export const getDailyPvSeries = cache(
  unstable_cache(
    async (days = 14): Promise<PvSeriesPoint[]> => readDailyPvSeries(days),
    ['daily-pv-series'],
    { tags: ['stats'], revalidate: 60 },
  ),
)

async function readDailyPvSeries(days: number): Promise<PvSeriesPoint[]> {
  const points: PvSeriesPoint[] = []
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    points.push({
      date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
      pv: 0,
    })
  }
  const rows = await prisma.dailyStat.findMany({
    where: { date: { gte: points[0].date } },
  })
  const map = new Map(rows.map((r) => [r.date, r.pv]))
  return points.map((p) => ({ ...p, pv: map.get(p.date) ?? 0 }))
}

/** 前台全站统计：文章/分类/标签/获赞/评论/阅读/写作天数 */
export const getBlogStats = cache(
  unstable_cache(readBlogStats, ['blog-stats'], {
    tags: [POSTS_TAG, 'comments'],
    revalidate: 60,
  }),
)

async function readBlogStats() {
  const [posts, categories, tags, agg, comments, first] = await Promise.all([
    prisma.post.count({ where: visiblePostWhere() }),
    prisma.category.count(),
    prisma.tag.count(),
    prisma.post.aggregate({ where: visiblePostWhere(), _sum: { views: true, likes: true } }),
    prisma.comment.count({ where: { status: 'approved' } }),
    prisma.post.findFirst({
      where: { ...visiblePostWhere(), publishedAt: { not: null } },
      orderBy: { publishedAt: 'asc' },
      select: { publishedAt: true },
    }),
  ])
  const writingDays = first?.publishedAt
    ? Math.max(1, Math.ceil((Date.now() - first.publishedAt.getTime()) / 86400000))
    : 0
  return {
    posts,
    categories,
    tags,
    comments,
    views: agg._sum.views ?? 0,
    likes: agg._sum.likes ?? 0,
    writingDays,
  }
}

export interface SiteCounts {
  posts: number
  categories: number
  tags: number
  views: number
}

/** 首页 Hero 数字：4 个聚合查询缓存后逐请求复用 */
export const getSiteCounts = cache(
  unstable_cache(
    async (): Promise<SiteCounts> => {
      const [posts, categories, tags, agg] = await Promise.all([
        prisma.post.count({ where: visiblePostWhere() }),
        prisma.category.count(),
        prisma.tag.count(),
        prisma.post.aggregate({ where: visiblePostWhere(), _sum: { views: true } }),
      ])
      return { posts, categories, tags, views: agg._sum.views ?? 0 }
    },
    ['site-counts'],
    { tags: [POSTS_TAG], revalidate: 60 },
  ),
)

/** 数据看板聚合查询 */
export async function getDashboardStats() {
  const [postAgg, postTotal, publishedTotal, commentTotal, pendingComments, momentTotal, friendTotal] =
    await Promise.all([
      prisma.post.aggregate({ _sum: { views: true, likes: true } }),
      prisma.post.count(),
      prisma.post.count({ where: visiblePostWhere() }),
      prisma.comment.count(),
      prisma.comment.count({ where: { status: 'pending' } }),
      prisma.moment.count(),
      prisma.friendLink.count({ where: { isVisible: true } }),
    ])

  return {
    postTotal,
    publishedTotal,
    totalViews: postAgg._sum.views ?? 0,
    totalLikes: postAgg._sum.likes ?? 0,
    commentTotal,
    pendingComments,
    momentTotal,
    friendTotal,
  }
}
