import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/db'
import { SITE } from '@/lib/site'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ['', '/archives', '/categories', '/tags', '/about'].map((p) => ({
    url: `${SITE.url}${p}`,
    lastModified: new Date(),
  }))
  try {
    const posts = await prisma.post.findMany({
      where: { status: 'published' },
      select: { slug: true, updatedAt: true },
    })
    return [
      ...staticRoutes,
      ...posts.map((p) => ({
        url: `${SITE.url}/posts/${encodeURIComponent(p.slug)}`,
        lastModified: p.updatedAt,
      })),
    ]
  } catch {
    // 数据库不可用时至少返回静态页面，避免构建/访问报错
    return staticRoutes
  }
}
