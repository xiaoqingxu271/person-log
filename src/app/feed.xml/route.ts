import { getSiteConfig } from '@/lib/site-config'
import { prisma } from '@/lib/db'
import { SITE } from '@/lib/site'

export const dynamic = 'force-dynamic'

function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** RSS 2.0 订阅源：最近 20 篇已发布文章 */
export async function GET() {
  const cfg = await getSiteConfig()
  const posts = await prisma.post.findMany({
    where: { status: 'published' },
    orderBy: { publishedAt: 'desc' },
    take: 20,
    include: { category: true },
  })

  const items = posts
    .map((post) => {
      const link = `${SITE.url}/posts/${encodeURIComponent(post.slug)}`
      const pubDate = (post.publishedAt ?? post.createdAt).toUTCString()
      return [
        '    <item>',
        `      <title>${esc(post.title)}</title>`,
        `      <link>${link}</link>`,
        `      <guid isPermaLink="true">${link}</guid>`,
        `      <pubDate>${pubDate}</pubDate>`,
        post.summary ? `      <description>${esc(post.summary)}</description>` : '      <description></description>',
        post.category ? `      <category>${esc(post.category.name)}</category>` : '',
        '    </item>',
      ]
        .filter(Boolean)
        .join('\n')
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(cfg.siteName)}</title>
    <link>${SITE.url}</link>
    <description>${esc(cfg.description)}</description>
    <language>zh-CN</language>
    <atom:link href="${SITE.url}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=600',
    },
  })
}
