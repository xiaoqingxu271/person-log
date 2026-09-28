import { NextResponse } from 'next/server'
import JSZip from 'jszip'
import { prisma } from '@/lib/db'
import { getSessionUser } from '@/lib/session'

export const runtime = 'nodejs'

/** 导出全部文章为 Markdown（带 front-matter）打包 zip，数据自有的底线 */
export async function GET() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  const posts = await prisma.post.findMany({
    orderBy: { id: 'asc' },
    include: { category: true, tags: { include: { tag: true } } },
  })
  if (posts.length === 0) {
    return NextResponse.json({ error: '还没有可导出的文章' }, { status: 400 })
  }

  const zip = new JSZip()
  const used = new Set<string>()
  for (const post of posts) {
    let filename = post.slug
    let n = 2
    while (used.has(filename)) filename = `${post.slug}-${n++}`
    used.add(filename)

    const frontMatter = [
      '---',
      `title: ${JSON.stringify(post.title)}`,
      `slug: ${JSON.stringify(post.slug)}`,
      `summary: ${JSON.stringify(post.summary)}`,
      `coverUrl: ${JSON.stringify(post.coverUrl)}`,
      `status: ${post.status}`,
      `isPinned: ${post.isPinned}`,
      `category: ${JSON.stringify(post.category?.name ?? '')}`,
      `tags: [${post.tags.map((t) => JSON.stringify(t.tag.name)).join(', ')}]`,
      `publishedAt: ${post.publishedAt?.toISOString() ?? ''}`,
      `createdAt: ${post.createdAt.toISOString()}`,
      '---',
    ].join('\n')
    zip.file(`${filename}.md`, `${frontMatter}\n\n${post.contentMd}\n`)
  }

  const buf = await zip.generateAsync({ type: 'nodebuffer' })
  const date = new Date().toISOString().slice(0, 10)
  return new Response(new Uint8Array(buf), {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="person-log-export-${date}.zip"`,
    },
  })
}
