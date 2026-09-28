import { prisma } from '@/lib/db'

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

/** 最近 N 天的 PV 序列（缺失日期补 0） */
export async function getDailyPvSeries(days = 14): Promise<PvSeriesPoint[]> {
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

/** 数据看板聚合查询 */
export async function getDashboardStats() {
  const [postAgg, postTotal, publishedTotal, commentTotal, pendingComments, momentTotal, friendTotal] =
    await Promise.all([
      prisma.post.aggregate({ _sum: { views: true, likes: true } }),
      prisma.post.count(),
      prisma.post.count({ where: { status: 'published' } }),
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
